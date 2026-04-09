import React from 'react'
import { UserRole } from '../types'

interface LoginPageProps {
  onLogin: (role: UserRole) => void
}

const LoginPage = ({ onLogin }: LoginPageProps) => (
  <main className="page login-page">
    <section className="login-card">
      <h1>Mock Login</h1>
      <div className="button-row">
        <button type="button" className="role-button" onClick={() => onLogin('Mitarbeiter')}>
          Login als Mitarbeiter
        </button>
        <button type="button" className="role-button" onClick={() => onLogin('Lernender')}>
          Login als Lernender
        </button>
      </div>
    </section>
  </main>
)

export default LoginPage
