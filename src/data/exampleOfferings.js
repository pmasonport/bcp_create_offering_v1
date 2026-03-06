// Import the JSON files from local data directory
import dockerTeamRaw from './examples/docker-team-config.json'
import buildMinutesRaw from './examples/build-minutes-config.json'
import gordonProRaw from './examples/gordon-pro-config.json'
import sandboxesRaw from './examples/sandboxes-config.json'
import dhiSelectRaw from './examples/docker-hardened-images-select-config.json'
import dhiEnterpriseRaw from './examples/docker-hardened-images-enterprise-config.json'
import apiCallsRaw from './examples/api-calls-config.json'
import sandboxPrepaidRaw from './examples/sandbox-prepaid-config.json'
import gordonAiTokensRaw from './examples/gordon-ai-tokens-config.json'

// Helper: Extract _original data from exported JSON for form state
function extractFormState(exportedData) {
  return {
    offeringType: exportedData.offeringType,
    offeringName: exportedData.offeringName,
    isFree: exportedData.isFree,
    freeOptIn: exportedData.freeOptIn,
    compatibleWith: exportedData.compatibleWith || [],
    customOfferings: [],
    // Use _original field which contains the actual form state
    components: exportedData.components.map(c => c._original),
    trial: exportedData.trial,
    sessionMetered: [],
    sessionMutable: []
  }
}

export const EXAMPLE_OFFERINGS = [
  {
    id: 'docker-team',
    name: 'Docker Team',
    description: 'Subscription with seats + Build Minutes add-on',
    category: 'Base • Subscription',
    state: extractFormState(dockerTeamRaw)
  },
  {
    id: 'build-minutes',
    name: 'Build Minutes',
    description: 'Prepaid packs with expiry — compatible with Team & Business',
    category: 'Add-on • Prepaid',
    state: extractFormState(buildMinutesRaw)
  },
  {
    id: 'gordon-pro',
    name: 'Gordon Pro',
    description: 'Fixed $20/month subscription — standalone offering',
    category: 'Base • Subscription',
    state: extractFormState(gordonProRaw)
  },
  {
    id: 'gordon-ai-tokens',
    name: 'Gordon AI Tokens',
    description: '$100 for 500K AI tokens — no expiry, stackable, AI-powered assistant',
    category: 'Base • Prepaid',
    state: extractFormState(gordonAiTokensRaw)
  },
  {
    id: 'api-calls',
    name: 'API Pro',
    description: '$50/month with 1,000 API calls, unlimited rollover, $0.05 overage',
    category: 'Base • Subscription',
    state: extractFormState(apiCallsRaw)
  },
  {
    id: 'sandboxes',
    name: 'Sandboxes',
    description: 'PAYG with multiple resources — per-unit and graduated tiers',
    category: 'Base • PAYG',
    state: extractFormState(sandboxesRaw)
  },
  {
    id: 'sandbox-prepaid',
    name: 'Prepaid Sandbox Credits',
    description: '$50 for 1M compute seconds — no expiry, stackable top-ups',
    category: 'Base • Prepaid',
    state: extractFormState(sandboxPrepaidRaw)
  },
  {
    id: 'dhi-select',
    name: 'DHI Select',
    description: '$5,000 per repo / yr — annual subscription',
    category: 'Base • Subscription',
    state: extractFormState(dhiSelectRaw)
  },
  {
    id: 'dhi-enterprise',
    name: 'DHI Enterprise',
    description: '$8,000 per repo / yr — downgrades to DHI Community after 30 days',
    category: 'Base • Subscription',
    state: extractFormState(dhiEnterpriseRaw)
  }
]
