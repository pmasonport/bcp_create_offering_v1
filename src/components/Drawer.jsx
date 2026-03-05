import React, { useEffect } from 'react'

export default function Drawer({ content, onClose }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!content) return null

  // Handle both object format { title, subtitle, content } and plain JSX
  const isObjectFormat = content && typeof content === 'object' && 'content' in content
  const title = isObjectFormat ? content.title : null
  const subtitle = isObjectFormat ? content.subtitle : null
  const drawerContent = isObjectFormat ? content.content : content

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-15 z-30"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[440px] bg-white border-l border-g-200 z-40 flex flex-col animate-slide-in">
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-1 text-g-400 hover:text-g-700 transition-colors z-10"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            {/* Header (if title is provided) */}
            {title && (
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-g-900">{title}</h2>
                {subtitle && (
                  <div className="text-xs font-mono text-g-400 mt-1">{subtitle}</div>
                )}
              </div>
            )}

            {/* Content */}
            <div className={title ? '' : 'mt-2'}>
              {drawerContent}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </>
  )
}
