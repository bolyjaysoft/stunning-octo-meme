"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Loader2, Save, User, Printer } from "lucide-react"
import Link from "next/link"

interface CorpMember {
  id: string
  surname: string
  other_names: string
  state_code: string
  call_up_no: string
  platoon: string
  state_of_origin: string
  state_of_deployment: string
  period_covered: string
  phone: string
  qualification: string
  specialization: string
  institutions: Array<{ name: string; year: string }>
  pi_rated: boolean
  pi_rated_by: string
  pi_rating_appearance: number
  pi_rating_punctuality: number
  pi_rating_discipline: number
  pi_rating_participation: number
  pi_rating_general_conduct: number
  pi_total_score: number
  mow_rated: boolean
  mow_rated_by: string
  mow_rating_appearance: number
  mow_rating_punctuality: number
  mow_rating_discipline: number
  mow_rating_participation: number
  mow_rating_general_conduct: number
  mow_total_score: number
  soldier_comment: string
  commandant_comment: string
}

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [corpMember, setCorpMember] = useState<CorpMember | null>(null)
  const [commandantComment, setCommandantComment] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem("nysc_user")
    if (!storedUser) {
      router.push("/admin/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (!["commandant", "soldier"].includes(parsedUser.role)) {
      router.push("/admin/login")
      return
    }

    fetchCorpMember()
  }, [id, router])

  const fetchCorpMember = async () => {
    const supabase = createClient()

    const { data, error } = await supabase.from("corp_members").select("*").eq("id", id).single()

    if (data) {
      setCorpMember(data)
      setCommandantComment(data.commandant_comment || "")
    }
    setIsLoading(false)
  }

  const handleSaveComment = async () => {
    setIsSaving(true)
    const supabase = createClient()

    await supabase.from("corp_members").update({ commandant_comment: commandantComment }).eq("id", id)

    setIsSaving(false)
  }

  const handlePrint = () => {
    window.print()
  }

  const averageScore =
    corpMember?.pi_rated && corpMember?.mow_rated
      ? ((corpMember.pi_total_score + corpMember.mow_total_score) / 2).toFixed(1)
      : null

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
            <p className="text-destructive mb-4">Corps member not found</p>
            <Link href="/admin/commandant">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <Link href="/admin/commandant">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Profile
          </Button>
        </motion.div>

        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {corpMember.surname} {corpMember.other_names}
                  </CardTitle>
                  <CardDescription className="text-primary-foreground/80">
                    {corpMember.state_code} | Platoon {corpMember.platoon}
                  </CardDescription>
                </div>
                {averageScore && (
                  <div className="ml-auto text-center">
                    <div className="text-3xl font-bold">{averageScore}</div>
                    <div className="text-sm text-primary-foreground/80">Average Score</div>
                  </div>
                )}
              </div>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Call Up No:</strong> {corpMember.call_up_no}
                </div>
                <div>
                  <strong>State of Origin:</strong> {corpMember.state_of_origin}
                </div>
                <div>
                  <strong>State of Deployment:</strong> {corpMember.state_of_deployment}
                </div>
                <div>
                  <strong>Batch:</strong> {corpMember.period_covered}
                </div>
                <div>
                  <strong>Phone:</strong> {corpMember.phone || "N/A"}
                </div>
                <div>
                  <strong>Qualification:</strong> {corpMember.qualification}
                </div>
                <div className="md:col-span-2">
                  <strong>Specialization:</strong> {corpMember.specialization}
                </div>
                {corpMember.institutions && corpMember.institutions.length > 0 && (
                  <div className="md:col-span-2">
                    <strong>Institutions:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {corpMember.institutions.map((inst, idx) => (
                        <li key={idx}>
                          {inst.name} {inst.year && `(${inst.year})`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ratings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-6"
        >
          {/* PI Ratings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Platoon Instructor Rating</CardTitle>
                {corpMember.pi_rated ? (
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
              {corpMember.pi_rated_by && <CardDescription>Rated by: {corpMember.pi_rated_by}</CardDescription>}
            </CardHeader>
            <CardContent>
              {corpMember.pi_rated ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Appearance</span>
                    <span className="font-semibold">{corpMember.pi_rating_appearance}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Punctuality</span>
                    <span className="font-semibold">{corpMember.pi_rating_punctuality}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discipline</span>
                    <span className="font-semibold">{corpMember.pi_rating_discipline}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participation</span>
                    <span className="font-semibold">{corpMember.pi_rating_participation}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>General Conduct</span>
                    <span className="font-semibold">{corpMember.pi_rating_general_conduct}/10</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-primary">{corpMember.pi_total_score}/50</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Not yet rated</p>
              )}
            </CardContent>
          </Card>

          {/* MOW Ratings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Man O'War Rating</CardTitle>
                {corpMember.mow_rated ? (
                  <Badge className="bg-green-100 text-green-800">Completed</Badge>
                ) : (
                  <Badge variant="outline">Pending</Badge>
                )}
              </div>
              {corpMember.mow_rated_by && <CardDescription>Rated by: {corpMember.mow_rated_by}</CardDescription>}
            </CardHeader>
            <CardContent>
              {corpMember.mow_rated ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Appearance</span>
                    <span className="font-semibold">{corpMember.mow_rating_appearance}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Punctuality</span>
                    <span className="font-semibold">{corpMember.mow_rating_punctuality}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Discipline</span>
                    <span className="font-semibold">{corpMember.mow_rating_discipline}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Participation</span>
                    <span className="font-semibold">{corpMember.mow_rating_participation}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>General Conduct</span>
                    <span className="font-semibold">{corpMember.mow_rating_general_conduct}/10</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold">
                    <span>Total</span>
                    <span className="text-primary">{corpMember.mow_total_score}/50</span>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">Not yet rated</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Commandant Comment */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Commandant's Assessment (Part III)</CardTitle>
              <CardDescription>Provide your final comments and assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Comments</Label>
                <Textarea
                  rows={4}
                  placeholder="Enter your assessment comments..."
                  value={commandantComment}
                  onChange={(e) => setCommandantComment(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveComment} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Comment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
