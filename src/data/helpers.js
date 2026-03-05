import { OFFERINGS, OFFERING_DEPS } from './offerings'
import { EXTERNAL_ADDONS } from './groups'
import { SERVICE_FEATURES, SERVICES } from './services'
import { METERS, METERED_RESOURCES } from './meters'

// Offerings by group
export function offeringsForGroup(gid) {
  return OFFERINGS.filter(o => o.group === gid)
}

export function countForGroup(gid) {
  return offeringsForGroup(gid).length
}

export function countOfferings(gid) {
  return offeringsForGroup(gid).filter(o => o.pkg !== 'add_on').length
}

export function countAddonsInternal(gid) {
  return offeringsForGroup(gid).filter(o => o.pkg === 'add_on').length
}

export function countAddonsExternal(gid) {
  const ext = EXTERNAL_ADDONS[gid]
  if (!ext) return 0
  let count = 0
  ext.forEach(e => {
    count += offeringsForGroup(e.sourceGroup).length
  })
  return count
}

export function countAddons(gid) {
  return countAddonsInternal(gid) + countAddonsExternal(gid)
}

// Feature helpers
export function getAllFeatures() {
  let feats = []
  Object.keys(SERVICE_FEATURES).forEach(svcId => {
    const svc = SERVICES.find(s => s.id === svcId)
    SERVICE_FEATURES[svcId].forEach(f => {
      feats.push({ ...f, svcId, svcName: svc ? svc.name : svcId })
    })
  })
  return feats
}

export function getMutableAndMeteredFeatures() {
  return getAllFeatures().filter(f => f.mutable || (f.metering && f.metering !== 'static'))
}

// Meter/Resource relationships
export function getResourcesForMeter(meterId) {
  return METERED_RESOURCES.filter(r => r.meters.includes(meterId))
}

export function getResourcesForFeature(featSlug) {
  // Find meters linked to this feature, then resources linked to those meters
  const linkedMeters = METERS.filter(m => m.feature === featSlug)
  if (linkedMeters.length === 0) return []
  let resources = []
  linkedMeters.forEach(m => {
    getResourcesForMeter(m.id).forEach(r => {
      if (!resources.find(x => x.id === r.id)) resources.push(r)
    })
  })
  return resources
}

// Dependency helpers
export function getRequiredOfferings(addonId) {
  const deps = OFFERING_DEPS[addonId]
  if (!deps) return []
  return OFFERINGS.filter(o => deps.includes(o.id))
}

export function getAvailableAddons(offeringId) {
  // Find all add-ons that list this offering in their dependency map
  const addons = []
  Object.keys(OFFERING_DEPS).forEach(addonId => {
    if (OFFERING_DEPS[addonId].includes(offeringId)) {
      const addon = OFFERINGS.find(o => o.id === addonId)
      if (addon) addons.push(addon)
    }
  })
  return addons
}
