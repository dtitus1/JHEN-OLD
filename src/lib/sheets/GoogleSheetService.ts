import { 
  SheetService, 
  SheetData, 
  SheetTab, 
  SheetMetadata, 
  SheetUpdateRequest, 
  SheetUser, 
  SheetError,
  SheetServiceConfig 
} from './types'

// Google Sheets API interfaces
interface GoogleSheetsResponse {
  spreadsheetId: string
  properties: {
    title: string
  }
  sheets: Array<{
    properties: {
      sheetId: number
      title: string
      index: number
      sheetType: string
      gridProperties: {
        rowCount: number
        columnCount: number
      }
    }
  }>
}

interface GoogleSheetsValueRange {
  range: string
  majorDimension: string
  values: string[][]
}

export class GoogleSheetService implements SheetService {
  private config: SheetServiceConfig
  private accessToken: string | null = null
  private lastSyncTime: Date | null = null
  private connectionStatus: 'connected' | 'disconnected' | 'error' = 'disconnected'
  private lastError: SheetError | null = null
  private requestCount = 0
  private readonly baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets'

  constructor(config: SheetServiceConfig) {
    this.config = {
      rateLimitPerMinute: 100,
      timeoutMs: 30000,
      ...config
    }
  }

  async getSheetMetadata(): Promise<SheetMetadata> {
    await this.ensureAuthenticated()
    this.incrementRequestCount()

    try {
      const response = await this.makeApiRequest(
        `${this.baseUrl}/${this.config.spreadsheetId}`,
        'GET'
      )

      const data: GoogleSheetsResponse = await response.json()
      
      return {
        spreadsheetId: data.spreadsheetId,
        title: data.properties.title,
        sheets: data.sheets
      }
    } catch (error) {
      this.handleError('Failed to fetch sheet metadata', error)
      throw error
    }
  }

  async getSheetData(sheetName: string, range?: string): Promise<SheetData> {
    await this.ensureAuthenticated()
    this.incrementRequestCount()

    try {
      const fullRange = range ? `${sheetName}!${range}` : sheetName
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${encodeURIComponent(fullRange)}`
      
      const response = await this.makeApiRequest(url, 'GET')
      const data: GoogleSheetsValueRange = await response.json()

      return {
        values: data.values || [],
        range: data.range,
        majorDimension: data.majorDimension as 'ROWS' | 'COLUMNS'
      }
    } catch (error) {
      this.handleError(`Failed to fetch data for sheet "${sheetName}"`, error)
      throw error
    }
  }

  async getAllSheets(): Promise<SheetTab[]> {
    const metadata = await this.getSheetMetadata()
    const tabs: SheetTab[] = []

    // Fetch data for each sheet in parallel
    const dataPromises = metadata.sheets.map(async (sheet) => {
      try {
        const data = await this.getSheetData(sheet.properties.title)
        return {
          id: sheet.properties.sheetId.toString(),
          name: sheet.properties.title,
          index: sheet.properties.index,
          data
        }
      } catch (error) {
        console.warn(`Failed to load data for sheet "${sheet.properties.title}":`, error)
        return {
          id: sheet.properties.sheetId.toString(),
          name: sheet.properties.title,
          index: sheet.properties.index,
          data: { values: [], range: '', majorDimension: 'ROWS' as const }
        }
      }
    })

    const results = await Promise.allSettled(dataPromises)
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        tabs.push(result.value)
      }
    })

    // Sort by index
    tabs.sort((a, b) => a.index - b.index)
    
    this.lastSyncTime = new Date()
    return tabs
  }

  async updateSheetData(sheetName: string, updates: SheetUpdateRequest): Promise<void> {
    await this.ensureAuthenticated()
    this.incrementRequestCount()

    try {
      const fullRange = `${sheetName}!${updates.range}`
      const url = `${this.baseUrl}/${this.config.spreadsheetId}/values/${encodeURIComponent(fullRange)}`
      
      const requestBody = {
        range: fullRange,
        majorDimension: updates.majorDimension || 'ROWS',
        values: updates.values
      }

      const response = await this.makeApiRequest(url, 'PUT', requestBody, {
        'Content-Type': 'application/json'
      })

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`)
      }

      this.lastSyncTime = new Date()
      console.log(`Successfully updated sheet "${sheetName}"`)
    } catch (error) {
      this.handleError(`Failed to update sheet "${sheetName}"`, error)
      throw error
    }
  }

  async authenticate(user?: any): Promise<void> {
    try {
      // Initialize Google Auth
      if (typeof window !== 'undefined' && window.gapi) {
        await this.initializeGoogleAuth()
      } else {
        // Server-side authentication with service account
        await this.authenticateWithServiceAccount()
      }
      
      this.connectionStatus = 'connected'
      console.log('Google Sheets authentication successful')
    } catch (error) {
      this.connectionStatus = 'error'
      this.handleError('Authentication failed', error)
      throw error
    }
  }

  async checkPermissions(user: SheetUser): Promise<{ canRead: boolean; canWrite: boolean }> {
    await this.ensureAuthenticated()
    this.incrementRequestCount()

    try {
      // Check if user has edit permissions by attempting to get spreadsheet metadata
      const metadata = await this.getSheetMetadata()
      
      // For company users, check if they have edit access
      const canWrite = user.isCompanyUser && user.email.endsWith('@company.com')
      
      return {
        canRead: true, // If we can get metadata, user can read
        canWrite
      }
    } catch (error) {
      return {
        canRead: false,
        canWrite: false
      }
    }
  }

  async exportToCsv(sheetName: string): Promise<Blob> {
    const data = await this.getSheetData(sheetName)
    
    const csvContent = data.values
      .map(row => 
        row.map(cell => {
          // Escape quotes and wrap in quotes if contains comma, quote, or newline
          const escaped = cell.replace(/"/g, '""')
          return /[",\n\r]/.test(cell) ? `"${escaped}"` : escaped
        }).join(',')
      )
      .join('\n')
    
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  }

  async exportToExcel(sheetName: string): Promise<Blob> {
    // For a full Excel export, you'd typically use a library like xlsx
    // For now, we'll return CSV with Excel MIME type
    const csvBlob = await this.exportToCsv(sheetName)
    const arrayBuffer = await csvBlob.arrayBuffer()
    
    return new Blob([arrayBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime
  }

  async refreshData(): Promise<void> {
    // Clear any cached data and force a fresh fetch
    this.lastSyncTime = null
    
    try {
      // Refresh metadata to ensure we have latest sheet structure
      await this.getSheetMetadata()
      this.lastSyncTime = new Date()
      console.log('Data refreshed successfully')
    } catch (error) {
      this.handleError('Failed to refresh data', error)
      throw error
    }
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'error' {
    return this.connectionStatus
  }

  getLastError(): SheetError | null {
    return this.lastError
  }

  // Private helper methods
  private async ensureAuthenticated(): Promise<void> {
    if (this.connectionStatus !== 'connected' || !this.accessToken) {
      await this.authenticate()
    }
  }

  private async initializeGoogleAuth(): Promise<void> {
    return new Promise((resolve, reject) => {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID
        }).then(() => {
          const authInstance = window.gapi.auth2.getAuthInstance()
          
          if (authInstance.isSignedIn.get()) {
            const user = authInstance.currentUser.get()
            this.accessToken = user.getAuthResponse().access_token
            resolve()
          } else {
            authInstance.signIn().then(() => {
              const user = authInstance.currentUser.get()
              this.accessToken = user.getAuthResponse().access_token
              resolve()
            }).catch(reject)
          }
        }).catch(reject)
      })
    })
  }

  private async authenticateWithServiceAccount(): Promise<void> {
    // Server-side authentication using service account credentials
    if (!this.config.credentials) {
      throw new Error('Service account credentials not provided')
    }

    try {
      // In a real implementation, you'd use Google's auth library
      // This is a simplified example
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: this.createJWT()
        })
      })

      const data = await response.json()
      this.accessToken = data.access_token
    } catch (error) {
      throw new Error('Service account authentication failed')
    }
  }

  private createJWT(): string {
    // In a real implementation, you'd create a proper JWT
    // This is a placeholder
    return 'jwt-token-placeholder'
  }

  private async makeApiRequest(
    url: string, 
    method: string, 
    body?: any, 
    additionalHeaders?: Record<string, string>
  ): Promise<Response> {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.accessToken}`,
      ...additionalHeaders
    }

    const config: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.config.timeoutMs || 30000)
    }

    if (body) {
      config.body = typeof body === 'string' ? body : JSON.stringify(body)
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API request failed: ${response.status} ${response.statusText}`, {
        cause: errorData
      })
    }

    return response
  }

  private incrementRequestCount(): void {
    this.requestCount++
    
    // Reset counter every minute
    setTimeout(() => {
      this.requestCount = Math.max(0, this.requestCount - 1)
    }, 60000)

    // Check rate limiting
    if (this.requestCount > (this.config.rateLimitPerMinute || 100)) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
  }

  private handleError(message: string, error: any): void {
    console.error(message, error)
    
    this.lastError = {
      code: error.code || 'UNKNOWN_ERROR',
      message,
      details: error
    }

    // Update connection status based on error type
    if (error.message?.includes('auth') || error.message?.includes('401')) {
      this.connectionStatus = 'error'
      this.accessToken = null
    } else if (error.message?.includes('network') || error.message?.includes('timeout')) {
      this.connectionStatus = 'disconnected'
    }
  }
}

// Extend Window interface for Google APIs
declare global {
  interface Window {
    gapi: any
  }
}