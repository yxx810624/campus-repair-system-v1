import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { ROLE_HOME } from './lib/constants'
import type { Role } from './types'
import { AdminPage } from './pages/AdminPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { StudentPage } from './pages/StudentPage'

function ProtectedRoute({
  role,
  children,
}: {
  role: Role
  children: ReactNode
}) {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== role) {
    return <Navigate to={ROLE_HOME[session.role]} replace />
  }
  return <>{children}</>
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  if (session) return <Navigate to={ROLE_HOME[session.role]} replace />
  return <>{children}</>
}

function HomeRedirect() {
  const { session } = useAuth()
  if (!session) return <Navigate to="/login" replace />
  return <Navigate to={ROLE_HOME[session.role]} replace />
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnly>
            <RegisterPage />
          </PublicOnly>
        }
      />
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<HomeRedirect />} />
      <Route path="*" element={<HomeRedirect />} />
    </Routes>
  )
}
