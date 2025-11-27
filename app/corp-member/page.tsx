"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Check, Loader2, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Institution {
  name: string
  year: string
}

interface FormData {
  state: string
  stateCode: string
  platoon: string
  callUpNo: string
  surname: string
  otherNames: string
  changeOfName: string
  stateOfOrigin: string
  stateOfDeployment: string
  periodCovered: string
  phone: string
  qualification: string
  specialization: string
  institutions: Institution[]
}

const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
]

export default function CorpMemberForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    state: "",
    stateCode: "",
    platoon: "",
    callUpNo: "",
    surname: "",
    otherNames: "",
    changeOfName: "",
    stateOfOrigin: "",
    stateOfDeployment: "",
    periodCovered: "",
    phone: "",
    qualification: "",
    specialization: "",
    institutions: [{ name: "", year: "" }],
  })
  const [showPreview, setShowPreview] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const fetchSession = async () => {
      const supabase = createClient()
      const { data } = await supabase.from("sessions").select("id").eq("is_active", true).single()
      if (data) setSessionId(data.id)
    }
    fetchSession()
  }, [])

  const handleInputChange = (field: keyof FormData, value: string) => {
    if (field === "state") {
      const prefix = value === "Lagos" ? "LA/25C/" : value === "Ondo" ? "OD/25C/" : ""
      setFormData((prev) => ({ ...prev, [field]: value, stateCode: prefix, stateOfDeployment: value }))
    } else if (field === "callUpNo" && value && !value.startsWith("NYSC/")) {
      setFormData((prev) => ({ ...prev, [field]: "NYSC/" + value.replace(/^NYSC\/?/, "") }))
    } else if (field === "phone") {
      let formatted = value.replace(/[^\d+]/g, "")
      if (formatted && !formatted.startsWith("+234")) {
        formatted = formatted.replace(/^0+/, "").replace(/^\+?234/, "")
        formatted = "+234" + formatted
      }
      setFormData((prev) => ({ ...prev, [field]: formatted }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleInstitutionChange = (index: number, field: keyof Institution, value: string) => {
    const newInstitutions = [...formData.institutions]
    newInstitutions[index] = { ...newInstitutions[index], [field]: value }
    setFormData((prev) => ({ ...prev, institutions: newInstitutions }))
  }

  const addInstitution = () => {
    setFormData((prev) => ({
      ...prev,
      institutions: [...prev.institutions, { name: "", year: "" }],
    }))
  }

  const removeInstitution = (index: number) => {
    if (formData.institutions.length > 1) {
      const newInstitutions = formData.institutions.filter((_, i) => i !== index)
      setFormData((prev) => ({ ...prev, institutions: newInstitutions }))
    }
  }

  const validateStep = (stepNum: number) => {
    setError(null)

    if (stepNum === 1) {
      if (!formData.state) {
        setError("Please select your camp state")
        return false
      }
      const stateCodeRegex = /^(LA|OD)\/25C\/\d{4}$/
      if (!stateCodeRegex.test(formData.stateCode)) {
        setError("State Code must be in format: LA/25C/0000 or OD/25C/0000 (4 digits)")
        return false
      }
      if (!formData.platoon) {
        setError("Please select your platoon")
        return false
      }
    }

    if (stepNum === 2) {
      if (!formData.callUpNo.startsWith("NYSC/")) {
        setError("NYSC Call Up Number must start with NYSC/")
        return false
      }
      if (!formData.surname.trim()) {
        setError("Please enter your surname")
        return false
      }
      if (!formData.stateOfOrigin) {
        setError("Please select your state of origin")
        return false
      }
      if (!formData.periodCovered) {
        setError("Please select your batch")
        return false
      }
      if (formData.phone) {
        const phoneRegex = /^\+234\d{10}$/
        if (!phoneRegex.test(formData.phone)) {
          setError("Phone number must be in format: +234XXXXXXXXXX (10 digits after +234)")
          return false
        }
      }
    }

    if (stepNum === 3) {
      if (!formData.qualification.trim()) {
        setError("Please enter your qualification")
        return false
      }
      if (!formData.specialization.trim()) {
        setError("Please enter your area of specialization")
        return false
      }
    }

    return true
  }

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    setStep(step - 1)
  }

  const handlePreview = () => {
    if (validateStep(3)) {
      setError(null)
      setShowPreview(true)
    }
  }

  const handleSubmitClick = () => {
    setShowPreview(false)
    setShowConfirm(true)
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const supabase = createClient()

      const { data, error: insertError } = await supabase
        .from("corp_members")
        .insert({
          session_id: sessionId,
          state_code: formData.stateCode,
          platoon: formData.platoon,
          call_up_no: formData.callUpNo,
          surname: formData.surname.toUpperCase(),
          other_names: formData.otherNames.toUpperCase() || null,
          change_of_name: formData.changeOfName || null,
          state_of_origin: formData.stateOfOrigin,
          state_of_deployment: formData.stateOfDeployment,
          period_covered: formData.periodCovered,
          phone: formData.phone || null,
          qualification: formData.qualification,
          specialization: formData.specialization,
          institutions: formData.institutions.filter((i) => i.name),
          status: "submitted",
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/corp-member/success?id=${data.id}`)
    } catch (err) {
      console.error("[v0] Error submitting form:", err)
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.")
      setShowConfirm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </motion.div>

        {/* Progress Steps */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && <div className={`w-16 h-1 mx-2 transition-colors ${step > s ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
                <CardTitle className="text-xl">
                  {step === 1 && "Step 1: Camp & Platoon Information"}
                  {step === 2 && "Step 2: Personal Information"}
                  {step === 3 && "Step 3: Educational Details"}
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  PART I - TO BE COMPLETED BY CORPS MEMBERS
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Step 1: Camp & Platoon */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Camp State *</Label>
                      <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                        <SelectTrigger className="text-lg h-12">
                          <SelectValue placeholder="Select camp state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lagos">Lagos</SelectItem>
                          <SelectItem value="Ondo">Ondo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>State Reg (Code) No. *</Label>
                      <Input
                        className="text-lg h-12 font-mono"
                        placeholder={
                          formData.state === "Lagos"
                            ? "LA/25C/0000"
                            : formData.state === "Ondo"
                              ? "OD/25C/0000"
                              : "Select state first"
                        }
                        value={formData.stateCode}
                        onChange={(e) => handleInputChange("stateCode", e.target.value.toUpperCase())}
                      />
                      <p className="text-sm text-muted-foreground">
                        Format: LA/25C/XXXX or OD/25C/XXXX (exactly 4 digits)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Platoon *</Label>
                      <Select value={formData.platoon} onValueChange={(value) => handleInputChange("platoon", value)}>
                        <SelectTrigger className="text-lg h-12">
                          <SelectValue placeholder="Select your platoon" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              Platoon {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Information */}
                {step === 2 && (
                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label>1. NYSC CALL UP NO. *</Label>
                      <Input
                        className="font-mono"
                        placeholder="NYSC/..."
                        value={formData.callUpNo}
                        onChange={(e) => handleInputChange("callUpNo", e.target.value)}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>2. SURNAME *</Label>
                        <Input
                          placeholder="Enter surname"
                          value={formData.surname}
                          onChange={(e) => handleInputChange("surname", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>OTHER NAMES</Label>
                        <Input
                          placeholder="Enter other names"
                          value={formData.otherNames}
                          onChange={(e) => handleInputChange("otherNames", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>3. CHANGE OF NAMES DURING SERVICE YEAR (If any)</Label>
                      <Input
                        placeholder="Leave blank if not applicable"
                        value={formData.changeOfName}
                        onChange={(e) => handleInputChange("changeOfName", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>4. STATE OF ORIGIN *</Label>
                      <Select
                        value={formData.stateOfOrigin}
                        onValueChange={(value) => handleInputChange("stateOfOrigin", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state of origin" />
                        </SelectTrigger>
                        <SelectContent>
                          {nigerianStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>5. STATE OF DEPLOYMENT</Label>
                      <Input value={formData.stateOfDeployment} disabled className="bg-muted" />
                    </div>

                    <div className="space-y-2">
                      <Label>6. PERIOD COVERED BY REPORT: BATCH *</Label>
                      <Select
                        value={formData.periodCovered}
                        onValueChange={(value) => handleInputChange("periodCovered", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Batch A">Batch A</SelectItem>
                          <SelectItem value="Batch B">Batch B</SelectItem>
                          <SelectItem value="Batch C">Batch C</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>7. GSM (PHONE) NO.</Label>
                      <Input
                        type="tel"
                        placeholder="+234XXXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">Format: +234 followed by 10 digits</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Educational Details */}
                {step === 3 && (
                  <div className="space-y-5">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base">HIGHER INSTITUTIONS ATTENDED WITH DATE</Label>
                        <Button type="button" variant="outline" size="sm" onClick={addInstitution}>
                          <Plus className="w-4 h-4 mr-1" /> Add
                        </Button>
                      </div>
                      {formData.institutions.map((inst, index) => (
                        <div key={index} className="flex gap-3 items-start">
                          <div className="flex-1 space-y-2">
                            <Input
                              placeholder="Institution name"
                              value={inst.name}
                              onChange={(e) => handleInstitutionChange(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="w-24">
                            <Input
                              placeholder="Year"
                              value={inst.year}
                              onChange={(e) => handleInstitutionChange(index, "year", e.target.value)}
                            />
                          </div>
                          {formData.institutions.length > 1 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeInstitution(index)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <Label>QUALIFICATION/S *</Label>
                      <Input
                        placeholder="e.g., B.Sc., HND, M.Sc., etc."
                        value={formData.qualification}
                        onChange={(e) => handleInputChange("qualification", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>AREA OF SPECIALISATION *</Label>
                      <Input
                        placeholder="e.g., Computer Science, Engineering, etc."
                        value={formData.specialization}
                        onChange={(e) => handleInputChange("specialization", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-4 pt-8 border-t mt-8">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={prevStep} className="flex-1 bg-transparent">
                      Previous
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={nextStep} className="flex-1">
                      Next Step
                    </Button>
                  ) : (
                    <Button type="button" onClick={handlePreview} className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview & Submit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Preview Your Submission</DialogTitle>
              <DialogDescription>Please review your information before submitting</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3 p-4 bg-muted rounded-lg">
                <div>
                  <strong>Camp State:</strong> {formData.state}
                </div>
                <div>
                  <strong>State Code:</strong> {formData.stateCode}
                </div>
                <div>
                  <strong>Platoon:</strong> {formData.platoon}
                </div>
                <div>
                  <strong>Batch:</strong> {formData.periodCovered}
                </div>
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">Personal Information</h4>
                <div>
                  <strong>NYSC Call Up No:</strong> {formData.callUpNo}
                </div>
                <div>
                  <strong>Name:</strong> {formData.surname.toUpperCase()} {formData.otherNames.toUpperCase()}
                </div>
                {formData.changeOfName && (
                  <div>
                    <strong>Change of Name:</strong> {formData.changeOfName}
                  </div>
                )}
                <div>
                  <strong>State of Origin:</strong> {formData.stateOfOrigin}
                </div>
                <div>
                  <strong>State of Deployment:</strong> {formData.stateOfDeployment}
                </div>
                {formData.phone && (
                  <div>
                    <strong>Phone:</strong> {formData.phone}
                  </div>
                )}
              </div>

              <div className="space-y-2 p-4 border rounded-lg">
                <h4 className="font-semibold">Educational Details</h4>
                <div>
                  <strong>Qualification:</strong> {formData.qualification}
                </div>
                <div>
                  <strong>Specialization:</strong> {formData.specialization}
                </div>
                {formData.institutions.filter((i) => i.name).length > 0 && (
                  <div>
                    <strong>Institutions:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {formData.institutions
                        .filter((i) => i.name)
                        .map((inst, idx) => (
                          <li key={idx}>
                            {inst.name} {inst.year && `(${inst.year})`}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Edit
              </Button>
              <Button onClick={handleSubmitClick}>Confirm & Submit</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Submission</DialogTitle>
              <DialogDescription>
                Are you sure you want to submit this form? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowConfirm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleFinalSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Yes, Submit"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
