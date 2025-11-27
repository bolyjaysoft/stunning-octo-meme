"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LogOut, Search, UserPlus, Download, Printer, Eye, Trash2 } from "lucide-react"

interface User {
  id: string
  full_name: string
  role: string
  username: string
  platoon: string
}

interface CorpMember {
  id: string
  surname: string
  other_names: string
  state_code: string
  platoon: string
  state_of_origin: string
  qualification: string
  pi_rated: boolean
  mow_rated: boolean
  pi_total_score: number | null
  mow_total_score: number | null
  average_score: number | null
}

interface StaffUser {
  id: string
  username: string
  full_name: string
  role: string
  platoon: string
  is_active: boolean
}

export default function CommandantDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [corpMembers, setCorpMembers] = useState<CorpMember[]>([])
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CorpMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [platoonFilter, setPlatoonFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showAddStaff, setShowAddStaff] = useState(false)
  const [newStaff, setNewStaff] = useState({
    username: "",
    password: "",
    full_name: "",
    role: "platoon_instructor",
    platoon: "",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("nysc_user")
    if (!storedUser) {
      router.push("/admin/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== "commandant") {
      router.push("/admin/login")
      return
    }

    setUser(parsedUser)
    fetchData()
  }, [router])

  const fetchData = async () => {
    const supabase = createClient()

    // Fetch corp members
    const { data: members } = await supabase.from("corp_members").select("*").order("surname")

    if (members) {
      setCorpMembers(members)
      setFilteredMembers(members)
    }

    // Fetch staff users
    const { data: staff } = await supabase.from("users").select("*").neq("role", "commandant").order("full_name")

    if (staff) {
      setStaffUsers(staff)
    }

    setIsLoading(false)
  }

  useEffect(() => {
    let filtered = corpMembers

    if (searchTerm) {
      filtered = filtered.filter(
        (m) =>
          m.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.other_names?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.state_code.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (platoonFilter !== "all") {
      filtered = filtered.filter((m) => m.platoon === platoonFilter)
    }

    setFilteredMembers(filtered)
  }, [searchTerm, platoonFilter, corpMembers])

  const handleLogout = () => {
    localStorage.removeItem("nysc_user")
    router.push("/")
  }

  const handleViewProfile = (memberId: string) => {
    router.push(`/admin/profile/${memberId}`)
  }

  const handleAddStaff = async () => {
    const supabase = createClient()

    const { error } = await supabase.from("users").insert({
      username: newStaff.username,
      password: newStaff.password,
      full_name: newStaff.full_name,
      role: newStaff.role,
      platoon: newStaff.platoon || null,
      is_active: true,
    })

    if (!error) {
      setShowAddStaff(false)
      setNewStaff({ username: "", password: "", full_name: "", role: "platoon_instructor", platoon: "" })
      fetchData()
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    const supabase = createClient()
    await supabase.from("users").delete().eq("id", staffId)
    fetchData()
  }

  const exportCSV = () => {
    const headers = ["State Code", "Surname", "Other Names", "Platoon", "PI Score", "MOW Score", "Average"]
    const rows = filteredMembers.map((m) => [
      m.state_code,
      m.surname,
      m.other_names || "",
      m.platoon,
      m.pi_total_score || "",
      m.mow_total_score || "",
      m.average_score || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `all_corp_members_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const platoonStats = Array.from({ length: 10 }, (_, i) => {
    const num = (i + 1).toString()
    const members = corpMembers.filter((m) => m.platoon === num)
    return {
      platoon: num,
      total: members.length,
      rated: members.filter((m) => m.pi_rated && m.mow_rated).length,
    }
  })

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
            <h1 className="text-xl font-bold text-primary">Camp Commandant Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, <span className="font-semibold">{user?.full_name}</span>
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Corps Members</TabsTrigger>
            <TabsTrigger value="staff">Staff Management</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
            >
              {platoonStats.map((stat) => (
                <Card
                  key={stat.platoon}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => setPlatoonFilter(stat.platoon)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Platoon {stat.platoon}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.total}</div>
                    <p className="text-xs text-muted-foreground">{stat.rated} rated</p>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <Card>
              <CardHeader>
                <CardTitle>Summary Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-primary">{corpMembers.length}</div>
                    <p className="text-sm text-muted-foreground">Total Corps Members</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {corpMembers.filter((m) => m.pi_rated).length}
                    </div>
                    <p className="text-sm text-muted-foreground">PI Rated</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {corpMembers.filter((m) => m.mow_rated).length}
                    </div>
                    <p className="text-sm text-muted-foreground">MOW Rated</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-3xl font-bold text-blue-600">{staffUsers.length}</div>
                    <p className="text-sm text-muted-foreground">Staff Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Corps Members Tab */}
          <TabsContent value="members">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
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
              <Select value={platoonFilter} onValueChange={setPlatoonFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter platoon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platoons</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      Platoon {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
            </motion.div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>State Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Platoon</TableHead>
                      <TableHead>PI Score</TableHead>
                      <TableHead>MOW Score</TableHead>
                      <TableHead>Average</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                            {member.pi_rated ? (
                              <span className="font-semibold">{member.pi_total_score}/50</span>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.mow_rated ? (
                              <span className="font-semibold">{member.mow_total_score}/50</span>
                            ) : (
                              <Badge variant="outline">Pending</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {member.pi_rated && member.mow_rated ? (
                              <span className="font-bold text-primary">
                                {(((member.pi_total_score || 0) + (member.mow_total_score || 0)) / 2).toFixed(1)}
                              </span>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button size="sm" variant="outline" onClick={() => handleViewProfile(member.id)}>
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Staff Users</h2>
              <Button onClick={() => setShowAddStaff(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Platoon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffUsers.map((staff) => (
                      <TableRow key={staff.id}>
                        <TableCell className="font-mono">{staff.username}</TableCell>
                        <TableCell className="font-medium">{staff.full_name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {staff.role === "platoon_instructor"
                              ? "Platoon Instructor"
                              : staff.role === "man_o_war"
                                ? "Man O'War"
                                : staff.role === "soldier"
                                  ? "Soldier"
                                  : staff.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{staff.platoon || "-"}</TableCell>
                        <TableCell>
                          <Badge
                            className={staff.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {staff.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDeleteStaff(staff.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Add Staff Dialog */}
      <Dialog open={showAddStaff} onOpenChange={setShowAddStaff}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Staff User</DialogTitle>
            <DialogDescription>Create a new staff account for instructors or soldiers</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={newStaff.username}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, username: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={newStaff.password}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={newStaff.full_name}
                onChange={(e) => setNewStaff((prev) => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={newStaff.role} onValueChange={(v) => setNewStaff((prev) => ({ ...prev, role: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platoon_instructor">Platoon Instructor</SelectItem>
                  <SelectItem value="man_o_war">Man O'War</SelectItem>
                  <SelectItem value="soldier">Soldier</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(newStaff.role === "platoon_instructor" || newStaff.role === "man_o_war") && (
              <div className="space-y-2">
                <Label>Assigned Platoon</Label>
                <Select
                  value={newStaff.platoon}
                  onValueChange={(v) => setNewStaff((prev) => ({ ...prev, platoon: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platoon" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        Platoon {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStaff(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
