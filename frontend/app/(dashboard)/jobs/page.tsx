"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { HugeiconsIcon } from "@hugeicons/react"
import { AddCircleIcon } from "@hugeicons/core-free-icons"

interface Job {
  id: string
  caseName: string
  durationMinutes: number
  assignmentType: string
  location: string
  status: string
  reporter?: { id: string; name: string } | null
  editor?: { id: string; name: string } | null
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<{ role: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem("user")
    if (stored) setCurrentUser(JSON.parse(stored))
  }, [])

  async function fetchJobs() {
    try {
      const data = await api.getJobs()
      setJobs(data)
    } catch (err: any) {
      if (err.message.includes("token") || err.message.includes("401")) {
        localStorage.removeItem("token")
        router.replace("/auth/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Delete this job?")) return
    try {
      await api.deleteJob(id)
      fetchJobs()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const isAdmin = currentUser?.role === "ADMIN"

  if (loading) return <p className="text-muted-foreground">Loading jobs...</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Jobs</h2>
        <Button onClick={() => router.push("/jobs/new")}>
          <HugeiconsIcon icon={AddCircleIcon} size={16} className="mr-1" />
          New Job
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Case Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Editor</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job, i) => (
            <TableRow key={job.id}>
              <TableCell className="text-muted-foreground">{i + 1}</TableCell>
              <TableCell className="font-medium">{job.caseName}</TableCell>
              <TableCell>{job.durationMinutes.toLocaleString()}m</TableCell>
              <TableCell>{job.assignmentType}</TableCell>
              <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                    job.status === "COMPLETED" ? "bg-green-100 text-green-700" :
                    job.status === "REVIEWED" ? "bg-orange-100 text-orange-700" :
                    job.status === "TRANSCRIBED" ? "bg-purple-100 text-purple-700" :
                    job.status === "ASSIGNED" ? "bg-blue-100 text-blue-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                  {job.status}
                </span>
              </TableCell>
              <TableCell>{job.reporter?.name || "—"}</TableCell>
              <TableCell>{job.editor?.name || "—"}</TableCell>
              <TableCell className="italic text-muted-foreground">
                {(() => {
                  const d = new Date(job.createdAt)
                  const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  const time = `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`
                  return `${date} ${time}`
                })()}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/jobs/${job.id}`)}>
                    View
                  </Button>
                  {isAdmin && (
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(job.id)}>
                      Delete
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {jobs.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No jobs found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
