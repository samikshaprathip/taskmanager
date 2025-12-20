import React from 'react'
import { User as UserIcon } from 'lucide-react'

// Shows user avatar if provided, otherwise falls back to an initial or icon
const Avatar = ({ size = 32, className = '', src, name }) => {
  const iconSize = Math.max(12, Math.round(size * 0.5))
  const initial = (name || '').trim().charAt(0).toUpperCase()

  if (src) {
    return (
      <img
        src={src}
        alt={name || 'avatar'}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-label="Anonymous avatar"
    >
      {initial ? (
        <span style={{ fontSize: Math.max(12, Math.round(size * 0.45)), fontWeight: 700 }}>{initial}</span>
      ) : (
        <UserIcon size={iconSize} className="text-white" />
      )}
    </div>
  )
}

export default Avatar
