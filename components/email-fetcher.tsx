"use client"

import { CardFooter } from "@/components/ui/card"
import type React from "react"
import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function EmailFetcher() {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [emailResult, setEmailResult] = useState<string | null>(null)
  const [usernameResult, setUsernameResult] = useState<string | null>(null)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isUsernameLoading, setIsUsernameLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsEmailLoading(true)
    setEmailError(null)
    setEmailResult(null)

    const currentAttempt = attempts + 1
    setAttempts(currentAttempt)

    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/fetch-email-data?email=${encodeURIComponent(email)}&_=${timestamp}`)

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`)
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.text()

      if (data.trim().startsWith("<!DOCTYPE html>") || data.trim().startsWith("<html")) {
        throw new Error("Received HTML instead of expected data. Please try again later.")
      }

      let formattedResult = data.trim()

      if (formattedResult.toUpperCase() === "SG") {
        formattedResult = "Account doesn't exist"
      } else if (formattedResult.length === 2 && /^[A-Z]{2}$/.test(formattedResult)) {
        const countryNames: Record<string, string> = {
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
        }

        const countryName = countryNames[formattedResult] || "Unknown Country"
        formattedResult = `${formattedResult} (${countryName})`
      }

      setEmailResult(formattedResult)
    } catch (err) {
      console.error("Fetch error:", err)

      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          setEmailError("Network error: Please check your internet connection and try again.")
        } else {
          setEmailError(err.message)
        }
      } else {
        setEmailError("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setIsEmailLoading(false)
    }
  }

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username) {
      setUsernameError("Please enter a username")
      return
    }

    setIsUsernameLoading(true)
    setUsernameError(null)
    setUsernameResult(null)

    try {
      const timestamp = new Date().getTime()
      const response = await fetch(`/api/fetch-email-data?email=${encodeURIComponent(username)}&_=${timestamp}`)

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""

        if (contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Error: ${response.status} ${response.statusText}`)
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
      }

      const data = await response.text()

      if (data.trim().startsWith("<!DOCTYPE html>") || data.trim().startsWith("<html")) {
        throw new Error("Received HTML instead of expected data. Please try again later.")
      }

      let formattedResult = data.trim()

      if (formattedResult.toUpperCase() === "SG") {
        formattedResult = "Account doesn't exist"
      } else if (formattedResult.length === 2 && /^[A-Z]{2}$/.test(formattedResult)) {
        const countryNames: Record<string, string> = {
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
        }

        const countryName = countryNames[formattedResult] || "Unknown Country"
        formattedResult = `${formattedResult} (${countryName})`
      }

      setUsernameResult(formattedResult)
    } catch (err) {
      console.error("Fetch error:", err)

      if (err instanceof Error) {
        if (err.message.includes("Failed to fetch") || err.message.includes("NetworkError")) {
          setUsernameError("Network error: Please check your internet connection and try again.")
        } else {
          setUsernameError(err.message)
        }
      } else {
        setUsernameError("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setIsUsernameLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Username Section */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 border-none shadow-xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="space-y-4 pb-6">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                TikTok Username Region Fetcher
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Enter a TikTok username to discover its region
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleUsernameSubmit} className="space-y-8">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="@username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isUsernameLoading}
                    className="h-14 px-6 text-lg rounded-xl border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-xl font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-300 relative overflow-hidden shine-effect active:scale-95"
                  disabled={isUsernameLoading}
                >
                  {isUsernameLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Region"
                  )}
                  <span className="absolute top-0 left-0 w-full h-full shine-element"></span>
                </Button>
              </form>

              {usernameError && (
                <Alert
                  variant="destructive"
                  className="mt-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl"
                >
                  <AlertDescription className="text-base">{usernameError}</AlertDescription>
                </Alert>
              )}

              {usernameResult && (
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">Region:</h3>
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
                    <p className="font-mono text-xl font-semibold text-pink-600 dark:text-pink-400">{usernameResult}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Email Section */}
        <div className="flex flex-col h-full">
          <Card className="flex-1 border-none shadow-xl bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
            <CardHeader className="space-y-4 pb-6">
              <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
                TikTok Account Email Region Fetcher
              </CardTitle>
              <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
                Enter a TikTok account email to discover its region
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleEmailSubmit} className="space-y-8">
                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="tiktok@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isEmailLoading}
                    className="h-14 px-6 text-lg rounded-xl border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-pink-500 transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-lg rounded-xl font-medium text-white bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 transition-all duration-300 relative overflow-hidden shine-effect active:scale-95"
                  disabled={isEmailLoading}
                >
                  {isEmailLoading ? (
                    <>
                      <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                      Fetching...
                    </>
                  ) : (
                    "Fetch Region"
                  )}
                  <span className="absolute top-0 left-0 w-full h-full shine-element"></span>
                </Button>
              </form>

              {emailError && (
                <Alert
                  variant="destructive"
                  className="mt-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl"
                >
                  <AlertDescription className="text-base">{emailError}</AlertDescription>
                </Alert>
              )}

              {emailResult && (
                <div className="space-y-4">
                  <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300">Region:</h3>
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto shadow-sm">
                    <p className="font-mono text-xl font-semibold text-pink-600 dark:text-pink-400">{emailResult}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}