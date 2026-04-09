import React from 'react'
import { UserRole } from '../types'

interface LoginPageProps {
  onLogin: (role: UserRole) => void
}

const LoginPage = ({ onLogin }: LoginPageProps) => (
  <main className="page login-page">
    <section className="login-card">
      <h1>Mock Login</h1>
      <p>Choose a role to continue. This is a temporary login screen for frontend development.</p>
      <div className="button-row">
        <button type="button" className="role-button mitarbeiter" onClick={() => onLogin('Mitarbeiter')}>
          Login als Mitarbeiter
        </button>
        <button type="button" className="role-button lernender" onClick={() => onLogin('Lernender')}>
          Login als Lernender
        </button>
      </div>
      <div className="login-hint">
        <strong>API headers:</strong>
        <p>`Content-Type: application/json` and `X-Role: Mitarbeiter` or `X-Role: Lernender`</p>
      </div>
    </section>
  </main>
)

export default LoginPage
