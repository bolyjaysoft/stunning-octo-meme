"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { LogOut, Search, MessageSquare, Download, Printer } from "lucide-react"

interface User {
  id: string
  full_name: string
  role: string
}

interface CorpMember {
  id: string
  surname: string
  other_names: string
  state_code: string
  platoon: string
  soldier_comment: string
}

export default function SoldierDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [corpMembers, setCorpMembers] = useState<CorpMember[]>([])
  const [filteredMembers, setFilteredMembers] = useState<CorpMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [platoonFilter, setPlatoonFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<CorpMember | null>(null)
  const [comment, setComment] = useState("")

  useEffect(() => {
    const storedUser = localStorage.getItem("nysc_user")
    if (!storedUser) {
      router.push("/admin/login")
      return
    }

    const parsedUser = JSON.parse(storedUser)
    if (parsedUser.role !== "soldier") {
      router.push("/admin/login")
      return
    }

    setUser(parsedUser)
    fetchCorpMembers()
  }, [router])

  const fetchCorpMembers = async () => {
    const supabase = createClient()

    const { data } = await supabase
      .from("corp_members")
      .select("id, surname, other_names, state_code, platoon, soldier_comment")
      .order("surname")

    if (data) {
      setCorpMembers(data)
      setFilteredMembers(data)
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

  const handleOpenComment = (member: CorpMember) => {
    setSelectedMember(member)
    setComment(member.soldier_comment || "")
  }

  const handleSaveComment = async () => {
    if (!selectedMember) return

    const supabase = createClient()

    await supabase
      .from("corp_members")
      .update({
        soldier_comment: comment,
        soldier_comment_by: user?.full_name,
      })
      .eq("id", selectedMember.id)

    // Update local state
    setCorpMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? { ...m, soldier_comment: comment } : m)))
    setSelectedMember(null)
  }

  const exportCSV = () => {
    const headers = ["State Code", "Surname", "Other Names", "Platoon", "Soldier Comment"]
    const rows = filteredMembers.map((m) => [
      m.state_code,
      m.surname,
      m.other_names || "",
      m.platoon,
      m.soldier_comment || "",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `soldier_comments_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

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
            <h1 className="text-xl font-bold text-primary">Soldier Dashboard</h1>
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
        {/* Search and Filters */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col md:flex-row gap-4 mb-6">
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

        {/* Corps Members Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle>Corps Members</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>State Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Platoon</TableHead>
                    <TableHead>Comment Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
                          {member.soldier_comment ? (
                            <Badge className="bg-green-100 text-green-800">Commented</Badge>
                          ) : (
                            <Badge variant="outline">No Comment</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => handleOpenComment(member)}>
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {member.soldier_comment ? "Edit" : "Add"} Comment
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

      {/* Comment Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add/Edit Comment</DialogTitle>
            <DialogDescription>
              {selectedMember?.surname} {selectedMember?.other_names} ({selectedMember?.state_code})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Your Comment</Label>
              <Textarea
                rows={4}
                placeholder="Enter your observation or comment about this corps member..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMember(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveComment}>Save Comment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
