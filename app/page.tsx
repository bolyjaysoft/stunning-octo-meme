"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, ClipboardList, Shield, UserCog, Sword } from "lucide-react"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="inline-block p-4 bg-primary rounded-full mb-4"
          >
            <Shield className="w-12 h-12 text-primary-foreground" />
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 text-balance">NYSC Evaluation Platform</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            National Youth Service Corps Performance Report on Corps Members (Orientation Course)
          </p>
          <p className="text-sm text-muted-foreground mt-2">NYSC FORM 2A</p>
        </motion.div>

        {/* Access Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto"
        >
          {/* Corp Members Portal */}
          <motion.div variants={item}>
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full group">
              <CardHeader>
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <CardTitle className="text-xl">Corps Members</CardTitle>
                <CardDescription>Fill out Part I of your evaluation form. No login required.</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/corp-member">
                  <Button className="w-full" size="lg">
                    Access Form
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platoon Instructors Portal */}
          <motion.div variants={item}>
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full group">
              <CardHeader>
                <div className="w-14 h-14 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <ClipboardList className="w-7 h-7 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Platoon Instructors</CardTitle>
                <CardDescription>Rate corps members in your assigned platoon (Part II).</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/staff/login?role=platoon_instructor">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                    Instructor Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Man O'War Portal */}
          <motion.div variants={item}>
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full group">
              <CardHeader>
                <div className="w-14 h-14 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                  <Sword className="w-7 h-7 text-orange-600" />
                </div>
                <CardTitle className="text-xl">Man O'War</CardTitle>
                <CardDescription>Rate corps members on Man O'War activities (Part II).</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/staff/login?role=man_o_war">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700" size="lg">
                    Man O'War Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Soldier/Commandant Portal */}
          <motion.div variants={item}>
            <Card className="border-2 hover:border-primary hover:shadow-lg transition-all h-full group">
              <CardHeader>
                <div className="w-14 h-14 bg-red-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                  <UserCog className="w-7 h-7 text-red-600" />
                </div>
                <CardTitle className="text-xl">Admin Portal</CardTitle>
                <CardDescription>
                  Soldiers & Camp Commandant access for management and final assessment.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/login">
                  <Button className="w-full bg-red-600 hover:bg-red-700" size="lg">
                    Admin Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-16 text-center text-sm text-muted-foreground"
        >
          <p>National Youth Service Corps - Official Evaluation System</p>
          <p className="mt-1">Lagos & Ondo State Orientation Camp</p>
        </motion.div>
      </div>
    </div>
  )
}
