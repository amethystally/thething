document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("email-form")
  const emailInput = document.getElementById("email-input")
  const submitButton = document.getElementById("submit-button")
  const loading = document.getElementById("loading")
  const errorMessage = document.getElementById("error-message")
  const resultContainer = document.getElementById("result-container")
  const resultContent = document.getElementById("result-content")

  // Country code to name mapping
  const countryNames = {
    US: "United States",
    GB: "United Kingdom",
    CA: "Canada",
    AU: "Australia",
    DE: "Germany",
    FR: "France",
    IT: "Italy",
    ES: "Spain",
    JP: "Japan",
    CN: "China",
    RU: "Russia",
    BR: "Brazil",
    IN: "India",
    MX: "Mexico",
    KR: "South Korea",
    CH: "Switzerland",
    BE: "Belgium",
    // Add more as needed
  }

  // Mock database of country codes for common email domains
  const domainCountryMap = {
    // United States
    "gmail.com": "US",
    "yahoo.com": "US",
    "hotmail.com": "US",
    "outlook.com": "US",
    "aol.com": "US",
    "icloud.com": "US",
    "msn.com": "US",
    "live.com": "US",

    // United Kingdom
    "hotmail.co.uk": "GB",
    "gmail.co.uk": "GB",
    "yahoo.co.uk": "GB",
    "outlook.co.uk": "GB",
    "btinternet.com": "GB",
    "sky.com": "GB",
    "virginmedia.com": "GB",

    // Canada
    "yahoo.ca": "CA",
    "gmail.ca": "CA",
    "hotmail.ca": "CA",
    "outlook.ca": "CA",
    "sympatico.ca": "CA",
    "rogers.com": "CA",
    "shaw.ca": "CA",
    "bell.net": "CA",

    // Add more as needed
  }

  // TLD country map for fallback
  const tldCountryMap = {
    uk: "GB", // United Kingdom
    de: "DE", // Germany
    fr: "FR", // France
    it: "IT", // Italy
    es: "ES", // Spain
    jp: "JP", // Japan
    cn: "CN", // China
    ru: "RU", // Russia
    br: "BR", // Brazil
    in: "IN", // India
    mx: "MX", // Mexico
    kr: "KR", // South Korea
    ch: "CH", // Switzerland
    be: "BE", // Belgium
    ca: "CA", // Canada
    au: "AU", // Australia
    // Add more as needed
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = emailInput.value.trim()

    if (!email || !email.includes("@")) {
      showError("Please enter a valid email address")
      return
    }

    // Show loading state
    submitButton.style.display = "none"
    loading.classList.remove("hidden")
    errorMessage.classList.add("hidden")
    resultContainer.classList.add("hidden")

    try {
      // Try to use the API endpoint first
      let result

      try {
        // Add a cache-busting parameter
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/fetch-email-data?email=${encodeURIComponent(email)}&_=${timestamp}`)

        if (response.ok) {
          result = await response.text()
        } else {
          throw new Error("API not available")
        }
      } catch (apiError) {
        console.log("API not available, using client-side fallback")

        // Client-side fallback processing
        const parts = email.split("@")
        if (parts.length !== 2) {
          throw new Error("Invalid email format")
        }

        const domain = parts[1].toLowerCase()

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        // Get the country code from our map
        let countryCode = domainCountryMap[domain]

        if (!countryCode) {
          // For domains not in our map, try to guess based on TLD
          const domainParts = domain.split(".")
          const tld = domainParts[domainParts.length - 1].toLowerCase()

          // Check if the TLD is in our country map
          if (tldCountryMap[tld]) {
            countryCode = tldCountryMap[tld]
          }
          // Check for country-specific second-level domains (like co.uk)
          else if (domainParts.length > 2) {
            const sld = domainParts[domainParts.length - 2].toLowerCase()

            if (sld === "co" || sld === "com" || sld === "ac" || sld === "gov" || sld === "edu") {
              // For domains like example.co.uk, check the TLD (uk)
              if (tldCountryMap[tld]) {
                countryCode = tldCountryMap[tld]
              }
            }
          }

          // If still no match, default to US
          if (!countryCode) {
            countryCode = "US"
          }
        }

        result = countryCode
      }

      // Format the result to be more user-friendly
      let formattedResult = result.trim()

      // If it's a country code, add some context
      if (formattedResult.length === 2 && /^[A-Z]{2}$/.test(formattedResult)) {
        const countryName = countryNames[formattedResult] || "Unknown Country"
        formattedResult = `${formattedResult} (${countryName})`
      }

      // Display the result
      resultContent.textContent = formattedResult
      resultContainer.classList.remove("hidden")
    } catch (error) {
      showError(error.message || "An error occurred while processing your request")
    } finally {
      // Hide loading state
      submitButton.style.display = "block"
      loading.classList.add("hidden")
    }
  })

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.classList.remove("hidden")
  }
})

