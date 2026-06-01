"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"

interface DashboardData {
  totalPayout: number
  totalReporterEarnings: number
  totalEditorEarnings: number
  totalJobsCompleted: number
  reporterLeaderboard: { id: string; name: string; totalEarnings: number; jobCount: number }[]
  editorLeaderboard: { id: string; name: string; totalEarnings: number; jobCount: number }[]
  recentJobs: { id: string; caseName: string; reporterName: string | null; editorName: string | null; totalPayout: number; createdAt: string }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-muted-foreground">Loading dashboard...</p>
  if (!data) return <p className="text-muted-foreground">No data available.</p>

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">Rp.{data.totalPayout.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Reporter Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">Rp.{data.totalReporterEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Editor Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">Rp.{data.totalEditorEarnings.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Jobs Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{data.totalJobsCompleted}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Top Reporters</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.reporterLeaderboard.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">{r.jobCount}</TableCell>
                    <TableCell className="text-right">Rp.{r.totalEarnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {data.reporterLeaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No data.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Editors</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Jobs</TableHead>
                  <TableHead className="text-right">Earnings</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.editorLeaderboard.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-right">{r.jobCount}</TableCell>
                    <TableCell className="text-right">Rp.{r.totalEarnings.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {data.editorLeaderboard.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">No data.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Name</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Editor</TableHead>
                <TableHead className="text-right">Payout</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.recentJobs.map((j) => (
                <TableRow key={j.id}>
                  <TableCell className="font-medium">{j.caseName}</TableCell>
                  <TableCell>{j.reporterName || "—"}</TableCell>
                  <TableCell>{j.editorName || "—"}</TableCell>
                  <TableCell className="text-right">Rp.{j.totalPayout.toLocaleString()}</TableCell>
                  <TableCell className="italic text-muted-foreground">
                    {(() => {
                      const d = new Date(j.createdAt)
                      const date = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                      const time = `${String(d.getHours()).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`
                      return `${date} ${time}`
                    })()}
                  </TableCell>
                </TableRow>
              ))}
              {data.recentJobs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">No completed jobs yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
