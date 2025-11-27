"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, UserCheck } from "lucide-react"
import Link from "next/link"

const INSTRUCTOR_PASSWORD = "instructor2024"

export default function InstructorLoginPage() {
  const router = useRouter()
  const [instructorName, setInstructorName] = useState("")
  const [instructorType, setInstructorType] = useState<"Squad" | "Man O'War" | "">("")
  const [platoon, setPlatoon] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!instructorName || !instructorType || !platoon || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password !== INSTRUCTOR_PASSWORD) {
      setError("Incorrect password")
      return
    }

    // Store instructor info in sessionStorage and redirect to dashboard
    sessionStorage.setItem(
      "instructor",
      JSON.stringify({
        name: instructorName,
        type: instructorType,
        platoon: platoon,
      }),
    )

    router.push("/instructor/dashboard")
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
          <CardHeader className="bg-secondary text-secondary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary-foreground/10 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">Instructor Login</CardTitle>
                <CardDescription className="text-secondary-foreground/90">
                  Squad/Platoon Instructors & Man O'War
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">{error}</div>}

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructorName">Instructor Name *</Label>
                <Input
                  id="instructorName"
                  placeholder="Enter your full name"
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructorType">Instructor Type *</Label>
                <Select
                  value={instructorType}
                  onValueChange={(value: "Squad" | "Man O'War") => setInstructorType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Squad">Squad Instructor</SelectItem>
                    <SelectItem value="Man O'War">Man O'War Instructor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="platoon">Platoon *</Label>
                <Select value={platoon} onValueChange={setPlatoon}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your platoon" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Platoon {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Contact your admin for the password</p>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Access Dashboard
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
