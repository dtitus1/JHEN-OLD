import { SheetService, SheetServiceConfig } from './types'
import { MockSheetService } from './MockSheetService'
import { GoogleSheetService } from './GoogleSheetService'

export type ServiceMode = 'mock' | 'production'

export class SheetServiceFactory {
  private static instance: SheetService | null = null
  private static currentMode: ServiceMode | null = null

  static create(mode: ServiceMode, config: SheetServiceConfig): SheetService {
    // Return existing instance if mode hasn't changed
    if (this.instance && this.currentMode === mode) {
      return this.instance
    }

    // Create new service based on mode
    switch (mode) {
      case 'mock':
        this.instance = new MockSheetService(config)
        break
      case 'production':
        this.instance = new GoogleSheetService(config)
        break
      default:
        throw new Error(`Unknown service mode: ${mode}`)
    }

    this.currentMode = mode
    console.log(`Sheet service initialized in ${mode} mode`)
    
    return this.instance
  }

  static getInstance(): SheetService | null {
    return this.instance
  }

  static getCurrentMode(): ServiceMode | null {
    return this.currentMode
  }

  static reset(): void {
    this.instance = null
    this.currentMode = null
  }
}

// Environment-based service creation
export function createSheetService(spreadsheetId: string): SheetService {
  const config: SheetServiceConfig = {
    spreadsheetId,
    rateLimitPerMinute: 100,
    timeoutMs: 30000
  }

  // Determine mode based on environment
  const isDevelopment = import.meta.env.MODE === 'development'
  const hasGoogleCredentials = !!(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || 
    import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY
  )

  // Use mock service in development or when credentials are missing
  const mode: ServiceMode = isDevelopment || !hasGoogleCredentials ? 'mock' : 'production'

  if (mode === 'production') {
    config.apiKey = import.meta.env.VITE_GOOGLE_API_KEY
    config.credentials = import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY ? 
      JSON.parse(import.meta.env.VITE_GOOGLE_SERVICE_ACCOUNT_KEY) : undefined
  }

  return SheetServiceFactory.create(mode, config)
}