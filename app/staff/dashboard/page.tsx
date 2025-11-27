"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LogOut, Search, Users, CheckCircle, Clock, Download, Printer } from "lucide-react"

interface User {
  id: string
  full_name: string
  role: string
  platoon: string
}

interface CorpMember {
  id: string
  surname: string
  other_names: string
  state_code: string
  platoon: string
  pi_rated: boolean
  mow_rated: boolean
  pi_total_score: number | null
  mow_total_score: number | null
}

export default function StaffDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [corpMembers, setCorpMembers] = useState<CorpMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CorpMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("nysc_user")
    if (!storedUser) {
      router.push("/")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (!["platoon_instructor", "man_o_war"].includes(parsedUser.role)) {
      router.push("/")
      return
    }

    setUser(parsedUser)
    fetchCorpMembers(parsedUser)
  }, [router])

  const fetchCorpMembers = async (currentUser: User) => {
    const supabase = createClient()

    let query = supabase
      .from("corp_members")
      .select("id, surname, other_names, state_code, platoon, pi_rated, mow_rated, pi_total_score, mow_total_score")
      .order("surname")

    // If user has a platoon assigned, filter by it
    if (currentUser.platoon) {
      query = query.eq("platoon", currentUser.platoon)
    }

    const { data, error } = await query

    if (data) {
      setCorpMembers(data)
      setFilteredMembers(data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = corpMembers.filter(
        (m) =>
          m.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.other_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.state_code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredMembers(filtered)
    } else {
      setFilteredMembers(corpMembers)
    }
  }, [searchTerm, corpMembers])

  const handleLogout = () => {
    localStorage.removeItem("nysc_user")
    router.push("/")
  }

  const handleRate = (memberId: string) => {
    router.push(`/staff/rate/${memberId}`)
  }

  const isRated = (member: CorpMember) => {
    if (user?.role === "platoon_instructor") return member.pi_rated
    if (user?.role === "man_o_war") return member.mow_rated
    return false
  }

  const getScore = (member: CorpMember) => {
    if (user?.role === "platoon_instructor") return member.pi_total_score
    if (user?.role === "man_o_war") return member.mow_total_score
    return null
  }

  const exportCSV = () => {
    const headers = ["State Code", "Surname", "Other Names", "Platoon", "Rated", "Score"]
    const rows = filteredMembers.map((m) => [
      m.state_code,
      m.surname,
      m.other_names || "",
      m.platoon,
      isRated(m) ? "Yes" : "No",
      getScore(m) || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `corp_members_${user?.platoon || "all"}_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  const ratedCount = filteredMembers.filter((m) => isRated(m)).length
  const pendingCount = filteredMembers.length - ratedCount

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">NYSC Evaluation</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, <span className="font-semibold">{user?.full_name}</span>
              {user?.platoon && <span> - Platoon {user.platoon}</span>}
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Corps Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{filteredMembers.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{ratedCount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{pendingCount}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or state code..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </motion.div>

        {/* Corps Members Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Platoon</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No corps members found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="font-mono">{member.state_code}</TableCell>
                        <TableCell className="font-medium">
                          {member.surname} {member.other_names}
                        </TableCell>
                        <TableCell>Platoon {member.platoon}</TableCell>
                        <TableCell>
                          {isRated(member) ? (
                            <Badge className="bg-green-100 text-green-800">Rated</Badge>
                          ) : (
                            <Badge variant="outline" className="text-orange-600 border-orange-300">
                              Pending
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {getScore(member) !== null ? (
                            <span className="font-semibold">{getScore(member)}/50</span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            onClick={() => handleRate(member.id)}
                            variant={isRated(member) ? "outline" : "default"}
                          >
                            {isRated(member) ? "View/Edit" : "Rate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}
