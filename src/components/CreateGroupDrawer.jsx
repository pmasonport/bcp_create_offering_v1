import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GROUPS } from '../data/groups'

export default function CreateGroupDrawer({ onClose, onCreate }) {
  const navigate = useNavigate()

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: ''
  })

  // UI state
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDescription, setShowDescription] = useState(false)

  // Slugify function (reused from CreateOfferingWizard)
  const slugify = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  // Find unique slug by appending number if needed
  const findUniqueSlug = (baseSlug) => {
    let slug = baseSlug
    let counter = 2

    while (GROUPS.some(g => g.id === slug)) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    return slug
  }

  // Auto-generate slug from name
  useEffect(() => {
    if (formData.name) {
      const baseSlug = slugify(formData.name)
      const uniqueSlug = findUniqueSlug(baseSlug)
      setFormData(prev => ({ ...prev, slug: uniqueSlug }))
    }
  }, [formData.name])

  // Validate entire form
  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    } else if (formData.name.length > 255) {
      newErrors.name = "Name must be under 255 characters"
    }

    // Optional field validation
    if (formData.description.length > 500) {
      newErrors.description = "Description must be under 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // In real app: POST to /api/v1/offering-groups
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const newGroup = {
        id: formData.slug,
        name: formData.name,
        short: formData.name,
        desc: formData.description,
        standalone: false
      }

      // For prototype: Add to GROUPS array so it exists when we navigate
      GROUPS.push(newGroup)

      // Call onCreate callback with new group
      onCreate(newGroup)
    } catch (error) {
      console.error('Failed to create group:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-g-900 mb-1.5">Create offering group</h2>
      <p className="text-sm text-g-500 mb-6">
        Organize offerings into product lines for your catalog.
      </p>

      <form onSubmit={handleSubmit} id="create-group-form">
        {/* Group Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-g-700 mb-1.5">
            Group Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Sandboxes"
            className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm focus:border-blue focus:outline-none"
            autoFocus
          />
          {formData.slug && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-g-100 text-g-600">
                {formData.slug}
              </span>
            </div>
          )}
          {errors.name && (
            <div className="text-xs text-red mt-1">{errors.name}</div>
          )}
        </div>

        {/* Description Toggle/Field */}
        {!showDescription ? (
          <button
            type="button"
            onClick={() => setShowDescription(true)}
            className="text-sm text-blue hover:opacity-80 mb-6"
          >
            + Add description
          </button>
        ) : (
          <div className="mb-6">
            <label className="block text-sm font-medium text-g-700 mb-1.5">
              Description <span className="text-xs text-g-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the product line"
              maxLength={500}
              className="w-full px-3.5 py-2.5 border border-g-200 rounded text-sm resize-vertical min-h-[56px] leading-relaxed focus:border-blue focus:outline-none"
            />
            <div className="flex justify-between items-center mt-1">
              <button
                type="button"
                onClick={() => {
                  setShowDescription(false)
                  setFormData(prev => ({ ...prev, description: '' }))
                }}
                className="text-xs text-g-400 hover:text-g-600"
              >
                Remove
              </button>
              <div className="text-xs text-g-400">{formData.description.length} / 500 characters</div>
            </div>
            {errors.description && (
              <div className="text-xs text-red mt-1">{errors.description}</div>
            )}
          </div>
        )}

        {/* Spacer for fixed footer */}
        <div className="h-20"></div>
      </form>

      {/* Fixed Footer Buttons */}
      <div className="fixed bottom-0 right-0 w-[440px] flex gap-2 p-6 pt-4 border-t border-g-200 bg-white">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1 px-5 py-2.5 border border-g-200 text-g-700 rounded text-sm font-medium hover:bg-g-50 disabled:opacity-35"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="create-group-form"
          disabled={isSubmitting || !formData.name}
          className="flex-1 px-5 py-2.5 bg-blue text-white rounded text-sm font-medium hover:opacity-90 disabled:opacity-35 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating...' : 'Create offering group'}
        </button>
      </div>
    </>
  )
}
