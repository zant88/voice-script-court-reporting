interface AuthContextType {
  user: { id: string, name: string, email: string, role: string} | null,
  token: string | null,
  login: (email: string, password: string) => Promise<void>,
  logout: () => void,
  isLoading: boolean
}