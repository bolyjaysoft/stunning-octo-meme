"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Users, Search, Download, Printer, FileText } from "lucide-react"
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

interface CommandantInfo {
  name: string
}

interface PlatoonStats {
  platoon: number
  count: number
}

export default function CommandantDashboard() {
  const router = useRouter()
  const [commandant, setCommandant] = useState<CommandantInfo | null>(null)
  const [corpMembers, setCorpMembers] = useState<CorpMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CorpMember[]>([])
  const [platoonStats, setPlatoonStats] = useState<PlatoonStats[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlatoon, setSelectedPlatoon] = useState<string>("all")
  const [selectedState, setSelectedState] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if commandant is logged in
    const commandantData = sessionStorage.getItem("commandant")
    if (!commandantData) {
      router.push("/commandant")
      return
    }

    const parsedCommandant = JSON.parse(commandantData)
    setCommandant(parsedCommandant)

    // Fetch all corp members
    fetchCorpMembers()
  }, [router])

  const fetchCorpMembers = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("corp_members")
        .select("*")
        .order("platoon", { ascending: true })
        .order("surname", { ascending: true })

      if (error) throw error

      setCorpMembers(data || [])
      setFilteredMembers(data || [])

      // Calculate platoon statistics
      const stats = Array.from({ length: 10 }, (_, i) => ({
        platoon: i + 1,
        count: data?.filter((m) => m.platoon === (i + 1).toString()).length || 0,
      }))
      setPlatoonStats(stats)
    } catch (error) {
      console.error("[v0] Error fetching corp members:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    let filtered = corpMembers

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.other_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.state_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.call_up_no.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by platoon
    if (selectedPlatoon !== "all") {
      filtered = filtered.filter((member) => member.platoon === selectedPlatoon)
    }

    // Filter by state
    if (selectedState !== "all") {
      filtered = filtered.filter((member) => member.state === selectedState)
    }

    setFilteredMembers(filtered)
  }, [searchTerm, selectedPlatoon, selectedState, corpMembers])

  const handleLogout = () => {
    sessionStorage.removeItem("commandant")
    router.push("/commandant")
  }

  const exportToCSV = () => {
    const headers = ["State Code", "Name", "Platoon", "State", "NYSC Call Up No", "Phone"]
    const rows = filteredMembers.map((m) => [
      m.state_code,
      `${m.surname} ${m.other_names || ""}`.trim(),
      m.platoon.toString(),
      m.state,
      m.call_up_no,
      m.gsm_no || "",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `corps_members_${selectedPlatoon !== "all" ? `platoon_${selectedPlatoon}` : "all"}.csv`
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  if (!commandant) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/commandant">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Camp Commandant Dashboard</h1>
              <p className="text-sm text-muted-foreground">Super Admin - All Platoons</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        {/* Welcome Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome, {commandant.name}</CardTitle>
            <CardDescription>Overview of all corps members across all platoons</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 px-4 py-3 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Total Members</p>
                  <p className="text-xl font-bold text-primary">{corpMembers.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-secondary/10 rounded-lg">
                <Users className="w-5 h-5 text-secondary" />
                <div>
                  <p className="text-xs text-muted-foreground">Platoons</p>
                  <p className="text-xl font-bold text-secondary">10</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 rounded-lg">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Lagos State</p>
                  <p className="text-xl font-bold text-accent">
                    {corpMembers.filter((m) => m.state === "Lagos").length}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-3 bg-accent/10 rounded-lg">
                <Users className="w-5 h-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Ondo State</p>
                  <p className="text-xl font-bold text-accent">
                    {corpMembers.filter((m) => m.state === "Ondo").length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platoon Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Platoon Distribution</CardTitle>
            <CardDescription>Number of corps members per platoon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {platoonStats.map((stat) => (
                <div
                  key={stat.platoon}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedPlatoon(stat.platoon.toString())}
                >
                  <p className="text-xs text-muted-foreground">Platoon {stat.platoon}</p>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
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
              <Select value={selectedPlatoon} onValueChange={setSelectedPlatoon}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Platoons" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platoons</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      Platoon {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="Lagos">Lagos</SelectItem>
                  <SelectItem value="Ondo">Ondo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Corps Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Corps Members
              {selectedPlatoon !== "all" && ` - Platoon ${selectedPlatoon}`}
              {selectedState !== "all" && ` - ${selectedState} State`}
            </CardTitle>
            <CardDescription>Click on a member to view full profile and provide final assessment</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No corps members found matching your criteria
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Platoon</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>NYSC Call Up No</TableHead>
                      <TableHead>Phone</TableHead>
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
                        <TableCell>{member.platoon}</TableCell>
                        <TableCell>{member.state}</TableCell>
                        <TableCell>{member.call_up_no}</TableCell>
                        <TableCell>{member.gsm_no || "-"}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/commandant/profile/${member.id}`}>
                            <Button size="sm">
                              <FileText className="w-4 h-4 mr-2" />
                              View Profile
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
