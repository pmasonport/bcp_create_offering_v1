import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { GROUPS, GRAPH_EDGES } from '../data/groups'
import { countOfferings, countAddons } from '../data/helpers'

export default function GraphView({ groups = GROUPS }) {
  const svgRef = useRef()
  const navigate = useNavigate()

  useEffect(() => {
    if (!svgRef.current) return

    const width = 900
    const height = 500

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove()

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create nodes from groups
    const nodes = groups.map(g => ({
      id: g.id,
      name: g.short,
      offeringCount: countOfferings(g.id),
      addonCount: countAddons(g.id),
      standalone: g.standalone
    }))

    // Create links from edges (filter to only include visible groups)
    const groupIds = new Set(groups.map(g => g.id))
    const links = GRAPH_EDGES
      .filter(e => groupIds.has(e.from) && groupIds.has(e.to))
      .map(e => ({
        source: e.from,
        target: e.to
      }))

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(90))

    // Create arrow markers
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 88)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#D1D5DB')

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#D1D5DB')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)')

    // Create node groups
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        navigate(`/offerings/group/${d.id}`)
      })

    // Add rectangles
    node.append('rect')
      .attr('width', 160)
      .attr('height', 52)
      .attr('x', -80)
      .attr('y', -26)
      .attr('rx', 4)
      .attr('fill', '#fff')
      .attr('stroke', d => d.standalone ? '#E5E7EB' : '#E5E7EB')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => d.standalone ? '4 2' : '0')
      .on('mouseenter', function() {
        d3.select(this)
          .attr('stroke', '#2560FF')
          .attr('stroke-width', 1.5)
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .attr('stroke', d.standalone ? '#E5E7EB' : '#E5E7EB')
          .attr('stroke-width', 1)
      })

    // Add group names
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', -4)
      .attr('font-size', '13px')
      .attr('font-weight', '600')
      .attr('fill', '#111827')
      .text(d => d.name)

    // Add counts
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', 12)
      .attr('font-size', '11px')
      .attr('fill', '#9CA3AF')
      .text(d => `${d.offeringCount} off. · ${d.addonCount} add-ons`)

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(20, ${height - 40})`)

    legend.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('font-size', '11px')
      .attr('fill', '#9CA3AF')
      .text('Arrow direction: dependent → required')

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [navigate, groups])

  return (
    <div className="mt-5 border border-g-200 rounded-md bg-white overflow-hidden">
      <svg ref={svgRef} />
    </div>
  )
}
