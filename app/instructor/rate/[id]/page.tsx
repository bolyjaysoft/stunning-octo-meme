"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface CorpMember {
  id: string
  state_code: string
  surname: string
  other_names: string
  call_up_no: string
  platoon: string
}

interface InstructorInfo {
  name: string
  type: "Squad" | "Man O'War"
  platoon: string
}

interface RatingData {
  rating_appearance: number
  rating_punctuality: number
  rating_participation: number
  rating_parade: number
  rating_sense_of_duty: number
  rating_respect: number
  rating_team_work: number
  rating_resourcefulness: number
  rating_leadership: number
  rating_discipline: number
  instructor_name: string
  instructor_type: string
}

const ratingOptions = [
  { value: 10, label: "Excellent (10)" },
  { value: 8, label: "Very Good (8)" },
  { value: 6, label: "Good (6)" },
  { value: 4, label: "Fair (4)" },
  { value: 2, label: "Poor (2)" },
]

const ratingCategories = [
  { key: "rating_appearance", label: "1. Appearance, Bearing & Physique" },
  { key: "rating_punctuality", label: "2. Punctuality & Regularity" },
  { key: "rating_participation", label: "3. Camp Civics Knowledge" },
  { key: "rating_parade", label: "4. Civil Orientation" },
  { key: "rating_sense_of_duty", label: "5. Sense of Duty" },
  { key: "rating_respect", label: "6. Initiative & Resourcefulness" },
  { key: "rating_team_work", label: "7. Team Work" },
  { key: "rating_resourcefulness", label: "8. Command & Leadership" },
  { key: "rating_discipline", label: "9. Discipline" },
]

export default function RateCorpMemberPage() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string

  const [instructor, setInstructor] = useState<InstructorInfo | null>(null)
  const [corpMember, setCorpMember] = useState<CorpMember | null>(null)
  const [ratings, setRatings] = useState<RatingData>({
    rating_appearance: 0,
    rating_punctuality: 0,
    rating_participation: 0,
    rating_parade: 0,
    rating_sense_of_duty: 0,
    rating_respect: 0,
    rating_team_work: 0,
    rating_resourcefulness: 0,
    rating_leadership: 0,
    rating_discipline: 0,
    instructor_name: "",
    instructor_type: "",
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if instructor is logged in
    const instructorData = sessionStorage.getItem("instructor")
    if (!instructorData) {
      router.push("/instructor")
      return
    }

    const parsedInstructor = JSON.parse(instructorData)
    setInstructor(parsedInstructor)

    // Fetch corp member details and existing ratings
    fetchData(parsedInstructor)
  }, [memberId, router])

  const fetchData = async (instructorInfo: InstructorInfo) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      const { data: memberData, error: memberError } = await supabase
        .from("corp_members")
        .select("*")
        .eq("id", memberId)
        .single()

      if (memberError) throw memberError
      setCorpMember(memberData)

      if (memberData) {
        setRatings({
          rating_appearance: memberData.rating_appearance || 0,
          rating_punctuality: memberData.rating_punctuality || 0,
          rating_participation: memberData.rating_participation || 0,
          rating_parade: memberData.rating_parade || 0,
          rating_sense_of_duty: memberData.rating_sense_of_duty || 0,
          rating_respect: memberData.rating_respect || 0,
          rating_team_work: memberData.rating_team_work || 0,
          rating_resourcefulness: memberData.rating_resourcefulness || 0,
          rating_leadership: memberData.rating_leadership || 0,
          rating_discipline: memberData.rating_discipline || 0,
          instructor_name: instructorInfo.name,
          instructor_type: instructorInfo.type,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      setError("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRatingChange = (key: keyof Omit<RatingData, "instructor_name" | "instructor_type">, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }))
  }

  const getTotalScore = () => {
    return Object.entries(ratings)
      .filter(([key]) => key.startsWith("rating_"))
      .reduce((sum, [, val]) => (typeof val === "number" ? sum + val : sum), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const ratingPayload = {
        rating_appearance: ratings.rating_appearance,
        rating_punctuality: ratings.rating_punctuality,
        rating_participation: ratings.rating_participation,
        rating_parade: ratings.rating_parade,
        rating_sense_of_duty: ratings.rating_sense_of_duty,
        rating_respect: ratings.rating_respect,
        rating_team_work: ratings.rating_team_work,
        rating_resourcefulness: ratings.rating_resourcefulness,
        rating_leadership: ratings.rating_leadership,
        rating_discipline: ratings.rating_discipline,
        total_score: getTotalScore(),
        instructor_name: instructor!.name,
        instructor_type: instructor!.type,
        status: "rated",
      }

      const { error: updateError } = await supabase.from("corp_members").update(ratingPayload).eq("id", memberId)

      if (updateError) throw updateError

      router.push("/instructor/dashboard")
    } catch (err) {
      console.error("[v0] Error saving rating:", err)
      setError("Failed to save rating")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!corpMember || !instructor) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href="/instructor/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Corp Member Info */}
        <Card className="mb-6">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle>Corps Member Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>State Code:</strong> {corpMember.state_code}
              </div>
              <div>
                <strong>Platoon:</strong> {corpMember.platoon}
              </div>
              <div className="md:col-span-2">
                <strong>Name:</strong> {corpMember.surname} {corpMember.other_names}
              </div>
              <div className="md:col-span-2">
                <strong>NYSC Call Up No:</strong> {corpMember.call_up_no}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Form */}
        <Card>
          <CardHeader className="bg-secondary text-secondary-foreground">
            <CardTitle>PART II - Instructor Rating</CardTitle>
            <CardDescription className="text-secondary-foreground/90">
              {instructor.type} Instructor Assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Award of Marks Section */}
              <div className="space-y-6">
                <div className="border-b pb-2">
                  <h3 className="font-semibold text-lg">Award of Marks</h3>
                  <p className="text-sm text-muted-foreground">
                    Rate the corps member on each category (Maximum score: 10 per category)
                  </p>
                </div>

                {ratingCategories.map((category) => (
                  <div key={category.key} className="space-y-3 p-4 border rounded-lg">
                    <Label className="text-base">{category.label}</Label>
                    <RadioGroup
                      value={ratings[
                        category.key as keyof Omit<RatingData, "instructor_name" | "instructor_type">
                      ].toString()}
                      onValueChange={(value) =>
                        handleRatingChange(
                          category.key as keyof Omit<RatingData, "instructor_name" | "instructor_type">,
                          Number.parseInt(value),
                        )
                      }
                    >
                      <div className="flex flex-wrap gap-4">
                        {ratingOptions.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={option.value.toString()} id={`${category.key}-${option.value}`} />
                            <Label htmlFor={`${category.key}-${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                ))}

                {/* Total Score */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg">Total Score:</span>
                    <span className="text-2xl font-bold text-primary">{getTotalScore()} / 90</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6 border-t">
                <Link href="/instructor/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Rating"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
