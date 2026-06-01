"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { INDONESIAN_CITIES } from "@/lib/constants"
import { toast } from "sonner"

export default function CreateJobPage() {
  const [form, setForm] = useState({
    caseName: "",
    durationMinutes: "",
    assignmentType: "REMOTE",
    location: "",
    reporterRatePerMinute: "",
    editorFlatRate: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await api.createJob({
        caseName: form.caseName,
        durationMinutes: Number(form.durationMinutes),
        assignmentType: form.assignmentType,
        location: form.location,
        reporterRatePerMinute: Number(form.reporterRatePerMinute),
        editorFlatRate: Number(form.editorFlatRate),
      })

      toast.success("Job created successfully")
      router.push("/jobs")
    } catch (err: any) {
      toast.error(err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create Job</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="space-y-2">
              <label className="text-sm font-medium">Case Name</label>
              <Input value={form.caseName} onChange={(e) => setForm({ ...form, caseName: e.target.value })} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (minutes)</label>
                <Input type="number" min="1" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assignment Type</label>
                <select
                  className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                  value={form.assignmentType}
                  onChange={(e) => setForm({ ...form, assignmentType: e.target.value })}
                >
                  <option value="REMOTE">Remote</option>
                  <option value="PHYSICAL">Physical</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <select
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              >
                <option value="">Select city...</option>
                {INDONESIAN_CITIES.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reporter Rate/min</label>
                <Input type="number" min="0" value={form.reporterRatePerMinute} onChange={(e) => setForm({ ...form, reporterRatePerMinute: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Editor Flat Rate</label>
                <Input type="number" min="0" value={form.editorFlatRate} onChange={(e) => setForm({ ...form, editorFlatRate: e.target.value })} required />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Job"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
