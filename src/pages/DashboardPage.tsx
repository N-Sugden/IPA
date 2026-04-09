import React from 'react'
import { UserRole } from '../types'
import RoleBadge from '../components/RoleBadge'

interface DashboardPageProps {
  role: UserRole
  onLogout: () => void
}

const DashboardPage = ({ role, onLogout }: DashboardPageProps) => (
  <>
    <header className="app-header">
      <img src="/logo.png" alt="Logo" className="logo" />
      <div className="user-info">
        <RoleBadge role={role} />
        <button type="button" className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
    <main className="page dashboard-page">
      <section className="dashboard-card">
        <h1>Raumplaner Frontend</h1>
        <div className="dashboard-note">
          <strong>Hinweis:</strong> Diese Login-Maske ist nur für die Entwicklung. Microsoft Login wird später integriert.
        </div>
      </section>
    </main>
  </>
)

export default DashboardPage
