import React, { useEffect } from 'react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  if (!message) return null

  const bgColor = type === 'success' ? 'bg-green-100' : type === 'error' ? 'bg-red-100' : 'bg-blue-100'
  const borderColor = type === 'success' ? 'border-green-300' : type === 'error' ? 'border-red-300' : 'border-blue-300'
  const textColor = type === 'success' ? 'text-green-900' : type === 'error' ? 'text-red-900' : 'text-blue-900'
  const iconBgColor = type === 'success' ? 'bg-green-200' : type === 'error' ? 'bg-red-200' : 'bg-blue-200'
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'

  return (
    <>
      <div className="fixed top-6 right-6 z-50 animate-slide-down">
        <div className={`${bgColor} ${borderColor} border rounded-lg shadow-xl p-4 pr-12 min-w-[320px] max-w-md`}>
          <div className="flex items-center gap-3">
            <span className={`${iconBgColor} ${textColor} w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold`}>
              {icon}
            </span>
            <span className={`text-sm font-medium ${textColor}`}>{message}</span>
          </div>
          <button
            onClick={onClose}
            className={`absolute top-3 right-3 ${textColor} opacity-50 hover:opacity-100 transition-opacity`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </>
  )
}
