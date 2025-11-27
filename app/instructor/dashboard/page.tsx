"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, FileText, Download, Printer, Search } from "lucide-react"
import Link from "next/link"

interface CorpMember {
  id: string
  state_code: string
  state: string
  platoon: string
  surname: string
  other_names: string
  call_up_no: string
  gsm_no: string
}

interface InstructorInfo {
  name: string
  type: "Squad" | "Man O'War"
  platoon: string
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<InstructorInfo | null>(null)
  const [corpMembers, setCorpMembers] = useState<CorpMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CorpMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if instructor is logged in
    const instructorData = sessionStorage.getItem("instructor")
    if (!instructorData) {
      router.push("/instructor")
      return
    }

    const parsedInstructor = JSON.parse(instructorData)
    setInstructor(parsedInstructor)

    // Fetch corp members for this platoon
    fetchCorpMembers(parsedInstructor.platoon)
  }, [router])

  const fetchCorpMembers = async (platoon: string) => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("corp_members")
        .select("*")
        .eq("platoon", platoon)
        .order("surname", { ascending: true })

      if (error) throw error
      setCorpMembers(data || [])
      setFilteredMembers(data || [])
    } catch (error) {
      console.error("[v0] Error fetching corp members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = corpMembers.filter(
        (member) =>
          member.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.other_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.state_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.call_up_no.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredMembers(filtered)
    } else {
      setFilteredMembers(corpMembers)
    }
  }, [searchTerm, corpMembers])

  const handleLogout = () => {
    sessionStorage.removeItem("instructor")
    router.push("/instructor")
  }

  const exportToCSV = () => {
    const headers = ["State Code", "Name", "NYSC Call Up No", "Phone", "State"]
    const rows = filteredMembers.map((m) => [
      m.state_code,
      `${m.surname} ${m.other_names || ""}`.trim(),
      m.call_up_no,
      m.gsm_no || "",
      m.state,
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `platoon_${instructor?.platoon}_members.csv`
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  if (!instructor) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/instructor">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Instructor Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                {instructor.type} - Platoon {instructor.platoon}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {instructor.name}</CardTitle>
            <CardDescription>View and rate corps members in your platoon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">Platoon:</span>
                <span className="text-lg font-bold text-primary">{instructor.platoon}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-secondary/10 rounded-lg">
                <span className="text-sm font-medium">Total Members:</span>
                <span className="text-lg font-bold text-secondary">{corpMembers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, state code, or call up number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={exportToCSV}>
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Corps Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Corps Members - Platoon {instructor.platoon}</CardTitle>
            <CardDescription>Click on a member to view details and provide ratings</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No members found matching your search" : "No corps members in this platoon yet"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>NYSC Call Up No</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.map((member) => (
                      <TableRow key={member.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{member.state_code}</TableCell>
                        <TableCell>
                          {member.surname} {member.other_names}
                        </TableCell>
                        <TableCell>{member.call_up_no}</TableCell>
                        <TableCell>{member.gsm_no || "-"}</TableCell>
                        <TableCell>{member.state}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/instructor/rate/${member.id}`}>
                            <Button size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              Rate
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
