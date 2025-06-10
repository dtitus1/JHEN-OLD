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

export class MockSheetService implements SheetService {
  private config: SheetServiceConfig
  private mockData: Map<string, SheetData> = new Map()
  private lastSyncTime: Date | null = null
  private connectionStatus: 'connected' | 'disconnected' | 'error' = 'connected'
  private lastError: SheetError | null = null
  private requestCount = 0
  private readonly maxRequestsPerMinute = 100

  constructor(config: SheetServiceConfig) {
    this.config = config
    this.initializeMockData()
  }

  private initializeMockData(): void {
    // Mock data for 3 spreadsheet tabs
    this.mockData.set('Player Rankings', {
      values: [
        ['Rank', 'Player Name', 'Position', 'Team', 'Projected Points', 'ADP', 'Notes'],
        ['1', 'Josh Allen', 'QB', 'BUF', '24.8', '12.5', 'Elite dual-threat QB'],
        ['2', 'Christian McCaffrey', 'RB', 'SF', '23.2', '1.2', 'Workhorse back when healthy'],
        ['3', 'Tyreek Hill', 'WR', 'MIA', '22.1', '8.7', 'Elite speed and target share'],
        ['4', 'Travis Kelce', 'TE', 'KC', '18.5', '15.3', 'Consistent TE1 production'],
        ['5', 'Lamar Jackson', 'QB', 'BAL', '23.8', '18.2', 'Rushing upside provides floor'],
        ['6', 'Stefon Diggs', 'WR', 'BUF', '20.4', '22.1', 'High-volume receiver'],
        ['7', 'Derrick Henry', 'RB', 'TEN', '19.8', '28.5', 'Goal line specialist'],
        ['8', 'Cooper Kupp', 'WR', 'LAR', '19.2', '25.8', 'PPR monster when healthy'],
        ['9', 'Davante Adams', 'WR', 'LV', '18.9', '31.2', 'Route running excellence'],
        ['10', 'Nick Chubb', 'RB', 'CLE', '18.1', '35.7', 'Pure runner with TD upside']
      ],
      range: 'A1:G11',
      majorDimension: 'ROWS'
    })

    this.mockData.set('Weekly Projections', {
      values: [
        ['Player', 'Week 12 Proj', 'Floor', 'Ceiling', 'Matchup', 'Weather', 'Confidence'],
        ['Josh Allen', '26.2', '18.5', '34.8', 'vs MIA', 'Dome', 'High'],
        ['Tua Tagovailoa', '19.8', '12.3', '28.1', '@ BUF', 'Cold', 'Medium'],
        ['Christian McCaffrey', '22.5', '15.2', '31.4', 'vs SEA', 'Clear', 'High'],
        ['Kenneth Walker III', '16.8', '8.9', '26.7', '@ SF', 'Rain', 'Low'],
        ['Tyreek Hill', '21.3', '13.8', '29.9', '@ BUF', 'Cold', 'Medium'],
        ['Stefon Diggs', '18.7', '11.2', '27.3', 'vs MIA', 'Dome', 'High'],
        ['Travis Kelce', '17.9', '10.5', '26.8', 'vs LV', 'Clear', 'High'],
        ['Darren Waller', '12.4', '6.8', '19.2', '@ KC', 'Clear', 'Low'],
        ['Justin Tucker', '9.2', '4.0', '15.0', 'vs CIN', 'Clear', 'Medium'],
        ['Evan McPherson', '8.8', '3.5', '14.5', '@ BAL', 'Clear', 'Medium']
      ],
      range: 'A1:G11',
      majorDimension: 'ROWS'
    })

    this.mockData.set('Team Analysis', {
      values: [
        ['Team', 'Offensive Rank', 'Defensive Rank', 'Pace', 'Red Zone %', 'Turnover Diff', 'Strength'],
        ['BUF', '2', '8', 'Fast', '68%', '+8', 'Passing offense'],
        ['SF', '5', '3', 'Medium', '72%', '+12', 'Balanced attack'],
        ['MIA', '8', '15', 'Fast', '58%', '-2', 'Big play ability'],
        ['KC', '3', '12', 'Medium', '65%', '+6', 'Red zone efficiency'],
        ['BAL', '12', '5', 'Medium', '61%', '+4', 'Running game'],
        ['LAR', '15', '18', 'Fast', '55%', '-8', 'Passing volume'],
        ['TEN', '22', '20', 'Slow', '48%', '-12', 'Power running'],
        ['LV', '18', '25', 'Medium', '52%', '-6', 'Vertical passing'],
        ['CLE', '20', '7', 'Slow', '59%', '+2', 'Defense/running'],
        ['SEA', '10', '22', 'Fast', '63%', '-4', 'Home field advantage']
      ],
      range: 'A1:G11',
      majorDimension: 'ROWS'
    })

    this.lastSyncTime = new Date()
  }

  async getSheetMetadata(): Promise<SheetMetadata> {
    await this.simulateNetworkDelay()
    this.incrementRequestCount()

    return {
      spreadsheetId: this.config.spreadsheetId,
      title: 'JHEN Fantasy Football Analysis',
      sheets: [
        {
          properties: {
            sheetId: 0,
            title: 'Player Rankings',
            index: 0,
            sheetType: 'GRID',
            gridProperties: {
              rowCount: 100,
              columnCount: 26
            }
          }
        },
        {
          properties: {
            sheetId: 1,
            title: 'Weekly Projections',
            index: 1,
            sheetType: 'GRID',
            gridProperties: {
              rowCount: 100,
              columnCount: 26
            }
          }
        },
        {
          properties: {
            sheetId: 2,
            title: 'Team Analysis',
            index: 2,
            sheetType: 'GRID',
            gridProperties: {
              rowCount: 50,
              columnCount: 26
            }
          }
        }
      ]
    }
  }

  async getSheetData(sheetName: string, range?: string): Promise<SheetData> {
    await this.simulateNetworkDelay()
    this.incrementRequestCount()

    const data = this.mockData.get(sheetName)
    if (!data) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }

    // If range is specified, filter the data
    if (range) {
      // Simple range parsing for demo (A1:C5 format)
      const rangeMatch = range.match(/([A-Z]+)(\d+):([A-Z]+)(\d+)/)
      if (rangeMatch) {
        const [, startCol, startRow, endCol, endRow] = rangeMatch
        const startColIndex = this.columnToIndex(startCol)
        const endColIndex = this.columnToIndex(endCol)
        const startRowIndex = parseInt(startRow) - 1
        const endRowIndex = parseInt(endRow) - 1

        const filteredValues = data.values
          .slice(startRowIndex, endRowIndex + 1)
          .map(row => row.slice(startColIndex, endColIndex + 1))

        return {
          ...data,
          values: filteredValues,
          range
        }
      }
    }

    return data
  }

  async getAllSheets(): Promise<SheetTab[]> {
    await this.simulateNetworkDelay()
    this.incrementRequestCount()

    const metadata = await this.getSheetMetadata()
    const tabs: SheetTab[] = []

    for (const sheet of metadata.sheets) {
      const data = await this.getSheetData(sheet.properties.title)
      tabs.push({
        id: sheet.properties.sheetId.toString(),
        name: sheet.properties.title,
        index: sheet.properties.index,
        data
      })
    }

    return tabs
  }

  async updateSheetData(sheetName: string, updates: SheetUpdateRequest): Promise<void> {
    await this.simulateNetworkDelay()
    this.incrementRequestCount()

    // Simulate permission check
    const mockUser: SheetUser = {
      email: 'user@company.com',
      role: 'editor',
      isCompanyUser: true
    }

    const permissions = await this.checkPermissions(mockUser)
    if (!permissions.canWrite) {
      throw new Error('Insufficient permissions to edit this spreadsheet')
    }

    // Update mock data
    const existingData = this.mockData.get(sheetName)
    if (!existingData) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }

    // Simple update logic - replace the specified range
    const updatedData = { ...existingData }
    updatedData.values = [...existingData.values]
    
    // For demo purposes, just append new rows
    updates.values.forEach(row => {
      updatedData.values.push(row)
    })

    this.mockData.set(sheetName, updatedData)
    this.lastSyncTime = new Date()

    console.log(`Updated sheet "${sheetName}" with ${updates.values.length} rows`)
  }

  async authenticate(user?: any): Promise<void> {
    await this.simulateNetworkDelay(500)
    
    // Simulate authentication process
    if (Math.random() > 0.1) { // 90% success rate
      this.connectionStatus = 'connected'
      console.log('Mock authentication successful')
    } else {
      this.connectionStatus = 'error'
      this.lastError = {
        code: 'AUTH_FAILED',
        message: 'Mock authentication failed'
      }
      throw new Error('Authentication failed')
    }
  }

  async checkPermissions(user: SheetUser): Promise<{ canRead: boolean; canWrite: boolean }> {
    await this.simulateNetworkDelay(200)
    this.incrementRequestCount()

    // Company users get edit access, others get read-only
    const canWrite = user.isCompanyUser && user.email.endsWith('@company.com')
    
    return {
      canRead: true,
      canWrite
    }
  }

  async exportToCsv(sheetName: string): Promise<Blob> {
    await this.simulateNetworkDelay()
    
    const data = await this.getSheetData(sheetName)
    const csvContent = data.values
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    
    return new Blob([csvContent], { type: 'text/csv' })
  }

  async exportToExcel(sheetName: string): Promise<Blob> {
    await this.simulateNetworkDelay(1000)
    
    // For demo purposes, return CSV as Excel
    const csvBlob = await this.exportToCsv(sheetName)
    return new Blob([await csvBlob.arrayBuffer()], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  }

  getLastSyncTime(): Date | null {
    return this.lastSyncTime
  }

  async refreshData(): Promise<void> {
    await this.simulateNetworkDelay(2000)
    this.incrementRequestCount()
    
    // Simulate data refresh by updating timestamps
    this.lastSyncTime = new Date()
    
    // Randomly update some values to simulate live data
    const rankings = this.mockData.get('Player Rankings')
    if (rankings) {
      rankings.values.forEach((row, index) => {
        if (index > 0 && row[4]) { // Skip header, update projected points
          const currentPoints = parseFloat(row[4])
          const variance = (Math.random() - 0.5) * 2 // ±1 point variance
          row[4] = (currentPoints + variance).toFixed(1)
        }
      })
    }
    
    console.log('Mock data refreshed')
  }

  getConnectionStatus(): 'connected' | 'disconnected' | 'error' {
    return this.connectionStatus
  }

  getLastError(): SheetError | null {
    return this.lastError
  }

  // Helper methods
  private async simulateNetworkDelay(ms: number = 300): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms + Math.random() * 200))
  }

  private incrementRequestCount(): void {
    this.requestCount++
    
    // Reset counter every minute
    setTimeout(() => {
      this.requestCount = Math.max(0, this.requestCount - 1)
    }, 60000)

    // Simulate rate limiting
    if (this.requestCount > this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded. Please try again later.')
    }
  }

  private columnToIndex(column: string): number {
    let result = 0
    for (let i = 0; i < column.length; i++) {
      result = result * 26 + (column.charCodeAt(i) - 'A'.charCodeAt(0) + 1)
    }
    return result - 1
  }

  // Mock-specific methods for testing
  simulateError(error: SheetError): void {
    this.lastError = error
    this.connectionStatus = 'error'
  }

  simulateDisconnection(): void {
    this.connectionStatus = 'disconnected'
  }

  resetMockState(): void {
    this.connectionStatus = 'connected'
    this.lastError = null
    this.requestCount = 0
    this.initializeMockData()
  }
}