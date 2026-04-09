import React from 'react'
import { UserRole } from '../types'
import RoleBadge from '../components/RoleBadge'

interface DashboardPageProps {
  role: UserRole
  onLogout: () => void
}

const DashboardPage = ({ role, onLogout }: DashboardPageProps) => (
  <main className="page dashboard-page">
    <section className="dashboard-card">
      <div className="dashboard-header">
        <div>
          <p className="support-text">Eingeloggt als</p>
          <RoleBadge role={role} />
        </div>
        <button type="button" className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
      <h1>Raumplaner Frontend</h1>
      <p>Du kannst jetzt mit dem Backend kommunizieren. Für jede Anfrage verwende:</p>
      <ul>
        <li><code>Content-Type: application/json</code></li>
        <li><code>X-Role: {role}</code></li>
      </ul>
      <div className="dashboard-note">
        <strong>Hinweis:</strong> Diese Login-Maske ist nur für die Entwicklung. Microsoft Login wird später integriert.
      </div>
    </section>
  </main>
)

export default DashboardPage
