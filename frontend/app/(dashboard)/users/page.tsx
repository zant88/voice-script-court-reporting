"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { api } from "@/lib/api"
import { toast } from "sonner"

interface User {
  id: string,
  name: string,
  email: string, 
  location: string,
  role: string,
  isAvailable: boolean
}

export default function UserPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    }catch (err: any) {
      if (err.message.includes("token")) {
        localStorage.removeItem("token");
        router.replace("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user: User) => {
    try {
      if (user.isAvailable) {
        await api.deactivateUser(user.id);
        toast.success("User deactivated");
      }else {
        await api.activateUser(user.id);
        toast.success("User activated");
      }
      fetchUsers();
    }catch (err: any) {
      toast.error(err.message);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.deleteUser(id);
      toast.success("User deleted");
      fetchUsers();
    }catch (err: any) {
      toast.error(err.message)
    }
  }
  if (loading) return <p className="text-muted-foreground">Loading users...</p>

  return (
    <div className="space-y-4>">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Users</h2>
        <Button onClick={() => router.push("/users/new")}>Create User</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">#</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user, i) => (
            <TableRow key={user.id}>
              <TableCell>{i+1}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.location}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${user.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {user.isAvailable ? "Available" : "Unavailable"}
                </span>
              </TableCell>
               <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/users/${user.id}/edit`)}>
                    Edit
                  </Button>
                  {/* <Button variant="outline" size="sm" onClick={() => toggleStatus(user)}>
                    {user.isAvailable ? "Deactivate" : "Activate"}
                  </Button> */}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}