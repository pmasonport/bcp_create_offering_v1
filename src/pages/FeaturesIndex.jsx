import React from 'react'
import { Link } from 'react-router-dom'
import { SERVICES } from '../data/services'

export default function FeaturesIndex() {
  return (
    <div>
      {/* Breadcrumb Area (empty for consistent title positioning) */}
      <div className="h-6 mb-8"></div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-g-900 tracking-tight">Features</h1>
        <p className="text-sm text-g-500 mt-1.5">{SERVICES.length} services</p>
      </div>

      {/* Service List */}
      <div className="mt-4 border border-g-200 rounded-md overflow-hidden bg-white">
        {SERVICES.map((service, index) => (
          <Link
            key={service.id}
            to={`/features/${service.id}`}
            className={`flex items-center justify-between p-4 px-5 transition-colors hover:bg-g-50 ${
              index < SERVICES.length - 1 ? 'border-b border-g-200' : ''
            }`}
          >
            <div className="flex-1">
              <div className="text-sm font-semibold text-g-900">{service.name}</div>
              <div className="text-[13px] text-g-500 mt-0.5">{service.desc}</div>
            </div>
            <div className="flex items-center gap-1 text-xs text-g-400 flex-shrink-0 ml-4">
              <span>{service.featureCount} feature{service.featureCount !== 1 ? 's' : ''}</span>
              <svg className="ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
