"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Save, Printer } from "lucide-react"
import Link from "next/link"

interface CorpMember {
  id: string
  state_code: string
  state: string
  platoon: string
  surname: string
  other_names: string
  call_up_no: string
  institution: string
  qualification: string
  discipline: string
  grade: string
  graduation_year: string
  state_of_deployment: string
  period_covered: string
  gsm_no: string
  address: string
  next_of_kin_name: string
  next_of_kin_address: string
  next_of_kin_phone: string
}

interface CommandantInfo {
  name: string
}

interface CommandantRating {
  id?: string
  general_assessment: string
  support_training_programs: boolean
  signature_date: string
}

export default function CorpMemberProfile() {
  const router = useRouter()
  const params = useParams()
  const memberId = params.id as string

  const [commandant, setCommandant] = useState<CommandantInfo | null>(null)
  const [corpMember, setCorpMember] = useState<CorpMember | null>(null)
  const [squadRatings, setSquadRatings] = useState<any[]>([])
  const [manOWarRatings, setManOWarRatings] = useState<any[]>([])
  const [rating, setRating] = useState<CommandantRating>({
    general_assessment: "",
    support_training_programs: false,
    signature_date: new Date().toISOString().split("T")[0],
  })
  const [existingRating, setExistingRating] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if commandant is logged in
    const commandantData = sessionStorage.getItem("commandant")
    if (!commandantData) {
      router.push("/commandant")
      return
    }

    const parsedCommandant = JSON.parse(commandantData)
    setCommandant(parsedCommandant)

    // Fetch all data
    fetchData(parsedCommandant)
  }, [memberId, router])

  const fetchData = async (commandantInfo: CommandantInfo) => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Fetch corp member details
      const { data: memberData, error: memberError } = await supabase
        .from("corp_members")
        .select("*")
        .eq("id", memberId)
        .single()

      if (memberError) throw memberError
      setCorpMember(memberData)

      // Fetch squad instructor ratings
      const { data: squadData, error: squadError } = await supabase
        .from("squad_instructor_ratings")
        .select("*")
        .eq("corp_member_id", memberId)

      if (squadError && squadError.code !== "PGRST116") throw squadError
      setSquadRatings(squadData || [])

      // Fetch Man O'War ratings
      const { data: mowData, error: mowError } = await supabase
        .from("man_o_war_ratings")
        .select("*")
        .eq("corp_member_id", memberId)

      if (mowError && mowError.code !== "PGRST116") throw mowError
      setManOWarRatings(mowData || [])

      // Fetch existing commandant rating
      const { data: ratingData, error: ratingError } = await supabase
        .from("commandant_ratings")
        .select("*")
        .eq("corp_member_id", memberId)
        .eq("commandant_name", commandantInfo.name)
        .maybeSingle()

      if (ratingError && ratingError.code !== "PGRST116") throw ratingError

      if (ratingData) {
        setExistingRating(ratingData)
        setRating({
          general_assessment: ratingData.general_assessment || "",
          support_training_programs: ratingData.support_training_programs || false,
          signature_date: ratingData.signature_date || new Date().toISOString().split("T")[0],
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      setError("Failed to load data")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateTotalScore = () => {
    let total = 0

    squadRatings.forEach((rating) => {
      total += rating.appearance_bearing_physique || 0
      total += rating.punctuality_regularity || 0
      total += rating.camp_civics_knowledge || 0
      total += rating.civil_orientation || 0
      total += rating.state_of_duty || 0
      total += rating.initiative_resourcefulness || 0
      total += rating.team_work || 0
      total += rating.command_leadership || 0
      total += rating.discipline || 0
    })

    manOWarRatings.forEach((rating) => {
      total += rating.scores_by_man_instructor || 0
    })

    return total
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const supabase = createClient()

      const ratingPayload = {
        corp_member_id: memberId,
        commandant_name: commandant!.name,
        general_assessment: rating.general_assessment,
        support_training_programs: rating.support_training_programs,
        signature_date: rating.signature_date,
      }

      if (existingRating) {
        await supabase.from("commandant_ratings").update(ratingPayload).eq("id", existingRating.id)
      } else {
        await supabase.from("commandant_ratings").insert(ratingPayload)
      }

      router.push("/commandant/dashboard")
    } catch (err) {
      console.error("[v0] Error saving assessment:", err)
      setError("Failed to save assessment")
    } finally {
      setIsSaving(false)
    }
  }

  const exportProfile = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!corpMember || !commandant) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/commandant/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportProfile}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Full Profile Card */}
        <Card className="mb-6">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="text-2xl">Corps Member Full Profile</CardTitle>
            <CardDescription className="text-primary-foreground/90">Complete evaluation record</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                <div>
                  <strong>State Code:</strong> {corpMember.state_code}
                </div>
                <div>
                  <strong>Name:</strong> {corpMember.surname} {corpMember.other_names}
                </div>
                <div>
                  <strong>NYSC Call Up No:</strong> {corpMember.call_up_no}
                </div>
                <div>
                  <strong>Platoon:</strong> {corpMember.platoon}
                </div>
                <div>
                  <strong>State:</strong> {corpMember.state}
                </div>
                <div>
                  <strong>Phone:</strong> {corpMember.gsm_no || "-"}
                </div>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-lg border-b pb-2">Additional Details</h3>
                {corpMember.institution && (
                  <div>
                    <strong>Institution:</strong> {corpMember.institution}
                  </div>
                )}
                {corpMember.qualification && (
                  <div>
                    <strong>Qualification:</strong> {corpMember.qualification}
                  </div>
                )}
                {corpMember.discipline && (
                  <div>
                    <strong>Discipline:</strong> {corpMember.discipline}
                  </div>
                )}
                {corpMember.grade && (
                  <div>
                    <strong>Grade:</strong> {corpMember.grade}
                  </div>
                )}
                {corpMember.graduation_year && (
                  <div>
                    <strong>Graduation Year:</strong> {corpMember.graduation_year}
                  </div>
                )}
                {corpMember.state_of_deployment && (
                  <div>
                    <strong>State of Deployment:</strong> {corpMember.state_of_deployment}
                  </div>
                )}
                {corpMember.period_covered && (
                  <div>
                    <strong>Batch:</strong> {corpMember.period_covered}
                  </div>
                )}
                {corpMember.address && (
                  <div>
                    <strong>Address:</strong> {corpMember.address}
                  </div>
                )}
                {corpMember.next_of_kin_name && (
                  <div>
                    <strong>Next of Kin:</strong> {corpMember.next_of_kin_name}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructor Ratings Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Instructor Ratings Summary</CardTitle>
            <CardDescription>Evaluations from Squad/Platoon Instructors and Man O'War</CardDescription>
          </CardHeader>
          <CardContent>
            {squadRatings.length === 0 && manOWarRatings.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No instructor ratings yet</p>
            ) : (
              <div className="space-y-4">
                {/* Squad Ratings */}
                {squadRatings.map((rating, idx) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">
                          {rating.instructor_type} Instructor: {rating.instructor_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">Platoon {rating.platoon}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {(rating.appearance_bearing_physique || 0) +
                            (rating.punctuality_regularity || 0) +
                            (rating.camp_civics_knowledge || 0) +
                            (rating.civil_orientation || 0) +
                            (rating.state_of_duty || 0) +
                            (rating.initiative_resourcefulness || 0) +
                            (rating.team_work || 0) +
                            (rating.command_leadership || 0) +
                            (rating.discipline || 0)}{" "}
                          / 90
                        </p>
                        <p className="text-xs text-muted-foreground">Total Score</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>Appearance: {rating.appearance_bearing_physique || 0}/10</div>
                      <div>Punctuality: {rating.punctuality_regularity || 0}/10</div>
                      <div>Camp Civics: {rating.camp_civics_knowledge || 0}/10</div>
                      <div>Civil Orientation: {rating.civil_orientation || 0}/10</div>
                      <div>State of Duty: {rating.state_of_duty || 0}/10</div>
                      <div>Initiative: {rating.initiative_resourcefulness || 0}/10</div>
                      <div>Team Work: {rating.team_work || 0}/10</div>
                      <div>Command: {rating.command_leadership || 0}/10</div>
                      <div>Discipline: {rating.discipline || 0}/10</div>
                    </div>
                    {rating.special_contribution && (
                      <div className="mt-3 pt-3 border-t">
                        <strong className="text-sm">Special Contribution:</strong>
                        <p className="text-sm text-muted-foreground mt-1">{rating.special_contribution}</p>
                      </div>
                    )}
                  </div>
                ))}

                {/* Man O'War Ratings */}
                {manOWarRatings.map((rating, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-secondary/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">Man O'War Instructor: {rating.instructor_name}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-secondary">{rating.scores_by_man_instructor || 0} / 80</p>
                        <p className="text-xs text-muted-foreground">Man O'War Score</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Score */}
                <div className="p-6 bg-primary/10 rounded-lg">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">Overall Total Score</h3>
                    <p className="text-4xl font-bold text-primary">{calculateTotalScore()}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Commandant Assessment Form */}
        <Card>
          <CardHeader className="bg-accent text-accent-foreground">
            <CardTitle>PART III - Camp Commandant Assessment</CardTitle>
            <CardDescription className="text-accent-foreground/90">Final evaluation and recommendation</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {error && <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="general_assessment">General Assessment of the Corps Member</Label>
                <Textarea
                  id="general_assessment"
                  rows={6}
                  placeholder="Provide your overall assessment of the corps member's performance during orientation..."
                  value={rating.general_assessment}
                  onChange={(e) => setRating((prev) => ({ ...prev, general_assessment: e.target.value }))}
                />
              </div>

              <div className="space-y-3">
                <Label>Do you support the training of the Corps Member?</Label>
                <RadioGroup
                  value={rating.support_training_programs.toString()}
                  onValueChange={(value) =>
                    setRating((prev) => ({ ...prev, support_training_programs: value === "true" }))
                  }
                >
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id="support-yes" />
                      <Label htmlFor="support-yes" className="cursor-pointer">
                        Yes
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id="support-no" />
                      <Label htmlFor="support-no" className="cursor-pointer">
                        No
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signature_date">Signature Date</Label>
                <input
                  type="date"
                  id="signature_date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={rating.signature_date}
                  onChange={(e) => setRating((prev) => ({ ...prev, signature_date: e.target.value }))}
                />
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <Link href="/commandant/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : existingRating ? "Update Assessment" : "Save Assessment"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
