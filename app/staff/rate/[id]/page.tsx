"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

interface CorpMember {
  id: string
  surname: string
  other_names: string
  state_code: string
  platoon: string
  qualification: string
  specialization: string
}

interface Ratings {
  appearance: number
  punctuality: number
  discipline: number
  participation: number
  general_conduct: number
}

const ratingOptions = [
  { value: 10, label: "Excellent", color: "text-green-600" },
  { value: 8, label: "Very Good", color: "text-blue-600" },
  { value: 6, label: "Good", color: "text-cyan-600" },
  { value: 4, label: "Fair", color: "text-orange-600" },
  { value: 2, label: "Poor", color: "text-red-600" },
]

const ratingCategories = [
  { key: "appearance", label: "Appearance & Bearing During Camp Activities" },
  { key: "punctuality", label: "Punctuality & Regularity at Camp Activities" },
  { key: "discipline", label: "Discipline & Obedience to Rules" },
  { key: "participation", label: "Participation in Camp Activities" },
  { key: "general_conduct", label: "General Conduct & Attitude" },
]

export default function RatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [user, setUser] = useState<any | null>(null)
  const [corpMember, setCorpMember] = useState<CorpMember | null>(null)
  const [ratings, setRatings] = useState<Ratings>({
    appearance: 0,
    punctuality: 0,
    discipline: 0,
    participation: 0,
    general_conduct: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem("nysc_user")
    if (!storedUser) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    setUser(parsedUser)
    fetchCorpMember(parsedUser)
  }, [id, router])

  const fetchCorpMember = async (currentUser: any) => {
    const supabase = createClient()

    const { data, error } = await supabase.from("corp_members").select("*").eq("id", id).single()

    if (error || !data) {
      setError("Corps member not found")
      setIsLoading(false)
      return
    }

    setCorpMember(data)

    // Load existing ratings if any
    if (currentUser.role === "platoon_instructor" && data.pi_rated) {
      setRatings({
        appearance: data.pi_rating_appearance || 0,
        punctuality: data.pi_rating_punctuality || 0,
        discipline: data.pi_rating_discipline || 0,
        participation: data.pi_rating_participation || 0,
        general_conduct: data.pi_rating_general_conduct || 0,
      })
    } else if (currentUser.role === "man_o_war" && data.mow_rated) {
      setRatings({
        appearance: data.mow_rating_appearance || 0,
        punctuality: data.mow_rating_punctuality || 0,
        discipline: data.mow_rating_discipline || 0,
        participation: data.mow_rating_participation || 0,
        general_conduct: data.mow_rating_general_conduct || 0,
      })
    }

    setIsLoading(false)
  }

  const handleRatingChange = (category: string, value: number) => {
    setRatings((prev) => ({ ...prev, [category]: value }))
  }

  const totalScore = Object.values(ratings).reduce((sum, val) => sum + val, 0)

  const handleSave = async () => {
    // Validate all ratings are filled
    if (Object.values(ratings).some((r) => r === 0)) {
      setError("Please rate all categories before saving")
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const updateData: Record<string, unknown> = {}

      if (user?.role === "platoon_instructor") {
        updateData.pi_rated = true
        updateData.pi_rated_by = user.full_name
        updateData.pi_rating_appearance = ratings.appearance
        updateData.pi_rating_punctuality = ratings.punctuality
        updateData.pi_rating_discipline = ratings.discipline
        updateData.pi_rating_participation = ratings.participation
        updateData.pi_rating_general_conduct = ratings.general_conduct
        updateData.pi_total_score = totalScore
      } else if (user?.role === "man_o_war") {
        updateData.mow_rated = true
        updateData.mow_rated_by = user.full_name
        updateData.mow_rating_appearance = ratings.appearance
        updateData.mow_rating_punctuality = ratings.punctuality
        updateData.mow_rating_discipline = ratings.discipline
        updateData.mow_rating_participation = ratings.participation
        updateData.mow_rating_general_conduct = ratings.general_conduct
        updateData.mow_total_score = totalScore
      }

      const { error: updateError } = await supabase.from("corp_members").update(updateData).eq("id", id)

      if (updateError) throw updateError

      router.push("/staff/dashboard")
    } catch (err) {
      setError("Failed to save ratings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!corpMember) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">{error || "Corps member not found"}</p>
            <Link href="/staff/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/staff/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </motion.div>

        {/* Corp Member Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  {/* User Icon Placeholder */}
                </div>
                <div>
                  <CardTitle>
                    {corpMember.surname} {corpMember.other_names}
                  </CardTitle>
                  <CardDescription>
                    {corpMember.state_code} | Platoon {corpMember.platoon}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Qualification:</span>{" "}
                  <span className="font-medium">{corpMember.qualification}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Specialization:</span>{" "}
                  <span className="font-medium">{corpMember.specialization}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Rating Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <CardTitle>{user?.role === "platoon_instructor" ? "Platoon Instructor" : "Man O'War"} Rating</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                PART II - Award marks for each category
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">{error}</div>}

              <div className="mb-6 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Award of Marks</h4>
                <div className="flex flex-wrap gap-4 text-sm">
                  {ratingOptions.map((opt) => (
                    <span key={opt.value} className={opt.color}>
                      {opt.label} = {opt.value}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {ratingCategories.map((category, index) => (
                  <motion.div
                    key={category.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="space-y-3"
                  >
                    <Label className="text-base">
                      {index + 1}. {category.label}
                    </Label>
                    <RadioGroup
                      value={ratings[category.key as keyof Ratings]?.toString() || ""}
                      onValueChange={(value) => handleRatingChange(category.key, Number.parseInt(value))}
                      className="flex flex-wrap gap-3"
                    >
                      {ratingOptions.map((opt) => (
                        <div key={opt.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt.value.toString()} id={`${category.key}-${opt.value}`} />
                          <Label htmlFor={`${category.key}-${opt.value}`} className={`cursor-pointer ${opt.color}`}>
                            {opt.label} ({opt.value})
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </motion.div>
                ))}
              </div>

              {/* Total Score */}
              <div className="mt-8 p-4 bg-primary/10 rounded-lg flex items-center justify-between">
                <span className="font-semibold text-lg">Total Score:</span>
                <span className="text-2xl font-bold text-primary">{totalScore}/50</span>
              </div>

              {/* Save Button */}
              <div className="mt-6">
                <Button onClick={handleSave} className="w-full" size="lg" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Rating
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
