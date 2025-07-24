'use client'

import { useState, useEffect } from 'react'
import { Folder, FileText, Download, Eye, Trash2, Plus, Search } from 'lucide-react'

interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
  document_count: number
  status: 'active' | 'completed' | 'pending'
  description?: string
}

interface LeaseDocument {
  id: string
  project_id: string
  file_name: string
  tenant_company: string
  property_address: string
  base_rent: string
  lease_start_date: string
  lease_end_date: string
  processed_at: string
  status: 'processed' | 'error' | 'pending'
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [leases, setLeases] = useState<LeaseDocument[]>([])
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadProjectLeases(selectedProject)
    }
  }, [selectedProject])

  const loadProjects = async () => {
    // Mock data for now
    setProjects([
      {
        id: '1',
        name: 'Downtown Office Complex',
        created_at: '2024-01-15',
        updated_at: '2024-01-20',
        document_count: 12,
        status: 'active',
        description: 'Mixed-use development with retail and office space'
      },
      {
        id: '2',
        name: 'Retail Shopping Center',
        created_at: '2024-01-10',
        updated_at: '2024-01-18',
        document_count: 8,
        status: 'completed',
        description: 'Strip mall with anchor tenant and smaller retail units'
      }
    ])
  }

  const loadProjectLeases = async (projectId: string) => {
    // Mock data for now
    setLeases([
      {
        id: '1',
        project_id: projectId,
        file_name: 'Starbucks_Lease_2024.pdf',
        tenant_company: 'Starbucks Corporation',
        property_address: '123 Main St, Suite 100',
        base_rent: '$8,500/month',
        lease_start_date: '2024-03-01',
        lease_end_date: '2029-02-28',
        processed_at: '2024-01-20T10:30:00Z',
        status: 'processed'
      }
    ])
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      description: newProjectDescription.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_count: 0,
      status: 'active'
    }

    setProjects(prev => [newProject, ...prev])
    setShowNewProjectModal(false)
    setNewProjectName('')
    setNewProjectDescription('')
  }

  const deleteProject = async (projectId: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== projectId))
      if (selectedProject === projectId) {
        setSelectedProject(null)
        setLeases([])
      }
    }
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
            <p className="text-gray-600">Organize and manage your lease processing projects</p>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Project</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects List */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-oakley-blue focus:border-oakley-blue"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedProject === project.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedProject(project.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <Folder className="h-5 w-5 text-oakley-blue mt-1" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {project.document_count} documents
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div className="lg:col-span-2">
            {selectedProject ? (
              <div className="space-y-6">
                {/* Project Info */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {projects.find(p => p.id === selectedProject)?.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {projects.find(p => p.id === selectedProject)?.description}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteProject(selectedProject)}
                      className="text-red-600 hover:text-red-800 p-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-oakley-blue">
                        {projects.find(p => p.id === selectedProject)?.document_count || 0}
                      </p>
                      <p className="text-sm text-gray-600">Documents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {leases.filter(l => l.status === 'processed').length}
                      </p>
                      <p className="text-sm text-gray-600">Processed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-yellow-600">
                        {leases.filter(l => l.status === 'pending').length}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
                    </div>
                  </div>
                </div>

                {/* Lease Documents */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Lease Documents</h3>
                  </div>

                  {leases.length > 0 ? (
                    <div className="overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="table-header">Document</th>
                            <th className="table-header">Tenant</th>
                            <th className="table-header">Property</th>
                            <th className="table-header">Base Rent</th>
                            <th className="table-header">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {leases.map((lease) => (
                            <tr key={lease.id} className="hover:bg-gray-50">
                              <td className="table-cell">
                                <div className="flex items-center space-x-2">
                                  <FileText className="h-4 w-4 text-gray-400" />
                                  <span className="truncate max-w-xs">{lease.file_name}</span>
                                </div>
                              </td>
                              <td className="table-cell">{lease.tenant_company}</td>
                              <td className="table-cell">{lease.property_address}</td>
                              <td className="table-cell">{lease.base_rent}</td>
                              <td className="table-cell">
                                <span className={`status-badge ${
                                  lease.status === 'processed' ? 'status-completed' :
                                  lease.status === 'error' ? 'status-error' : 'status-pending'
                                }`}>
                                  {lease.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center">
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
                      <p className="mt-1 text-sm text-gray-500">Upload lease documents to get started.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white shadow rounded-lg p-12 text-center">
                <Folder className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Select a project</h3>
                <p className="mt-1 text-sm text-gray-500">Choose a project from the list to view details.</p>
              </div>
            )}
          </div>
        </div>

        {/* New Project Modal */}
        {showNewProjectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Project</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-oakley-blue focus:border-oakley-blue"
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={newProjectDescription}
                    onChange={(e) => setNewProjectDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-oakley-blue focus:border-oakley-blue"
                    placeholder="Optional project description"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setShowNewProjectModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProjectName.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}