import React, { useRef, useState } from 'react'
import { Upload, X, Image, Video, FileText } from 'lucide-react'
import { cn } from '../../lib/utils'
import { formatFileSize } from '../../lib/supabaseStorage'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  accept: string
  maxSize?: number
  currentFile?: File | null
  currentUrl?: string
  label: string
  description?: string
  className?: string
  disabled?: boolean
  error?: string
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  accept,
  maxSize = 5 * 1024 * 1024, // 5MB default
  currentFile,
  currentUrl,
  label,
  description,
  className,
  disabled = false,
  error
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize) {
      return
    }
    onFileSelect(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFileSelect(files[0])
    }
  }

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileRemove?.()
  }

  const getFileIcon = () => {
    if (accept.includes('image')) return <Image className="h-8 w-8" />
    if (accept.includes('video')) return <Video className="h-8 w-8" />
    return <FileText className="h-8 w-8" />
  }

  const hasFile = currentFile || currentUrl

  return (
    <div className={cn('space-y-2', className)}>
      <label className="block text-sm font-medium text-secondary-700">
        {label}
      </label>
      
      {description && (
        <p className="text-sm text-secondary-500">{description}</p>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive && !disabled ? 'border-primary-500 bg-primary-50' : 'border-secondary-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-secondary-400',
          error ? 'border-red-500 bg-red-50' : '',
          hasFile ? 'bg-secondary-50' : 'bg-white'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {hasFile ? (
          <div className="space-y-3">
            {/* File Preview */}
            {currentUrl && accept.includes('image') && (
              <div className="flex justify-center">
                <img
                  src={currentUrl}
                  alt="Preview"
                  className="max-h-32 max-w-full object-contain rounded"
                />
              </div>
            )}

            {/* File Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-primary-600">
                  {getFileIcon()}
                </div>
                <div>
                  <p className="font-medium text-secondary-900">
                    {currentFile?.name || 'Current file'}
                  </p>
                  {currentFile && (
                    <p className="text-sm text-secondary-500">
                      {formatFileSize(currentFile.size)}
                    </p>
                  )}
                </div>
              </div>
              
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove()
                }}
                className="p-1 text-secondary-400 hover:text-red-600 transition-colors"
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Replace File Area */}
            <div className="text-center pt-2 border-t border-secondary-200">
              <p className="text-sm text-secondary-600">
                Click or drag to replace file
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <div className="text-secondary-400">
              <Upload className="h-12 w-12 mx-auto mb-3" />
              {getFileIcon()}
            </div>
            <div>
              <p className="text-secondary-900 font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-sm text-secondary-500">
                Max file size: {formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}