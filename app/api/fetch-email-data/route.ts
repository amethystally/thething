import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  try {
    // This is the original external API endpoint
    const url = `https://flask-hello-world-pi-indol.vercel.app/raw/${encodeURIComponent(email)}`

    console.log(`Attempting to fetch from: ${url}`)

    // Add a timeout to the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json, text/plain",
          "User-Agent": "Cloudflare-Worker",
        },
        signal: controller.signal,
        cache: "no-store",
      }).finally(() => clearTimeout(timeoutId))

      if (!response.ok) {
        console.error(`External API error: ${response.status} ${response.statusText}`)
        throw new Error(`Error from external API: ${response.status} ${response.statusText}`)
      }

      // Get the response content type
      const contentType = response.headers.get("content-type") || ""

      // Handle different response types
      if (contentType.includes("application/json")) {
        // If it's JSON, parse it and extract the country code
        const jsonData = await response.json()
        console.log("Received JSON response:", JSON.stringify(jsonData).substring(0, 200))

        // Check if it has the expected structure with country_code
        if (jsonData?.data?.country_code) {
          return new NextResponse(jsonData.data.country_code, {
            headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "no-store",
            },
          })
        } else {
          // Try to extract country_code from the JSON string
          const jsonString = JSON.stringify(jsonData)
          const countryCodeMatch = jsonString.match(/country_code["']?\s*:\s*["']?([A-Z]{2})["']?/i)

          if (countryCodeMatch && countryCodeMatch[1]) {
            return new NextResponse(countryCodeMatch[1], {
              headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "no-store",
              },
            })
          }

          // If we can't find the country code, fall back to the mock data
          throw new Error("Could not extract country code from response")
        }
      } else {
        // If it's not JSON, get the text
        const data = await response.text()
        console.log(`Received text response (first 200 chars): ${data.substring(0, 200)}`)

        // Try to extract country_code from the text
        const countryCodeMatch = data.match(/country_code["']?\s*:\s*["']?([A-Z]{2})["']?/i)

        if (countryCodeMatch && countryCodeMatch[1]) {
          return new NextResponse(countryCodeMatch[1], {
            headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "no-store",
            },
          })
        }

        // Check if it's HTML
        if (data.trim().startsWith("<!DOCTYPE html>") || data.trim().startsWith("<html")) {
          console.log("Received HTML response, attempting to extract country code")

          // Try to extract the country code from the HTML
          const htmlCountryCodeMatch = data.match(/country_code["']?\s*:\s*["']?([A-Z]{2})["']?/i)

          if (htmlCountryCodeMatch && htmlCountryCodeMatch[1]) {
            return new NextResponse(htmlCountryCodeMatch[1], {
              headers: {
                "Content-Type": "text/plain",
                "Cache-Control": "no-store",
              },
            })
          }

          // If we can't extract a country code, fall back to the mock data
          throw new Error("Could not extract country code from HTML response")
        }

        // If it's plain text and looks like a country code, return it directly
        if (data.trim().length === 2 && /^[A-Z]{2}$/.test(data.trim())) {
          return new NextResponse(data.trim(), {
            headers: {
              "Content-Type": "text/plain",
              "Cache-Control": "no-store",
            },
          })
        }

        // If we can't extract a country code, fall back to the mock data
        throw new Error("Could not extract country code from response")
      }
    } catch (fetchError) {
      console.error("Error fetching from external API:", fetchError)
      // Fall back to the mock data API
      throw fetchError // Re-throw to trigger the fallback
    }
  } catch (error) {
    console.error("Error in API route, falling back to mock data:", error)

    // FALLBACK: Use domain-based lookup as a fallback
    try {
      // Extract the domain from the email
      const parts = email.split("@")
      if (parts.length !== 2) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
      }

      const domain = parts[1].toLowerCase()

      // Simple domain-based country code mapping for fallback
      const domainMap: Record<string, string> = {
        "gmail.com": "US",
        "yahoo.com": "US",
        "hotmail.com": "US",
        "outlook.com": "US",
        "icloud.com": "US",
        "aol.com": "US",
        "protonmail.com": "CH",
        "mail.ru": "RU",
        "yandex.ru": "RU",
        "qq.com": "CN",
        "163.com": "CN",
        "126.com": "CN",
        "yahoo.co.jp": "JP",
        "yahoo.co.uk": "GB",
        "hotmail.co.uk": "GB",
        "gmail.co.uk": "GB",
        "web.de": "DE",
        "gmx.de": "DE",
        "yahoo.de": "DE",
        "orange.fr": "FR",
        "free.fr": "FR",
        "yahoo.fr": "FR",
        "libero.it": "IT",
        "yahoo.it": "IT",
        "yahoo.es": "ES",
        "yahoo.com.br": "BR",
        "yahoo.ca": "CA",
        "yahoo.com.au": "AU",
        "yahoo.co.in": "IN",
      }

      // Get country code from domain map or default to US
      let countryCode = domainMap[domain]

      // If domain not found, try to determine from TLD
      if (!countryCode) {
        const tld = domain.split(".").pop()?.toLowerCase()
        const tldMap: Record<string, string> = {
          uk: "GB",
          de: "DE",
          fr: "FR",
          it: "IT",
          es: "ES",
          jp: "JP",
          cn: "CN",
          ru: "RU",
          br: "BR",
          ca: "CA",
          au: "AU",
          in: "IN",
        }

        countryCode = tld ? tldMap[tld] : undefined
      }

      // Default to US if no match found
      if (!countryCode) {
        countryCode = "US"
      }

      console.log(`Fallback: Determined country code ${countryCode} for domain ${domain}`)

      return new NextResponse(countryCode, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        },
      })
    } catch (fallbackError) {
      console.error("Even fallback failed:", fallbackError)
      return NextResponse.json(
        {
          error: `Failed to determine region: ${fallbackError instanceof Error ? fallbackError.message : "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  }
}
