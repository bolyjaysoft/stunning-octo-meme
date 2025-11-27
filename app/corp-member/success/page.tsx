"use client"

import { useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Home } from "lucide-react"
import Link from "next/link"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const id = searchParams.get("id")

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            >
              <CheckCircle2 className="w-12 h-12 text-primary" />
            </motion.div>
            <CardTitle className="text-2xl">Submission Successful!</CardTitle>
            <CardDescription>Your evaluation form has been submitted</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {id && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Reference ID</p>
                <p className="font-mono font-semibold text-lg">{id.slice(0, 8)}...</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Your form has been submitted successfully. Your platoon instructors and camp commandant will now review
              your information.
            </p>
            <Link href="/">
              <Button className="w-full" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Return to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
