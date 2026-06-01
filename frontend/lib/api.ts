const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"

interface ApiOptions extends RequestInit {
  token?: string | null
}

async function request<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...fetchOptions, headers })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || "Something went wrong")
  return json
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export const api = {
  login(email: string, password: string) {
    return request<{ token: string; user: { id: string; name: string; email: string; role: string } }>(
      "/user/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    )
  },

  getUsers() {
    return request<{ id: string; name: string; email: string; role: string; location: string; isAvailable: boolean }[]>(
      "/user",
      { token: getToken() }
    )
  },

  getUser(id: string) {
    return request<{ id: string; name: string; email: string; role: string; location: string; isAvailable: boolean }>(
      `/user/${id}`,
      { token: getToken() }
    )
  },

  createUser(data: { name: string; email: string; password: string; role: string; location: string }) {
    return request("/user", {
      method: "POST",
      body: JSON.stringify(data),
      token: getToken(),
    })
  },

  updateUser(id: string, data: Partial<{ name: string; email: string; role: string; location: string }>) {
    return request(`/user/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token: getToken(),
    })
  },

  deleteUser(id: string) {
    return request(`/user/${id}`, {
      method: "DELETE",
      token: getToken(),
    })
  },

  activateUser(id: string) {
    return request(`/user/${id}/activate`, {
      method: "PATCH",
      token: getToken(),
    })
  },

  deactivateUser(id: string) {
    return request(`/user/${id}/deactivate`, {
      method: "PATCH",
      token: getToken(),
    })
  },

  getJobs() {
    return request<any[]>("/jobs", { token: getToken() })
  },

  getJob(id: string) {
    return request<any>(`/jobs/${id}`, { token: getToken() })
  },

  createJob(data: {
    caseName: string
    durationMinutes: number
    assignmentType: string
    location: string
    reporterRatePerMinute: number
    editorFlatRate: number
  }) {
    return request("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
      token: getToken(),
    })
  },

  updateJob(id: string, data: Partial<{
    caseName: string
    durationMinutes: number
    assignmentType: string
    location: string
    reporterRatePerMinute: number
    editorFlatRate: number
  }>) {
    return request(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token: getToken(),
    })
  },

  deleteJob(id: string) {
    return request(`/jobs/${id}`, {
      method: "DELETE",
      token: getToken(),
    })
  },

  assignReporter(jobId: string, reporterId: string) {
    return request(`/jobs/${jobId}/assign-reporter`, {
      method: "POST",
      body: JSON.stringify({ reporterId }),
      token: getToken(),
    })
  },

  assignEditor(jobId: string, editorId: string) {
    return request(`/jobs/${jobId}/assign-editor`, {
      method: "POST",
      body: JSON.stringify({ editorId }),
      token: getToken(),
    })
  },

  transcribeJob(jobId: string, transcriptionResult: string) {
    return request(`/jobs/${jobId}/transcribe`, {
      method: "POST",
      body: JSON.stringify({ transcriptionResult }),
      token: getToken(),
    })
  },

  reviewJob(jobId: string, transcriptionResult: string) {
    return request(`/jobs/${jobId}/review`, {
      method: "POST",
      body: JSON.stringify({ transcriptionResult }),
      token: getToken(),
    })
  },

  completeJob(jobId: string) {
    return request(`/jobs/${jobId}/complete`, {
      method: "POST",
      token: getToken(),
    })
  },

  toggleMyAvailability() {
    return request("/user/me/availability", {
      method: "PATCH",
      token: getToken(),
    })
  },

  getDashboard() {
    return request<{
      totalPayout: number
      totalReporterEarnings: number
      totalEditorEarnings: number
      totalJobsCompleted: number
      reporterLeaderboard: { id: string; name: string; totalEarnings: number; jobCount: number }[]
      editorLeaderboard: { id: string; name: string; totalEarnings: number; jobCount: number }[]
      recentJobs: { id: string; caseName: string; reporterName: string | null; editorName: string | null; totalPayout: number; createdAt: string }[]
    }>("/jobs/dashboard", { token: getToken() })
  },
}
