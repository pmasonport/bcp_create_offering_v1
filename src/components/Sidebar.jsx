import React from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar({ environment, onEnvironmentChange }) {
  const location = useLocation()

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="fixed top-12 left-0 bottom-0 w-[200px] border-r border-g-200 bg-white z-10 overflow-y-auto py-4">
      {/* Environment Dropdown */}
      <div className="px-5 mb-4">
        <div className="relative">
          <select
            value={environment}
            onChange={(e) => onEnvironmentChange(e.target.value)}
            className="w-full pl-6 pr-8 py-2 text-[13px] border border-g-200 rounded bg-white appearance-none cursor-pointer"
          >
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
          {/* Colored dot indicator */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <div className={`w-1.5 h-1.5 rounded-full ${
              environment === 'staging' ? 'bg-orange-500' : 'bg-blue'
            }`} />
          </div>
          {/* Dropdown arrow */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Catalog Section */}
      <div className="mb-1">
        <button className="w-full flex items-center gap-2 px-5 py-[7px] text-[13px] font-medium text-g-500 hover:text-g-700 hover:bg-g-50 transition-all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>Catalog</span>
          <svg className="ml-auto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div className="mt-0">
          <Link
            to="/"
            className={`block px-5 pl-10 py-[6px] text-[13px] ${
              isActive('/') && !isActive('/features') && !isActive('/meters')
                ? 'text-blue bg-blue-bg font-medium'
                : 'text-g-500 hover:text-g-700 hover:bg-g-50'
            } transition-all`}
          >
            Offerings
          </Link>
          <Link
            to="/features"
            className={`block px-5 pl-10 py-[6px] text-[13px] ${
              isActive('/features')
                ? 'text-blue bg-blue-bg font-medium'
                : 'text-g-500 hover:text-g-700 hover:bg-g-50'
            } transition-all`}
          >
            Features
          </Link>
          <Link
            to="/meters"
            className={`block px-5 pl-10 py-[6px] text-[13px] ${
              isActive('/meters')
                ? 'text-blue bg-blue-bg font-medium'
                : 'text-g-500 hover:text-g-700 hover:bg-g-50'
            } transition-all`}
          >
            Meters
          </Link>
        </div>
      </div>

      {/* Pricing Playground */}
      <Link
        to="/playground/pricing"
        className={`w-full flex items-center gap-2 px-5 py-[7px] text-[13px] font-medium ${
          isActive('/playground')
            ? 'text-blue bg-blue-bg'
            : 'text-g-500 hover:text-g-700 hover:bg-g-50'
        } transition-all`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <span>Pricing Playground</span>
      </Link>

      {/* Reporting (disabled) */}
      <button
        disabled
        className="w-full flex items-center gap-2 px-5 py-[7px] text-[13px] font-medium text-g-300 cursor-default"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"></line>
          <line x1="18" y1="20" x2="18" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="16"></line>
        </svg>
        <span>Reporting</span>
      </button>
    </div>
  )
}
