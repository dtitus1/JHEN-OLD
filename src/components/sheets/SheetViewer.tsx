import React, { useState, useEffect } from 'react'
import { RefreshCw, Download, Search, AlertCircle, CheckCircle, XCircle, Clock, Users, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { SheetService, SheetTab, SheetError, SheetUser } from '../../lib/sheets/types'
import { createSheetService } from '../../lib/sheets/SheetServiceFactory'

interface SheetViewerProps {
  spreadsheetId: string
  className?: string
}

export function SheetViewer({ spreadsheetId, className = '' }: SheetViewerProps) {
  const [sheetService] = useState<SheetService>(() => createSheetService(spreadsheetId))
  const [sheets, setSheets] = useState<SheetTab[]>([])
  const [activeSheetIndex, setActiveSheetIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<SheetError | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected')
  const [userPermissions, setUserPermissions] = useState<{ canRead: boolean; canWrite: boolean }>({ canRead: false, canWrite: false })

  // Mock user for demo - in production this would come from your auth system
  const currentUser: SheetUser = {
    email: 'user@company.com',
    role: 'editor',
    isCompanyUser: true
  }

  useEffect(() => {
    initializeSheet()
  }, [])

  const initializeSheet = async () => {
    try {
      setLoading(true)
      setError(null)

      // Authenticate user
      await sheetService.authenticate(currentUser)
      
      // Check permissions
      const permissions = await sheetService.checkPermissions(currentUser)
      setUserPermissions(permissions)

      if (!permissions.canRead) {
        throw new Error('You do not have permission to view this spreadsheet')
      }

      // Load all sheets
      const allSheets = await sheetService.getAllSheets()
      setSheets(allSheets)
      setLastSyncTime(sheetService.getLastSyncTime())
      setConnectionStatus(sheetService.getConnectionStatus())

      console.log(`Loaded ${allSheets.length} sheets successfully`)
    } catch (err) {
      const sheetError = err as SheetError
      setError(sheetError)
      setConnectionStatus('error')
      console.error('Failed to initialize sheet:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    try {
      setRefreshing(true)
      setError(null)

      await sheetService.refreshData()
      const allSheets = await sheetService.getAllSheets()
      setSheets(allSheets)
      setLastSyncTime(sheetService.getLastSyncTime())
      setConnectionStatus(sheetService.getConnectionStatus())

      console.log('Data refreshed successfully')
    } catch (err) {
      const sheetError = err as SheetError
      setError(sheetError)
      console.error('Failed to refresh data:', err)
    } finally {
      setRefreshing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    if (sheets.length === 0) return

    try {
      const activeSheet = sheets[activeSheetIndex]
      const blob = format === 'csv' 
        ? await sheetService.exportToCsv(activeSheet.name)
        : await sheetService.exportToExcel(activeSheet.name)

      // Download the file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeSheet.name}.${format === 'csv' ? 'csv' : 'xlsx'}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log(`Exported ${activeSheet.name} as ${format.toUpperCase()}`)
    } catch (err) {
      console.error(`Failed to export as ${format}:`, err)
      setError({
        code: 'EXPORT_FAILED',
        message: `Failed to export as ${format.toUpperCase()}`
      })
    }
  }

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Connection Error'
    }
  }

  const filterSheetData = (sheet: SheetTab) => {
    if (!searchTerm) return sheet.data.values

    return sheet.data.values.filter(row =>
      row.some(cell => 
        cell.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading spreadsheet data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-secondary-900 mb-2">Connection Error</h3>
          <p className="text-secondary-600 mb-4">{error.message}</p>
          <Button onClick={initializeSheet} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    )
  }

  const activeSheet = sheets[activeSheetIndex]
  const filteredData = activeSheet ? filterSheetData(activeSheet) : []

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Google Sheets Integration
              </h2>
              <div className="flex items-center space-x-4 mt-2 text-sm text-secondary-600">
                <div className="flex items-center space-x-1">
                  {getConnectionStatusIcon()}
                  <span>{getConnectionStatusText()}</span>
                </div>
                {lastSyncTime && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Last sync: {lastSyncTime.toLocaleTimeString()}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{currentUser.email}</span>
                  {!userPermissions.canWrite && <Lock className="h-3 w-3 text-yellow-500" />}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={!activeSheet}
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('excel')}
                disabled={!activeSheet}
              >
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Sheet Tabs */}
            <div className="flex space-x-1">
              {sheets.map((sheet, index) => (
                <button
                  key={sheet.id}
                  onClick={() => setActiveSheetIndex(index)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    index === activeSheetIndex
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
                  }`}
                >
                  {sheet.name}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-secondary-400" />
                <Input
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sheet Data */}
      {activeSheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{activeSheet.name}</h3>
              <div className="text-sm text-secondary-500">
                {filteredData.length} rows
                {searchTerm && ` (filtered from ${activeSheet.data.values.length})`}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-secondary-50 border-b border-secondary-200">
                  {filteredData.length > 0 && (
                    <tr>
                      {filteredData[0].map((header, index) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-secondary-200">
                  {filteredData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-secondary-50">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm text-secondary-900"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredData.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-secondary-600">
                  {searchTerm ? 'No data matches your search criteria.' : 'No data available.'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-secondary-600">
            <div className="flex items-center space-x-4">
              <span>Spreadsheet ID: {spreadsheetId}</span>
              <span>•</span>
              <span>{sheets.length} sheets loaded</span>
              {userPermissions.canWrite && (
                <>
                  <span>•</span>
                  <span className="text-green-600">Edit access granted</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <span>Powered by Google Sheets API</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}