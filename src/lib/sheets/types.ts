export interface SheetData {
  values: string[][]
  range: string
  majorDimension: 'ROWS' | 'COLUMNS'
}

export interface SheetTab {
  id: string
  name: string
  index: number
  data: SheetData
}

export interface SheetMetadata {
  spreadsheetId: string
  title: string
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

export interface SheetUpdateRequest {
  range: string
  values: string[][]
  majorDimension?: 'ROWS' | 'COLUMNS'
}

export interface SheetUser {
  email: string
  role: 'viewer' | 'editor' | 'owner'
  isCompanyUser: boolean
}

export interface SheetError {
  code: string
  message: string
  details?: any
}

export interface SheetServiceConfig {
  spreadsheetId: string
  apiKey?: string
  credentials?: any
  rateLimitPerMinute?: number
  timeoutMs?: number
}

// Service interface that both mock and production implementations will follow
export interface SheetService {
  // Core data operations
  getSheetMetadata(): Promise<SheetMetadata>
  getSheetData(sheetName: string, range?: string): Promise<SheetData>
  getAllSheets(): Promise<SheetTab[]>
  updateSheetData(sheetName: string, updates: SheetUpdateRequest): Promise<void>
  
  // Authentication and permissions
  authenticate(user?: any): Promise<void>
  checkPermissions(user: SheetUser): Promise<{ canRead: boolean; canWrite: boolean }>
  
  // Utility methods
  exportToCsv(sheetName: string): Promise<Blob>
  exportToExcel(sheetName: string): Promise<Blob>
  getLastSyncTime(): Date | null
  refreshData(): Promise<void>
  
  // Error handling
  getConnectionStatus(): 'connected' | 'disconnected' | 'error'
  getLastError(): SheetError | null
}