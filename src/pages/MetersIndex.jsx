import React, { useState } from 'react'
import { METERS, METERED_RESOURCES } from '../data/meters'
import { getResourcesForMeter } from '../data/helpers'

export default function MetersIndex({ onOpenDrawer }) {
  const [activeTab, setActiveTab] = useState('meters') // 'meters' or 'resources'

  const handleMeterClick = (meter) => {
    const linkedResources = getResourcesForMeter(meter.id)
    onOpenDrawer({
      title: meter.name,
      subtitle: meter.slug,
      content: (
        <div>
          <div className="mb-6">
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Configuration</div>
            <div className="space-y-3">
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">Service</span>
                <span className="text-g-900 font-medium">{meter.service}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">Feature</span>
                <span className="text-g-900 font-mono text-xs">{meter.feature}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">Unit type</span>
                <span className="text-g-900">{meter.unit}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">Status</span>
                <span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    {meter.status}
                  </span>
                </span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">External</span>
                <span className="text-g-900">{meter.external || '—'}</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">
              Linked Resources ({linkedResources.length})
            </div>
            {linkedResources.length > 0 ? (
              <div className="space-y-2">
                {linkedResources.map((resource) => (
                  <div key={resource.id} className="border border-g-200 rounded p-3 bg-white">
                    <div className="text-sm font-semibold text-g-900">{resource.name}</div>
                    <div className="text-xs font-mono text-g-400 mt-0.5">{resource.slug}</div>
                    <div className="text-xs text-g-500 mt-1">{resource.desc}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-g-400">No resources linked to this meter.</div>
            )}
          </div>
        </div>
      )
    })
  }

  const handleResourceClick = (resource) => {
    const linkedMeters = resource.meters
      .map((meterId) => METERS.find((m) => m.id === meterId))
      .filter(Boolean)

    onOpenDrawer({
      title: resource.name,
      subtitle: resource.slug,
      content: (
        <div>
          <p className="text-sm text-g-500 leading-relaxed mb-6">{resource.desc}</p>

          <div className="mb-6">
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Configuration</div>
            <div className="space-y-3">
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">Service</span>
                <span className="text-g-900 font-medium">{resource.service}</span>
              </div>
              <div className="flex justify-between items-start text-sm">
                <span className="text-g-500">Status</span>
                <span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    {resource.status}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">
              Linked Meters ({linkedMeters.length})
            </div>
            <div className="space-y-2">
              {linkedMeters.map((meter) => (
                <div key={meter.id} className="border border-g-200 rounded p-3 bg-white">
                  <div className="text-sm font-semibold text-g-900">{meter.name}</div>
                  <div className="text-xs font-mono text-g-400 mt-0.5">{meter.slug}</div>
                  <div className="text-xs text-g-500 mt-1">
                    {meter.service} → {meter.feature} · {meter.unit}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-g-900 tracking-tight">Meters</h1>
          <p className="text-sm text-g-500 mt-1.5">Usage tracking and billable resource configurations</p>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-0 border-b border-g-200 mt-4 mb-5">
        <button
          onClick={() => setActiveTab('meters')}
          className={`text-sm font-medium px-4 py-2.5 border-b-2 -mb-px transition-all ${
            activeTab === 'meters'
              ? 'text-blue border-blue font-semibold'
              : 'text-g-500 border-transparent hover:text-g-700'
          }`}
        >
          Meters <span className="font-normal text-g-400">({METERS.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`text-sm font-medium px-4 py-2.5 border-b-2 -mb-px transition-all ${
            activeTab === 'resources'
              ? 'text-blue border-blue font-semibold'
              : 'text-g-500 border-transparent hover:text-g-700'
          }`}
        >
          Metered Resources <span className="font-normal text-g-400">({METERED_RESOURCES.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'meters' ? (
        <div className="border border-g-200 rounded-md overflow-hidden bg-white">
          {METERS.map((meter, index) => (
            <div
              key={meter.id}
              onClick={() => handleMeterClick(meter)}
              className={`p-4 px-5 transition-colors hover:bg-g-50 cursor-pointer ${
                index < METERS.length - 1 ? 'border-b border-g-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-g-900">{meter.name}</div>
                  <div className="text-xs font-mono text-g-400 mt-0.5">{meter.slug}</div>
                  <div className="text-[13px] text-g-500 mt-1">
                    {meter.service} → {meter.feature} · {meter.unit}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    {meter.status}
                  </span>
                  {meter.external ? (
                    <span className="text-[11px] text-g-400">{meter.external}</span>
                  ) : (
                    <span className="text-[11px] text-g-300">no external</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-g-200 rounded-md overflow-hidden bg-white">
          {METERED_RESOURCES.map((resource, index) => (
            <div
              key={resource.id}
              onClick={() => handleResourceClick(resource)}
              className={`p-4 px-5 transition-colors hover:bg-g-50 cursor-pointer ${
                index < METERED_RESOURCES.length - 1 ? 'border-b border-g-200' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-g-900">{resource.name}</div>
                  <div className="text-xs font-mono text-g-400 mt-0.5">{resource.slug}</div>
                  <div className="text-[13px] text-g-500 mt-1">{resource.desc}</div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                    {resource.status}
                  </span>
                  <span className="text-[11px] text-g-400">
                    {resource.meters.length} meter{resource.meters.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
