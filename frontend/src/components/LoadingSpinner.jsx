import React from 'react'

const LoadingSpinner = ({ size = 16 }) => (
  <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#cbd5e1" strokeWidth="4" opacity="0.25" />
    <path d="M22 12a10 10 0 00-10-10" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export default LoadingSpinner
