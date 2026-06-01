"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface TranscriptionVersion {
  id: string
  content: string
  role: string
  createdAt: string
  submittedBy: { id: string; name: string; role: string }
}

interface JobDetail {
  id: string
  caseName: string
  durationMinutes: number
  assignmentType: string
  location: string
  status: string
  reporterRatePerMinute: number
  editorFlatRate: number
  transcriptionResult?: string | null
  reporter?: { id: string; name: string } | null
  editor?: { id: string; name: string } | null
  creator?: { id: string; name: string } | null
  createdAt: string
  transcriptionVersions?: TranscriptionVersion[]
}

export default function JobDetailPage() {
  const [job, setJob] = useState<JobDetail | null>(null)
  const [editors, setEditors] = useState<{ id: string; name: string; isAvailable: boolean }[]>([])
  const [reporters, setReporters] = useState<{ id: string; name: string; location: string; isAvailable: boolean }[]>([])
  const [selectedEditor, setSelectedEditor] = useState("")
  const [selectedReporter, setSelectedReporter] = useState("")
  const [transcriptionText, setTranscriptionText] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null)
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setCurrentUser(JSON.parse(stored))
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [jobData, users] = await Promise.all([
          api.getJob(params.id as string) as Promise<JobDetail>,
          api.getUsers(),
        ])
        setJob(jobData)
        setTranscriptionText(jobData.transcriptionResult || "")
        setEditors(users.filter((u) => u.role === "EDITOR" && u.isAvailable))
        setReporters(users.filter((u) => u.role === "REPORTER" && u.isAvailable))
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [params.id])

  const isAdmin = currentUser?.role === "ADMIN"
  const isAssignedReporter = currentUser?.id === job?.reporter?.id
  const isAssignedEditor = currentUser?.id === job?.editor?.id
  const availableReporters = job?.assignmentType === "PHYSICAL"
    ? reporters.filter((r) => r.location === job?.location)
    : reporters

  async function handleAssignEditor() {
    if (!selectedEditor) return
    try {
      const updated = await api.assignEditor(params.id as string, selectedEditor) as JobDetail
      setJob(updated)
      toast.success("Editor assigned")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleAssignReporter() {
    if (!selectedReporter) return
    try {
      const updated = await api.assignReporter(params.id as string, selectedReporter) as JobDetail
      setJob(updated)
      toast.success("Reporter assigned")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleTranscribe() {
    if (!transcriptionText.trim()) return
    try {
      const updated = await api.transcribeJob(params.id as string, transcriptionText) as JobDetail
      setJob(updated)
      setTranscriptionText(updated.transcriptionResult || "")
      toast.success("Transcription submitted")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleReview() {
    if (!transcriptionText.trim()) return
    try {
      const updated = await api.reviewJob(params.id as string, transcriptionText) as JobDetail
      setJob(updated)
      setTranscriptionText(updated.transcriptionResult || "")
      toast.success("Review submitted")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  async function handleComplete() {
    if (!confirm("Complete this job? This will generate payment.")) return
    try {
      const result = await api.completeJob(params.id as string) as { updatedJob: JobDetail }
      setJob(result.updatedJob)
      toast.success("Job completed and payment generated")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading...</p>
  if (error) return <p className="text-destructive">{error}</p>
  if (!job) return <p className="text-muted-foreground">Job not found.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{job.caseName}</h2>
        <Button variant="outline" onClick={() => router.push("/jobs")}>Back to Jobs</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{job.durationMinutes.toLocaleString()} min</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
              job.status === "COMPLETED" ? "bg-green-100 text-green-700" :
              job.status === "REVIEWED" ? "bg-orange-100 text-orange-700" :
              job.status === "TRANSCRIBED" ? "bg-purple-100 text-purple-700" :
              job.status === "ASSIGNED" ? "bg-blue-100 text-blue-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {job.status}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Type</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{job.assignmentType}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{job.location}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Reporter</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{job.reporter?.name || "Not assigned"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{job.editor?.name || "Not assigned"}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Reporter Rate</p>
              <p className="text-lg font-semibold">Rp.{job.reporterRatePerMinute.toLocaleString()}/min</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Editor Flat Rate</p>
              <p className="text-lg font-semibold">Rp.{job.editorFlatRate.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transcription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {job.status === "ASSIGNED" && isAssignedReporter ? (
            <>
              <textarea
                className="min-h-[200px] w-full rounded-lg border border-input bg-background p-3 text-sm"
                placeholder="Enter transcription result..."
                value={transcriptionText}
                onChange={(e) => setTranscriptionText(e.target.value)}
              />
              <Button onClick={handleTranscribe} disabled={!transcriptionText.trim()}>
                Submit Transcription
              </Button>
            </>
          ) : job.status === "TRANSCRIBED" && isAssignedEditor ? (
            <>
              <label className="text-xs font-medium text-muted-foreground">Edit and submit the reviewed transcription:</label>
              <textarea
                className="min-h-[200px] w-full rounded-lg border border-input bg-background p-3 text-sm"
                placeholder="Edit transcription..."
                value={transcriptionText}
                onChange={(e) => setTranscriptionText(e.target.value)}
              />
              <Button onClick={handleReview} disabled={!transcriptionText.trim()}>
                Submit Review
              </Button>
            </>
          ) : job.transcriptionResult ? (
            <div className="rounded-lg border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
              {job.transcriptionResult}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not yet transcribed.</p>
          )}
        </CardContent>
      </Card>

      {job.transcriptionVersions && job.transcriptionVersions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Audit Trail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {job.transcriptionVersions.map((version, i) => (
              <div key={version.id} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    v{i + 1} — submitted by <strong>{version.submittedBy.name}</strong> ({version.role})
                  </span>
                  <span>{new Date(version.createdAt).toLocaleString()}</span>
                </div>
                <div className="text-sm whitespace-pre-wrap">{version.content}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isAdmin && (job.status === "REVIEWED" || !job.reporter || !job.editor) && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!job.reporter && (
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Assign Reporter</label>
                  <select
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                    value={selectedReporter}
                    onChange={(e) => setSelectedReporter(e.target.value)}
                  >
                    <option value="">Select reporter...</option>
                    {availableReporters.map((r) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAssignReporter} disabled={!selectedReporter}>Assign</Button>
              </div>
            )}
            {!job.editor && (
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Assign Editor</label>
                  <select
                    className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                    value={selectedEditor}
                    onChange={(e) => setSelectedEditor(e.target.value)}
                  >
                    <option value="">Select editor...</option>
                    {editors.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <Button onClick={handleAssignEditor} disabled={!selectedEditor}>Assign</Button>
              </div>
            )}
            {job.status === "REVIEWED" && (
              <Button onClick={handleComplete} variant="default">
                Complete Job & Generate Payment
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
