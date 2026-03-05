import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GROUPS } from '../data/groups'
import { countOfferings, countAddons } from '../data/helpers'
import GraphView from '../components/GraphView'
import Drawer from '../components/Drawer'
import CreateGroupDrawer from '../components/CreateGroupDrawer'

export default function OfferingsIndex() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('list') // 'list' or 'graph'
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [catalogView, setCatalogView] = useState('minimal') // 'minimal' or 'full'
  const [showCreateGroupDrawer, setShowCreateGroupDrawer] = useState(false)

  // Filter groups based on catalog view
  const visibleGroups = catalogView === 'minimal'
    ? GROUPS.filter(g => ['dsop', 'premium-support', 'dhi', 'sandboxes'].includes(g.id))
    : GROUPS

  // Handle group creation
  const handleGroupCreate = (newGroup) => {
    // In real app: API call would happen in CreateGroupDrawer
    // This just closes drawer and navigates
    setShowCreateGroupDrawer(false)
    navigate(`/offerings/group/${newGroup.id}`)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-g-900 tracking-tight">Offerings</h1>
          <p className="text-sm text-g-500 mt-1.5">{visibleGroups.length} offering groups</p>
        </div>

        {/* Create Button with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCreateMenu(!showCreateMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-blue text-white rounded text-sm font-medium hover:bg-blue/90 transition-all shadow-sm hover:shadow"
          >
            <span>Create</span>
            <svg width="8" height="5" viewBox="0 0 10 6" fill="currentColor" className="opacity-70">
              <path d="M1 1L5 5L9 1" />
            </svg>
          </button>

          {showCreateMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCreateMenu(false)} />
              <div className="absolute right-0 mt-1 w-56 bg-white border border-g-200 rounded shadow-lg z-20">
                <button
                  onClick={() => {
                    setShowCreateGroupDrawer(true)
                    setShowCreateMenu(false)
                  }}
                  className="block w-full text-left px-4 py-2.5 text-sm text-g-700 hover:bg-g-50 transition-colors"
                >
                  Offering group
                </button>
                <Link
                  to="/create/offering"
                  className="block px-4 py-2.5 text-sm text-g-700 hover:bg-g-50 transition-colors"
                  onClick={() => setShowCreateMenu(false)}
                >
                  Offering
                </Link>
                <Link
                  to="/create/addon"
                  className="block px-4 py-2.5 text-sm text-g-700 hover:bg-g-50 transition-colors"
                  onClick={() => setShowCreateMenu(false)}
                >
                  Add-on
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="mt-4 inline-flex border border-g-200 rounded overflow-hidden">
        <button
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
            viewMode === 'list'
              ? 'bg-g-900 text-white'
              : 'bg-white text-g-500 hover:bg-g-50'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          List
        </button>
        <button
          onClick={() => setViewMode('graph')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-g-200 transition-all ${
            viewMode === 'graph'
              ? 'bg-g-900 text-white'
              : 'bg-white text-g-500 hover:bg-g-50'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
          Graph
        </button>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <div className="mt-4 border border-g-200 rounded-md overflow-hidden bg-white">
          {visibleGroups.map((group, index) => {
            const offeringCount = countOfferings(group.id)
            const addonCount = countAddons(group.id)

            return (
              <Link
                key={group.id}
                to={`/offerings/group/${group.id}`}
                className={`flex items-center justify-between p-4 px-5 transition-colors hover:bg-g-50 ${
                  index < visibleGroups.length - 1 ? 'border-b border-g-200' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-g-900">{group.name}</div>
                  <div className="text-[13px] text-g-500 mt-0.5">{group.desc}</div>
                  {group.standalone && (
                    <div className="text-[11px] text-g-400 mt-0.5">Standalone</div>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-g-400 flex-shrink-0 ml-4">
                  <span>{offeringCount} offering{offeringCount !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{addonCount} add-on{addonCount !== 1 ? 's' : ''}</span>
                  <svg className="ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polyline points="9 6 15 12 9 18" />
                  </svg>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <GraphView groups={visibleGroups} />
      )}

      {/* FAB Toggle Button */}
      <button
        onClick={() => setCatalogView(catalogView === 'minimal' ? 'full' : 'minimal')}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue text-white rounded-full shadow-lg hover:bg-blue/90 transition-all flex items-center justify-center group z-30"
        title={catalogView === 'minimal' ? 'Show full catalog' : 'Show minimal catalog'}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform group-hover:scale-110"
        >
          {catalogView === 'minimal' ? (
            <>
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
              <circle cx="5" cy="12" r="1"></circle>
              <circle cx="19" cy="12" r="1"></circle>
            </>
          ) : (
            <>
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </>
          )}
        </svg>
      </button>

      {/* Create Group Drawer */}
      {showCreateGroupDrawer && (
        <Drawer
          content={
            <CreateGroupDrawer
              onClose={() => setShowCreateGroupDrawer(false)}
              onCreate={handleGroupCreate}
            />
          }
          onClose={() => setShowCreateGroupDrawer(false)}
        />
      )}
    </div>
  )
}
