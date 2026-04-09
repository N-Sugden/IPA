import React, { useState } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { getStoredRole, login, logout } from './services/auth'
import { UserRole } from './types'

const App = () => {
  const [role, setRole] = useState<UserRole | null>(() => getStoredRole())

  const handleLogin = (nextRole: UserRole) => {
    login(nextRole)
    setRole(nextRole)
  }

  const handleLogout = () => {
    logout()
    setRole(null)
  }

  return (
    <div className="app-shell">
      {role ? (
        <DashboardPage role={role} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </div>
  )
}

export default App
