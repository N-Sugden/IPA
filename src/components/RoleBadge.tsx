import React from 'react'
import { UserRole } from '../types'

interface RoleBadgeProps {
  role: UserRole
}

const RoleBadge = ({ role }: RoleBadgeProps) => (
  <span className={`role-badge ${role === 'Mitarbeiter' ? 'employee' : 'learner'}`}>
    {role}
  </span>
)

export default RoleBadge
