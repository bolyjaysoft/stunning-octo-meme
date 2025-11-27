"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Shield } from "lucide-react"
import Link from "next/link"

const COMMANDANT_PASSWORD = "commandant2024"

export default function CommandantLoginPage() {
  const router = useRouter()
  const [commandantName, setCommandantName] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!commandantName || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password !== COMMANDANT_PASSWORD) {
      setError("Incorrect password")
      return
    }

    // Store commandant info in sessionStorage and redirect to dashboard
    sessionStorage.setItem(
      "commandant",
      JSON.stringify({
        name: commandantName,
      }),
    )

    router.push("/commandant/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="bg-accent text-accent-foreground">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent-foreground/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Camp Commandant</CardTitle>
                <CardDescription className="text-accent-foreground/90">Super Admin Access</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commandantName">Commandant Name *</Label>
                <Input
                  id="commandantName"
                  placeholder="Enter your full name"
                  value={commandantName}
                  onChange={(e) => setCommandantName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Secure access for camp commandant only</p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Access Admin Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
