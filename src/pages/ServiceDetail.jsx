import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { SERVICES, SERVICE_FEATURES } from '../data/services'

export default function ServiceDetail({ onOpenDrawer }) {
  const { serviceId } = useParams()
  const service = SERVICES.find(s => s.id === serviceId)

  if (!service) {
    return (
      <div>
        <p className="text-sm text-g-500">Service not found</p>
      </div>
    )
  }

  const features = SERVICE_FEATURES[serviceId] || []

  const handleFeatureClick = (feature) => {
    const drawerContent = (
      <div>
        <h2 className="text-lg font-semibold text-g-900 mb-4">{feature.name}</h2>

        <div className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-g-400 uppercase mb-1">Slug</div>
            <div className="font-mono text-sm text-g-700">{feature.slug}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-g-400 uppercase mb-1">Type</div>
            <div className="flex items-center gap-2">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                feature.type === 'boolean' ? 'bg-sub text-sub-dark' :
                feature.type === 'integer' ? 'bg-payg text-payg-dark' :
                'bg-g-100 text-g-600'
              }`}>
                {feature.type}
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-g-400 uppercase mb-1">Description</div>
            <div className="text-sm text-g-700">{feature.desc}</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-g-400 uppercase mb-1">Mutable</div>
            <div className="text-sm text-g-700">{feature.mutable ? 'Yes' : 'No'}</div>
          </div>

          {feature.metering && (
            <div>
              <div className="text-xs font-semibold text-g-400 uppercase mb-1">Metering</div>
              <div className="text-sm text-g-700">{feature.metering}</div>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-g-400 uppercase mb-1">Service</div>
            <div className="text-sm text-g-700">{service.name}</div>
          </div>
        </div>
      </div>
    )

    onOpenDrawer(drawerContent)
  }

  const getTypeBadgeClass = (type) => {
    if (type === 'boolean') return 'bg-sub text-sub-dark'
    if (type === 'integer') return 'bg-payg text-payg-dark'
    return 'bg-g-100 text-g-600'
  }

  return (
    <div>
      {/* Back Breadcrumb */}
      <Link
        to="/features"
        className="inline-flex items-center text-sm text-g-500 hover:text-g-700 transition-colors mb-4"
      >
        <span>← Features / <span className="text-g-900">{service.name}</span></span>
      </Link>

      {/* Service Header */}
      <h1 className="text-2xl font-semibold text-g-900 tracking-tight">{service.name}</h1>
      <div className="font-mono text-xs text-g-400 mt-1.5">svc: {service.slug}</div>
      <p className="text-sm text-g-500 mt-1.5">{service.desc}</p>

      {/* Features Section */}
      <div className="text-xs font-semibold text-g-400 uppercase mt-6 mb-2">
        {features.length} Features
      </div>

      {/* Features List */}
      <div className="border border-g-200 rounded-md overflow-hidden bg-white">
        {features.map((feature, index) => (
          <button
            key={feature.slug}
            onClick={() => handleFeatureClick(feature)}
            className={`w-full text-left flex items-start justify-between p-4 px-5 transition-colors hover:bg-g-50 ${
              index < features.length - 1 ? 'border-b border-g-200' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-g-900">{feature.name}</span>
                {feature.mutable && (
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-600">
                    mutable
                  </span>
                )}
                {feature.metering && feature.metering !== 'static' && (
                  <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-600">
                    {feature.metering}
                  </span>
                )}
              </div>
              <div className="font-mono text-xs text-g-400 mt-0.5">{feature.slug}</div>
              <div className="text-[13px] text-g-500 mt-1">{feature.desc}</div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getTypeBadgeClass(feature.type)}`}>
                {feature.type}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
