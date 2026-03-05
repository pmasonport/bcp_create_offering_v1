import React from 'react'

export default function SelectCard({ icon, title, description, selected, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        p-5 border rounded cursor-pointer transition-all
        ${selected
          ? 'border-blue border-[1.5px] bg-blue-bg'
          : 'border-g-200 bg-white hover:border-g-300 hover:bg-g-50'
        }
      `}
    >
      {icon && <div className="text-xl mb-2">{icon}</div>}
      <div className="text-[13px] font-semibold text-g-900">{title}</div>
      <div className="text-xs text-g-500 mt-1 leading-relaxed">{description}</div>
    </div>
  )
}
