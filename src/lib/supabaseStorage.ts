import { supabase } from './supabase'

export interface UploadResult {
  url: string
  path: string
}

export interface UploadError {
  message: string
  code?: string
}

/**
 * Upload a file to Supabase Storage
 * @param file - The file to upload
 * @param bucket - The storage bucket name
 * @param path - The path within the bucket (optional, will generate if not provided)
 * @returns Promise with the public URL or throws an error
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path?: string
): Promise<UploadResult> {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  // Generate a unique path if not provided
  if (!path) {
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    path = `${timestamp}-${randomString}.${fileExtension}`
  }

  try {
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return {
      url: urlData.publicUrl,
      path: data.path
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

/**
 * Delete a file from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The path of the file to delete
 */
export async function deleteFile(bucket: string, path: string): Promise<void> {
  if (!supabase) {
    throw new Error('Supabase client not initialized')
  }

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])

    if (error) {
      throw new Error(`Delete failed: ${error.message}`)
    }
  } catch (error) {
    console.error('File delete error:', error)
    throw error
  }
}

/**
 * Upload an article featured image
 * @param file - The image file to upload
 * @returns Promise with the public URL
 */
export async function uploadArticleImage(file: File): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload an image smaller than 5MB.')
  }

  return uploadFile(file, 'article-images')
}

/**
 * Upload a video file
 * @param file - The video file to upload
 * @returns Promise with the public URL
 */
export async function uploadVideo(file: File): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an MP4, WebM, or OGG video.')
  }

  // Validate file size (max 100MB)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload a video smaller than 100MB.')
  }

  return uploadFile(file, 'videos')
}

/**
 * Upload a video thumbnail
 * @param file - The thumbnail image file to upload
 * @returns Promise with the public URL
 */
export async function uploadVideoThumbnail(file: File): Promise<UploadResult> {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024 // 2MB
  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload a thumbnail smaller than 2MB.')
  }

  return uploadFile(file, 'video-thumbnails')
}

/**
 * Get file size in human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Validate image file
 * @param file - The file to validate
 * @returns True if valid, throws error if invalid
 */
export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.')
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload an image smaller than 5MB.')
  }

  return true
}

/**
 * Validate video file
 * @param file - The file to validate
 * @returns True if valid, throws error if invalid
 */
export function validateVideoFile(file: File): boolean {
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
  const maxSize = 100 * 1024 * 1024 // 100MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an MP4, WebM, or OGG video.')
  }

  if (file.size > maxSize) {
    throw new Error('File size too large. Please upload a video smaller than 100MB.')
  }

  return true
}