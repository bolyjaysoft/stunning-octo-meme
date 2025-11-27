"use client"

import type React from "react"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, ClipboardList, Sword } from "lucide-react"
import Link from "next/link"

function StaffLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role") || "platoon_instructor"

  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const roleConfig = {
    platoon_instructor: {
      title: "Platoon Instructor Login",
      description: "Access your platoon dashboard to rate corps members",
      icon: ClipboardList,
      color: "blue",
    },
    man_o_war: {
      title: "Man O'War Login",
      description: "Access dashboard to rate corps members on Man O'War activities",
      icon: Sword,
      color: "orange",
    },
  }

  const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.platoon_instructor
  const Icon = config.icon

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .eq("role", role)
        .eq("is_active", true)
        .single()

      if (userError || !user) {
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      // Store user info in localStorage
      localStorage.setItem("nysc_user", JSON.stringify(user))

      router.push(`/staff/dashboard`)
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.1 }}
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                config.color === "blue" ? "bg-blue-500/10" : "bg-orange-500/10"
              }`}
            >
              <Icon className={`w-8 h-8 ${config.color === "blue" ? "text-blue-600" : "text-orange-600"}`} />
            </motion.div>
            <CardTitle>{config.title}</CardTitle>
            <CardDescription>{config.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md text-sm">{error}</div>}

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  config.color === "blue" ? "bg-blue-600 hover:bg-blue-700" : "bg-orange-600 hover:bg-orange-700"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              Contact your camp commandant if you need login credentials.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function StaffLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StaffLoginContent />
    </Suspense>
  )
}
