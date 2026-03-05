import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { GROUPS } from '../data/groups'
import { OFFERINGS, OFFERING_DEPS } from '../data/offerings'
import { SERVICE_FEATURES, SERVICES } from '../data/services'
import { getAvailableAddons, getRequiredOfferings } from '../data/helpers'
import { OFFERING_ENTITLEMENTS, RATE_CARDS, LIFECYCLE, CONSTRAINTS } from '../data/offeringDetails'

export default function OfferingDetail() {
  const { offeringId } = useParams()

  const offering = OFFERINGS.find(o => o.id === offeringId)

  if (!offering) {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-g-900">Offering not found</h1>
      </div>
    )
  }

  const group = GROUPS.find(g => g.id === offering.group)
  const entitlements = OFFERING_ENTITLEMENTS[offering.id]
  const rateCards = RATE_CARDS[offering.id]
  const lifecycle = LIFECYCLE[offering.id]
  const constraints = CONSTRAINTS[offering.id]
  const availableAddons = getAvailableAddons(offering.id)
  const requiredOfferings = getRequiredOfferings(offering.id)

  // Badge components
  const PkgBadge = ({ pkg }) => {
    const labels = { bundle: 'bundle', standalone: 'standalone', add_on: 'add-on' }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-g-100 text-g-600">
        {labels[pkg] || pkg}
      </span>
    )
  }

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

  const AcctBadge = ({ acct }) => {
    const labels = { user: 'user', organization: 'organization', both: 'user + org' }
    return (
      <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded bg-white border border-g-200 text-g-600">
        {labels[acct] || acct}
      </span>
    )
  }

  const DraftBadge = ({ status }) => {
    if (status === 'draft') {
      return <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded border border-dashed border-amber text-amber ml-2">draft</span>
    }
    return null
  }

  // Get feature metadata
  const getFeatureMeta = (svcSlug, featSlug) => {
    const features = SERVICE_FEATURES[svcSlug]
    if (!features) return null
    return features.find(f => f.slug === featSlug)
  }

  const getFeatureName = (svcSlug, featSlug) => {
    const meta = getFeatureMeta(svcSlug, featSlug)
    return meta ? meta.name : featSlug
  }

  return (
    <div>
      {/* Breadcrumb Area */}
      <div className="mb-8">
        <Link
          to={`/offerings/group/${offering.group}`}
          className="inline-flex items-center gap-1 text-sm text-g-500 hover:text-g-700 transition-colors"
        >
          <span>←</span>
          <span>{group?.short || 'Offerings'}</span>
          <span>/</span>
          <span className="font-medium text-g-900">{offering.name}</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-g-900 tracking-tight">{offering.name}</h1>
            <DraftBadge status={offering.status} />
          </div>
          <p className="text-sm text-g-500 mt-1.5">{offering.desc}</p>

          {/* Meta Row */}
          <div className="flex items-center gap-2 mt-3 text-xs">
            <PkgBadge pkg={offering.pkg} />
            <MonBadge mon={offering.mon} price={offering.price} />
            <AcctBadge acct={offering.acct} />
            <span className="text-g-300">·</span>
            <span className="font-mono text-g-400">{offering.slug}</span>
            {offering.requires && (
              <>
                <span className="text-g-300">·</span>
                <span className="text-g-400">
                  requires <span className="text-g-600 font-medium">{offering.requires}</span>
                </span>
              </>
            )}
          </div>
        </div>

        <div className="text-right ml-8 flex-shrink-0">
          <div className="text-2xl font-semibold font-mono text-g-900 tracking-tight">{offering.price}</div>
          {offering.altPrice && (
            <div className="text-sm text-g-400 mt-1 font-mono">{offering.altPrice}</div>
          )}
          <div className="text-xs text-g-400 mt-2">{offering.cycle}</div>
        </div>
      </div>

      {/* Entitlements Section */}
      {entitlements && entitlements.length > 0 && (
        <div className="mt-9">
          <div className="h-px bg-g-100 mb-9" />
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Entitlements</div>
          <div className="space-y-3.5">
            {entitlements.map((svc, idx) => (
              <div key={idx} className="bg-white border border-g-200 rounded overflow-hidden">
                {/* Service Header */}
                <div className="px-5 py-2.5 bg-g-50 border-b border-g-200 flex justify-between items-center">
                  <div className="text-sm font-semibold text-g-900">{svc.svc}</div>
                  <div className="text-xs text-g-400">
                    {svc.feats.length} feature{svc.feats.length !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Feature Table */}
                <table className="w-full">
                  <tbody>
                    {svc.feats.map((feat, fidx) => {
                      const meta = getFeatureMeta(svc.slug, feat.s)
                      const name = getFeatureName(svc.slug, feat.s)
                      const isDimmed = feat.dim

                      return (
                        <tr
                          key={fidx}
                          className={`border-b border-g-200 last:border-b-0 hover:bg-g-50 transition-colors cursor-pointer ${isDimmed ? 'opacity-40' : ''}`}
                        >
                          <td className="px-5 py-2.5 text-[13px] text-g-900">
                            {name}
                            {meta?.mutable && (
                              <span className="inline-flex items-center ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-blue-light text-blue">
                                mutable
                              </span>
                            )}
                            {meta?.metering && meta.metering !== 'static' && (
                              <span className="inline-flex items-center ml-2 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber/10 text-amber">
                                {meta.metering}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-2.5 text-[13px] text-g-600 text-right">
                            {feat.v}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rate Cards Section */}
      {rateCards && rateCards.length > 0 && (
        <div className="mt-9">
          <div className="h-px bg-g-100 mb-9" />
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Rate Cards</div>
          <div className="bg-white border border-g-200 rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-g-50 border-b border-g-200">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-g-700">Description</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-g-700 w-[90px]">Model</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-g-700 w-[80px]">Timing</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-g-700 w-[80px]">Cycle</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-g-700 w-[160px]">Price</th>
                </tr>
              </thead>
              <tbody>
                {rateCards.map((rc, idx) => {
                  const parts = rc.label.split(' · ')
                  return (
                    <tr
                      key={idx}
                      className="border-b border-g-200 last:border-b-0 hover:bg-g-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-2.5">
                        <div className="text-[13px] font-medium text-g-900">{parts[0] || '—'}</div>
                        {rc.external && (
                          <div className="text-[11px] text-g-400 mt-0.5">{rc.external}</div>
                        )}
                      </td>
                      <td className="px-5 py-2.5 text-[13px] text-g-600">{parts[1] || '—'}</td>
                      <td className="px-5 py-2.5 text-[13px] text-g-600">{parts[2] || '—'}</td>
                      <td className="px-5 py-2.5 text-[13px] text-g-600">{parts[3] || '—'}</td>
                      <td className="px-5 py-2.5 text-[13px] text-g-600 text-right font-mono">{rc.price}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lifecycle Section */}
      {lifecycle && lifecycle.length > 0 && (
        <div className="mt-9">
          <div className="h-px bg-g-100 mb-9" />
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Lifecycle</div>
          <div className="bg-white border border-g-200 rounded overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-g-50 border-b border-g-200">
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-g-700 w-[80px]">Type</th>
                  <th className="px-5 py-2.5 text-left text-xs font-semibold text-g-700">Target</th>
                  <th className="px-5 py-2.5 text-right text-xs font-semibold text-g-700 w-[120px]">Timing</th>
                </tr>
              </thead>
              <tbody>
                {lifecycle.map((lc, idx) => {
                  const isUpgrade = lc.dir === '↑'
                  const target = lc.text
                    .replace(/^(upgrade to|upgrade from|downgrade to|downgrade from): /, '')
                    .replace(/ \(immediate\)| \(end of period\)/g, '')
                    .trim()
                  const timing = lc.text.includes('immediate') ? 'Immediate' : 'End of period'

                  return (
                    <tr key={idx} className="border-b border-g-200 last:border-b-0">
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${
                          isUpgrade ? 'bg-green/10 text-green' : 'bg-amber/10 text-amber'
                        }`}>
                          {isUpgrade ? 'upgrade' : 'downgrade'}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-[13px] font-medium text-g-900">{target}</td>
                      <td className="px-5 py-2.5 text-[13px] text-g-500 text-right">{timing}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Constraints Section */}
      {constraints && constraints.length > 0 && (
        <div className="mt-9">
          <div className="h-px bg-g-100 mb-9" />
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Constraints</div>
          <div className="bg-white border border-g-200 rounded p-4">
            {constraints.map((c, idx) => (
              <div key={idx} className="font-mono text-xs text-g-700">
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Add-Ons Section (for base offerings) */}
      {offering.pkg !== 'add_on' && availableAddons.length > 0 && (
        <div className="mt-9">
          <div className="h-px bg-g-100 mb-9" />
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Available Add-Ons</div>
          <div className="bg-white border border-g-200 rounded overflow-hidden">
            {availableAddons.map((addon, idx) => (
              <Link
                key={addon.id}
                to={`/offerings/${addon.id}`}
                className="block px-5 py-4 border-b border-g-200 last:border-b-0 hover:bg-g-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="text-sm font-semibold text-g-900">{addon.name}</div>
                      <MonBadge mon={addon.mon} price={addon.price} />
                    </div>
                    <div className="text-[13px] text-g-500">{addon.desc}</div>
                  </div>
                  <div className="flex items-center gap-3 ml-6 flex-shrink-0">
                    <div className="text-sm font-semibold font-mono text-g-900">{addon.price}</div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-g-300">
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Required Offerings Section (for add-ons) */}
      {offering.pkg === 'add_on' && requiredOfferings.length > 0 && (
        <div className="mt-9">
          <div className="h-px bg-g-100 mb-9" />
          <div className="text-xs font-semibold text-g-500 uppercase tracking-wide mb-3">Required Offerings</div>
          {requiredOfferings.length > 1 && (
            <p className="text-[13px] text-g-500 mb-3">
              Customer must have an active subscription to{' '}
              <strong className="text-g-700">at least one</strong> of these offerings to purchase this add-on.
            </p>
          )}
          <div className="bg-white border border-g-200 rounded overflow-hidden">
            {requiredOfferings.map((req, idx) => (
              <React.Fragment key={req.id}>
                {requiredOfferings.length > 1 && idx > 0 && (
                  <div className="px-5 py-0.5 text-[11px] font-semibold text-g-400 uppercase tracking-wide bg-g-50 border-b border-g-200 text-center">
                    or
                  </div>
                )}
                <Link
                  to={`/offerings/${req.id}`}
                  className="block px-5 py-4 border-b border-g-200 last:border-b-0 hover:bg-g-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-sm font-semibold text-g-900">{req.name}</div>
                        <MonBadge mon={req.mon} price={req.price} />
                      </div>
                      <div className="text-[13px] text-g-500">{req.desc}</div>
                    </div>
                    <div className="flex items-center gap-3 ml-6 flex-shrink-0">
                      <div className="text-sm font-semibold font-mono text-g-900">{req.price}</div>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-g-300">
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
