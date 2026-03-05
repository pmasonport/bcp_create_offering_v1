import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { GROUPS, EXTERNAL_ADDONS } from '../data/groups'
import { OFFERINGS } from '../data/offerings'
import { offeringsForGroup } from '../data/helpers'

export default function GroupDetail() {
  const { groupId } = useParams()
  const [scope, setScope] = useState('all') // 'all', 'user', 'org'

  const group = GROUPS.find(g => g.id === groupId)

  if (!group) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-g-900">Group not found</h1>
      </div>
    )
  }

  const allOfferings = offeringsForGroup(groupId)

  // Filter by scope
  const filterByScope = (list) => {
    if (scope === 'all') return list
    if (scope === 'user') return list.filter(o => o.acct === 'user' || o.acct === 'both')
    if (scope === 'org') return list.filter(o => o.acct === 'organization' || o.acct === 'both')
    return list
  }

  const offerings = filterByScope(allOfferings.filter(o => o.pkg !== 'add_on'))
  const internalAddons = filterByScope(allOfferings.filter(o => o.pkg === 'add_on'))
  const extGroups = EXTERNAL_ADDONS[groupId] || []

  // Count external addons
  let externalCount = 0
  extGroups.forEach(ext => {
    const extOffs = filterByScope(offeringsForGroup(ext.sourceGroup))
    externalCount += extOffs.length
  })

  const totalVisible = offerings.length + internalAddons.length + externalCount

  // Monetization badge
  const MonBadge = ({ mon, price }) => {
    if (price === '$0' || price === '$0.00') {
      return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-green/10 text-green">free</span>
    }
    const colors = {
      subscription: 'bg-green/10 text-green',
      payg: 'bg-amber/10 text-amber',
      prepaid: 'bg-[#FB923C]/10 text-[#FB923C]',
      one_time: 'bg-[#FB923C]/10 text-[#FB923C]',
    }
    return <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${colors[mon] || 'bg-g-100 text-g-600'}`}>{mon}</span>
  }

  // Draft badge
  const DraftBadge = ({ status }) => {
    if (status === 'draft') {
      return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border border-dashed border-amber text-amber">draft</span>
    }
    return null
  }

  // Offering card component
  const OfferingCard = ({ offering, isAddon, delay, depOverride }) => {
    const dep = depOverride || offering.requires
    const draft = offering.status === 'draft'

    return (
      <Link
        to={`/offerings/${offering.id}`}
        className={`block px-5 py-4 border-b border-g-200 last:border-b-0 hover:bg-g-50 transition-colors ${draft ? 'opacity-55' : ''}`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-semibold text-g-900">{offering.name}</div>
              <DraftBadge status={offering.status} />
              <MonBadge mon={offering.mon} price={offering.price} />
            </div>
            <div className="text-[13px] text-g-500">{offering.desc}</div>
            {dep && (
              <div className="text-xs text-g-400 mt-1.5">requires {dep}</div>
            )}
          </div>
          <div className="flex items-center gap-3 ml-6 flex-shrink-0">
            <div className="text-right">
              <div className="text-sm font-semibold font-mono text-g-900">{offering.price}</div>
              {offering.altPrice && (
                <div className="text-[13px] text-g-400 font-mono mt-0.5">{offering.altPrice}</div>
              )}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-g-300">
              <polyline points="9 6 15 12 9 18" />
            </svg>
          </div>
        </div>
      </Link>
    )
  }

  // Addon divider
  const AddonDivider = ({ label }) => (
    <div className="px-5 py-1.5 text-[11px] font-semibold text-g-400 uppercase tracking-wide bg-g-50 border-b border-g-200">
      {label}
    </div>
  )

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/offerings"
        className="inline-flex items-center gap-1 text-sm text-g-500 hover:text-g-700 mb-4 transition-colors"
      >
        <span>←</span>
        <span>Offerings</span>
        <span>/</span>
        <span className="font-medium text-g-900">{group.short}</span>
      </Link>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-g-900 tracking-tight">{group.name}</h1>
          {group.desc && <p className="text-sm text-g-500 mt-1.5">{group.desc}</p>}
        </div>
        <div className="flex gap-2">
          <Link
            to={`/create/offering?group=${groupId}`}
            className="px-4 py-2 bg-blue text-white rounded text-sm font-medium hover:bg-blue/90 transition-all shadow-sm hover:shadow"
          >
            Add offering
          </Link>
          <Link
            to={`/create/addon?group=${groupId}`}
            className="px-4 py-2 bg-white border border-g-200 text-g-700 rounded text-sm font-medium hover:bg-g-50 hover:border-g-300 transition-all"
          >
            Add add-on
          </Link>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-2.5 mt-4 mb-1">
        <span className="text-xs font-medium text-g-400">Filter</span>
        <div className="flex gap-1.5">
          <button
            onClick={() => setScope('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              scope === 'all'
                ? 'bg-g-900 text-white'
                : 'bg-white border border-g-200 text-g-600 hover:bg-g-50'
            }`}
          >
            All accounts
          </button>
          <button
            onClick={() => setScope('user')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              scope === 'user'
                ? 'bg-g-900 text-white'
                : 'bg-white border border-g-200 text-g-600 hover:bg-g-50'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setScope('org')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              scope === 'org'
                ? 'bg-g-900 text-white'
                : 'bg-white border border-g-200 text-g-600 hover:bg-g-50'
            }`}
          >
            Organization
          </button>
        </div>
      </div>

      {/* Empty State */}
      {totalVisible === 0 ? (
        <div className="mt-6 p-12 text-center border border-dashed border-g-200 rounded bg-white">
          <div className="text-sm font-semibold text-g-700 mb-1.5">No offerings yet</div>
          <div className="text-[13px] text-g-400 max-w-sm mx-auto mb-5">
            Add offerings to define what customers can purchase, then add-ons for optional extras.
          </div>
          <div className="flex gap-2 justify-center">
            <Link
              to={`/create/offering?group=${groupId}`}
              className="px-4 py-2 bg-blue text-white rounded text-sm font-medium hover:bg-blue/90 transition-all shadow-sm hover:shadow"
            >
              Add offering
            </Link>
            <Link
              to={`/create/addon?group=${groupId}`}
              className="px-4 py-2 bg-white border border-g-200 text-g-700 rounded text-sm font-medium hover:bg-g-50 hover:border-g-300 transition-all"
            >
              Add add-on
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Offerings Section */}
          <div className="mt-9">
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Offerings</div>
            {offerings.length > 0 ? (
              <div className="bg-white border border-g-200 rounded overflow-hidden">
                {offerings.map((o, i) => (
                  <OfferingCard key={o.id} offering={o} isAddon={false} delay={i * 30} />
                ))}
              </div>
            ) : (
              <div className="px-5 py-4 bg-white border border-g-200 rounded text-[13px] text-g-400">
                No base offerings yet.
              </div>
            )}
          </div>

          {/* Add-ons Section */}
          <div className="mt-12">
            <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Add-Ons</div>
            {(internalAddons.length > 0 || externalCount > 0) ? (
              <div className="bg-white border border-g-200 rounded overflow-hidden">
                {/* Internal Add-ons */}
                {internalAddons.length > 0 && (
                  <>
                    <AddonDivider label={group.short} />
                    {internalAddons.map((o, i) => (
                      <OfferingCard key={o.id} offering={o} isAddon={true} delay={i * 30} />
                    ))}
                  </>
                )}

                {/* External Add-ons */}
                {extGroups.map(ext => {
                  const sg = GROUPS.find(g => g.id === ext.sourceGroup)
                  const extOffs = filterByScope(offeringsForGroup(ext.sourceGroup))
                  if (extOffs.length === 0) return null

                  return (
                    <React.Fragment key={ext.sourceGroup}>
                      <AddonDivider label={sg?.short || ext.sourceGroup} />
                      {extOffs.map((o, i) => (
                        <OfferingCard
                          key={o.id}
                          offering={o}
                          isAddon={true}
                          delay={i * 30}
                          depOverride={ext.dep.replace('requires ', '')}
                        />
                      ))}
                    </React.Fragment>
                  )
                })}
              </div>
            ) : (
              <div className="px-5 py-4 bg-white border border-g-200 rounded text-[13px] text-g-400">
                No add-ons yet.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
