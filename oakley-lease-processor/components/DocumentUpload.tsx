'use client'

import { useState, useRef } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface UploadedFile {
  id: string
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  result?: any
  error?: string
}

export default function DocumentUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [selectedProject, setSelectedProject] = useState('new')
  const [newProjectName, setNewProjectName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      handleFiles(selectedFiles)
    }
  }

  const handleFiles = (newFiles: File[]) => {
    const uploadFiles: UploadedFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'pending',
      progress: 0
    }))

    setFiles(prev => [...prev, ...uploadFiles])

    // Start processing each file
    uploadFiles.forEach(uploadFile => {
      processFile(uploadFile.id)
    })
  }

  const processFile = async (fileId: string) => {
    updateFileStatus(fileId, 'uploading', 0)

    try {
      const file = files.find(f => f.id === fileId)?.file
      if (!file) return

      // Create project if needed
      let projectId = selectedProject
      if (selectedProject === 'new' && newProjectName) {
        projectId = await createProject(newProjectName)
      }

      // Upload file
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      updateFileStatus(fileId, 'uploading', 50)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const uploadResult = await uploadResponse.json()

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Upload failed')
      }

      updateFileStatus(fileId, 'processing', 75)

      // Process document with AI
      const processResponse = await fetch('/api/process-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          projectId: projectId
        }),
      })

      const processResult = await processResponse.json()

      if (!processResponse.ok) {
        throw new Error(processResult.error || 'Processing failed')
      }

      updateFileStatus(fileId, 'processing', 90)

      // Save lease data
      const saveResponse = await fetch('/api/save-lease-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leaseData: processResult.leaseData,
          projectId: projectId,
          fileName: uploadResult.fileName,
          fileUrl: uploadResult.fileUrl
        }),
      })

      const saveResult = await saveResponse.json()

      if (!saveResponse.ok) {
        throw new Error(saveResult.error || 'Save failed')
      }

      updateFileStatus(fileId, 'completed', 100, processResult.leaseData)

    } catch (error) {
      console.error('Processing error:', error)
      updateFileStatus(fileId, 'error', 0, undefined, error instanceof Error ? error.message : 'Unknown error')
    }
  }

  const createProject = async (name: string): Promise<string> => {
    // This would create a new project in Supabase
    // For now, return a mock ID
    return `project_${Date.now()}`
  }

  const updateFileStatus = (
    fileId: string, 
    status: UploadedFile['status'], 
    progress: number, 
    result?: any, 
    error?: string
  ) => {
    setFiles(prev => prev.map(file => 
      file.id === fileId 
        ? { ...file, status, progress, result, error }
        : file
    ))
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-5 w-5 text-gray-400" />
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusText = (file: UploadedFile) => {
    switch (file.status) {
      case 'pending':
        return 'Pending'
      case 'uploading':
        return 'Uploading...'
      case 'processing':
        return 'Processing with AI...'
      case 'completed':
        return 'Completed'
      case 'error':
        return `Error: ${file.error}`
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Project Selection */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Project</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-oakley-blue focus:border-oakley-blue"
            >
              <option value="new">Create New Project</option>
              <option value="project1">Downtown Office Complex</option>
              <option value="project2">Retail Shopping Center</option>
            </select>
            
            {selectedProject === 'new' && (
              <input
                type="text"
                placeholder="Enter project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="block w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-oakley-blue focus:border-oakley-blue"
              />
            )}
          </div>
        </div>

        {/* Upload Area */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Lease Documents</h3>
          
          <div
            className={`upload-zone ${isDragging ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <p className="text-lg font-medium text-gray-900">
                Drop lease documents here, or click to browse
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Supports PDF, Word documents, and images (PNG, JPG)
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Maximum file size: 50MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Processing Queue</h3>
            
            <div className="space-y-4">
              {files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      {getStatusIcon(file.status)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.file.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(file.file.size / 1024 / 1024).toFixed(2)} MB • {getStatusText(file)}
                        </p>
                      </div>
                    </div>
                    
                    {file.status !== 'uploading' && file.status !== 'processing' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {(file.status === 'uploading' || file.status === 'processing') && (
                    <div className="mt-3">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Results Preview */}
                  {file.status === 'completed' && file.result && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md">
                      <p className="text-sm font-medium text-gray-900 mb-2">Extracted Data:</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-medium">Tenant:</span> {file.result.tenant?.companyName || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Property:</span> {file.result.property?.address || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Base Rent:</span> {file.result.financialTerms?.baseRent || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Square Footage:</span> {file.result.property?.squareFootage || 'N/A'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Error Details */}
                  {file.status === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 rounded-md">
                      <p className="text-sm text-red-800">{file.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}