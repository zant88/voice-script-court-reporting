"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { api } from "@/lib/api"
import { INDONESIAN_CITIES } from "@/lib/constants"
import { toast } from "sonner"

export default function CreateUserPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "REPORTER", location: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await api.createUser(form)
      toast.success("User created")
      router.push("/users")
    } catch (err: any) {
      toast.error(err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="REPORTER">Reporter</option>
                <option value="EDITOR">Editor</option>
              </select>
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
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}