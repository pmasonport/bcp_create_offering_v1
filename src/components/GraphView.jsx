import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { GROUPS, GRAPH_EDGES } from '../data/groups'
import { OFFERINGS, OFFERING_DEPS } from '../data/offerings'
import { countOfferings, countAddons } from '../data/helpers'

export default function GraphView({ groups = GROUPS }) {
  const svgRef = useRef()
  const containerRef = useRef()
  const navigate = useNavigate()
  const [zoomLevel, setZoomLevel] = useState(1)

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const containerWidth = containerRef.current.clientWidth
    const containerHeight = Math.max(600, window.innerHeight - 200)
    const width = containerWidth
    const height = containerHeight

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('class', 'bg-white')

    // Create a container group for zoom/pan
    const g = svg.append('g')

    // Create nodes: groups + offerings
    const groupIds = new Set(groups.map(g => g.id))

    // Group nodes (larger)
    const groupNodes = groups.map(grp => ({
      id: grp.id,
      name: grp.short,
      type: 'group',
      offeringCount: countOfferings(grp.id),
      addonCount: countAddons(grp.id),
      standalone: grp.standalone,
      x: width / 2 + (Math.random() - 0.5) * 400,
      y: height / 2 + (Math.random() - 0.5) * 400
    }))

    // Offering nodes (smaller)
    const offeringNodes = OFFERINGS
      .filter(o => groupIds.has(o.group))
      .map(o => ({
        id: o.id,
        name: o.name,
        type: 'offering',
        group: o.group,
        price: o.price,
        pkg: o.pkg,
        status: o.status,
        x: width / 2 + (Math.random() - 0.5) * 400,
        y: height / 2 + (Math.random() - 0.5) * 400
      }))

    const nodes = [...groupNodes, ...offeringNodes]

    // Create links: offering dependencies + offering-to-group connections
    const links = []
    const offeringIds = new Set(offeringNodes.map(o => o.id))

    // Offering dependency edges (add-ons requiring base offerings)
    // Only create links if both source and target are in the current view
    Object.entries(OFFERING_DEPS).forEach(([addonId, requiredIds]) => {
      if (offeringIds.has(addonId)) {
        requiredIds.forEach(reqId => {
          if (offeringIds.has(reqId)) {
            links.push({
              source: addonId,
              target: reqId,
              type: 'requires'
            })
          }
        })
      }
    })

    // Offering to group connections (lighter, for visual grouping)
    offeringNodes.forEach(o => {
      if (groupIds.has(o.group)) {
        links.push({
          source: o.id,
          target: o.group,
          type: 'membership'
        })
      }
    })

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(d => {
        if (d.type === 'membership') return 100
        if (d.type === 'requires') return 150
        return 200
      }))
      .force('charge', d3.forceManyBody().strength(d => d.type === 'group' ? -2000 : -400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => d.type === 'group' ? 150 : 40))
      .force('x', d3.forceX(width / 2).strength(0.03))
      .force('y', d3.forceY(height / 2).strength(0.03))

    // Setup zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)

    // Fit to view function
    const fitToView = () => {
      const bounds = g.node().getBBox()
      const fullWidth = width
      const fullHeight = height
      const midX = bounds.x + bounds.width / 2
      const midY = bounds.y + bounds.height / 2

      const scale = 0.7 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight)
      const translate = [fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY]

      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
    }

    // Store fit function for button
    svg.node().fitToView = fitToView

    // Create arrow markers
    const defs = svg.append('defs')

    defs.append('marker')
      .attr('id', 'arrow-requires')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 35)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#2560FF')

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        if (d.type === 'membership') return '#E5E7EB'
        if (d.type === 'requires') return '#2560FF'
        return '#9CA3AF'
      })
      .attr('stroke-width', d => {
        if (d.type === 'membership') return 1
        if (d.type === 'requires') return 2
        return 1.5
      })
      .attr('stroke-dasharray', d => d.type === 'membership' ? '3 3' : '0')
      .attr('marker-end', d => d.type === 'requires' ? 'url(#arrow-requires)' : null)
      .attr('opacity', d => {
        if (d.type === 'membership') return 0.3
        if (d.type === 'requires') return 0.8
        return 0.6
      })

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'move')
      .on('click', (event, d) => {
        if (!event.defaultPrevented) {
          if (d.type === 'group') {
            navigate(`/offerings/group/${d.id}`)
          } else {
            navigate(`/offerings/${d.id}`)
          }
        }
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(event, d) {
      d.fx = event.x
      d.fy = event.y
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }

    // Add shapes for groups (rectangles)
    node.filter(d => d.type === 'group')
      .append('rect')
      .attr('width', 180)
      .attr('height', 60)
      .attr('x', -90)
      .attr('y', -30)
      .attr('rx', 6)
      .attr('fill', '#F9FAFB')
      .attr('stroke', '#9CA3AF')
      .attr('stroke-width', 2)
      .on('mouseenter', function() {
        d3.select(this)
          .attr('stroke', '#2560FF')
          .attr('stroke-width', 2.5)
          .attr('fill', '#F0F4FF')
      })
      .on('mouseleave', function() {
        d3.select(this)
          .attr('stroke', '#9CA3AF')
          .attr('stroke-width', 2)
          .attr('fill', '#F9FAFB')
      })

    // Add shapes for offerings (circles)
    node.filter(d => d.type === 'offering')
      .append('circle')
      .attr('r', d => d.pkg === 'add_on' ? 22 : 28)
      .attr('fill', d => d.status === 'draft' ? '#FEF3C7' : '#fff')
      .attr('stroke', d => d.pkg === 'add_on' ? '#F59E0B' : '#2560FF')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => d.pkg === 'add_on' ? '3 2' : '0')
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 2.5)
          .attr('r', d.pkg === 'add_on' ? 24 : 30)
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .attr('stroke-width', 1.5)
          .attr('r', d.pkg === 'add_on' ? 22 : 28)
      })

    // Add group names
    node.filter(d => d.type === 'group')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -6)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#111827')
      .attr('pointer-events', 'none')
      .text(d => d.name)

    // Add group counts
    node.filter(d => d.type === 'group')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 10)
      .attr('font-size', '10px')
      .attr('fill', '#6B7280')
      .attr('pointer-events', 'none')
      .text(d => `${d.offeringCount} off. · ${d.addonCount} add-ons`)

    // Add offering labels (on hover via title)
    node.filter(d => d.type === 'offering')
      .append('title')
      .text(d => `${d.name}\n${d.price}`)

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, ${height - 80})`)
      .style('pointer-events', 'none')

    // Legend items
    const legendItems = [
      { shape: 'rect', color: '#9CA3AF', label: 'Offering group' },
      { shape: 'circle', color: '#2560FF', label: 'Offering' },
      { shape: 'circle-dashed', color: '#F59E0B', label: 'Add-on' }
    ]

    legendItems.forEach((item, i) => {
      const yPos = i * 20

      if (item.shape === 'rect') {
        legend.append('rect')
          .attr('x', 0)
          .attr('y', yPos - 6)
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', '#F9FAFB')
          .attr('stroke', item.color)
          .attr('stroke-width', 1.5)
          .attr('rx', 2)
      } else {
        legend.append('circle')
          .attr('cx', 6)
          .attr('cy', yPos)
          .attr('r', 6)
          .attr('fill', '#fff')
          .attr('stroke', item.color)
          .attr('stroke-width', 1.5)
          .attr('stroke-dasharray', item.shape === 'circle-dashed' ? '2 2' : '0')
      }

      legend.append('text')
        .attr('x', 18)
        .attr('y', yPos + 4)
        .attr('font-size', '11px')
        .attr('fill', '#6B7280')
        .text(item.label)
    })

    legend.append('text')
      .attr('x', 0)
      .attr('y', 70)
      .attr('font-size', '10px')
      .attr('fill', '#9CA3AF')
      .text('Arrows show dependencies (add-on → required offering)')

    legend.append('text')
      .attr('x', 0)
      .attr('y', 84)
      .attr('font-size', '10px')
      .attr('fill', '#9CA3AF')
      .text('Drag nodes • Scroll to zoom • Click to navigate')

    // Wait for simulation to settle, then fit to view with zoom out
    let tickCount = 0
    simulation.on('tick', () => {
      tickCount++
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)

      // Auto fit after simulation stabilizes
      if (tickCount === 100) {
        setTimeout(fitToView, 100)
      }
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [navigate, groups])

  const handleZoomIn = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().duration(300).call(
      d3.zoom().transform,
      d3.zoomIdentity.scale(zoomLevel * 1.3)
    )
  }

  const handleZoomOut = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().duration(300).call(
      d3.zoom().transform,
      d3.zoomIdentity.scale(zoomLevel / 1.3)
    )
  }

  const handleFitToView = () => {
    const svg = svgRef.current
    if (svg && svg.fitToView) {
      svg.fitToView()
    }
  }

  const handleReset = () => {
    const svg = d3.select(svgRef.current)
    svg.transition().duration(300).call(
      d3.zoom().transform,
      d3.zoomIdentity
    )
  }

  return (
    <div ref={containerRef} className="mt-5 border border-g-200 rounded-md bg-white overflow-hidden relative">
      <svg ref={svgRef} className="cursor-grab active:cursor-grabbing" />

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white border border-g-200 rounded shadow-sm p-1">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-g-50 rounded transition-colors"
          title="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-g-700">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
            <line x1="11" y1="8" x2="11" y2="14"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-g-50 rounded transition-colors"
          title="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-g-700">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="M21 21l-4.35-4.35"></path>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
        </button>
        <div className="h-px bg-g-200 my-1"></div>
        <button
          onClick={handleFitToView}
          className="p-2 hover:bg-g-50 rounded transition-colors"
          title="Fit to view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-g-700">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
        <button
          onClick={handleReset}
          className="p-2 hover:bg-g-50 rounded transition-colors"
          title="Reset view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-g-700">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
            <path d="M21 3v5h-5"></path>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
            <path d="M3 21v-5h5"></path>
          </svg>
        </button>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 bg-white border border-g-200 rounded px-2 py-1 text-xs text-g-500 font-mono pointer-events-none">
        {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  )
}
