# JHEN Fantasy Football Website

A modern, professional fantasy football platform built with React, TypeScript, and Supabase.

## Features

- **Modern Design**: Clean, professional interface with JHEN branding
- **User Authentication**: Secure email-based registration and login
- **Tiered Content**: Free and premium content access levels
- **Rankings System**: Advanced player rankings with filtering
- **Start/Sit Tool**: AI-powered lineup recommendations
- **Content Management**: Articles, videos, and draft guides
- **Google Sheets Integration**: Comprehensive spreadsheet integration with mock and production paths
- **Responsive Design**: Optimized for all devices
- **SEO Optimized**: Meta tags and structured data

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **APIs**: Sleeper Fantasy API, Google Sheets API
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **UI Components**: Custom component library
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google Cloud account (for Sheets integration)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase and Google API credentials.

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

1. Create a new Supabase project
2. Run the database migrations (see `/supabase/migrations/`)
3. Set up Row Level Security policies
4. Configure authentication settings

### Google Sheets Integration Setup

1. **Create Google Cloud Project**:
   - Go to Google Cloud Console
   - Create a new project
   - Enable Google Sheets API

2. **Set up Authentication**:
   ```bash
   # For client-side OAuth
   REACT_APP_GOOGLE_CLIENT_ID=your_client_id
   REACT_APP_GOOGLE_API_KEY=your_api_key
   
   # For server-side service account
   GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
   ```

3. **Configure OAuth Consent Screen**:
   - Add authorized domains
   - Set up scopes for Sheets API

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── home/           # Home page components
│   ├── stats/          # Stats page components
│   └── sheets/         # Google Sheets components
├── contexts/           # React contexts
├── lib/               # Utilities and configurations
│   ├── sheets/        # Google Sheets integration
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── MockSheetService.ts # Mock implementation
│   │   ├── GoogleSheetService.ts # Production implementation
│   │   └── SheetServiceFactory.ts # Service factory
│   ├── sleeper-api.ts # Sleeper Fantasy API
│   └── supabase.ts    # Supabase configuration
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

## Key Features Implementation

### Google Sheets Integration

The application includes a comprehensive Google Sheets integration with both mock and production implementations:

#### Architecture
- **Service Interface**: Defines all required spreadsheet operations
- **Dependency Injection**: Easy switching between mock and real implementations
- **Factory Pattern**: Automatic service creation based on environment

#### Mock Service Features
- In-memory data simulation
- Realistic API response delays
- Error simulation and testing
- Rate limiting simulation
- No external dependencies

#### Production Service Features
- Real Google Sheets API integration
- OAuth 2.0 and Service Account authentication
- CRUD operations with proper error handling
- Rate limiting and retry logic
- Export functionality (CSV/Excel)

#### Usage Examples
```typescript
// Automatic mode detection
const service = createSheetService(spreadsheetId)

// Manual mode selection
const service = SheetServiceFactory.create('mock', config)

// Service operations
const sheets = await service.getAllSheets()
const data = await service.getSheetData('Sheet1')
await service.updateSheetData('Sheet1', updates)
```

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes and user session management
- Profile management and subscription tiers

### Content Management
- Tiered access system (Free, Premium, Elite)
- Article and video content with previews
- Draft guide digital delivery system

### Start/Sit Tool
- AI-powered recommendations based on multiple factors
- Custom admin notes and overrides
- Pagination and filtering
- Confidence levels and risk assessment

### Rankings System
- Multi-format support (Standard, Half-PPR, PPR)
- Position filtering and search functionality
- Real-time updates from Sleeper API
- Sortable columns and pagination

### Stats Dashboard
- Live player data from Sleeper API
- Trending players (adds/drops)
- Advanced filtering and search
- Caching for performance

## API Integration

### Sleeper Fantasy API
- Real NFL player data
- Trending players and ownership data
- Team information and statistics
- Caching layer for performance

### Google Sheets API
- Full CRUD operations
- Multi-tab support
- Real-time synchronization
- Export functionality
- Access control and permissions

## Security Features

### Google Sheets Integration
- Email domain restrictions (@company.com)
- Role-based permissions (viewer/editor)
- Rate limiting (100 requests/minute)
- Request logging and monitoring
- Secure credential management

### General Security
- Row Level Security (RLS) in Supabase
- JWT-based authentication
- Environment variable protection
- CORS configuration
- Input validation and sanitization

## Testing Strategy

### Mock Service Testing
```typescript
const mockService = new MockSheetService(config)
mockService.simulateError({ code: 'RATE_LIMIT', message: 'Too many requests' })
```

### Integration Testing
```typescript
const service = createSheetService(testSpreadsheetId)
await service.authenticate(testUser)
const data = await service.getSheetData('TestSheet')
```

### Error Handling
- Automatic retry with exponential backoff
- Graceful degradation to cached data
- User-friendly error messages
- Connection timeout handling

## Deployment

### Environment Variables
```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Sheets API
REACT_APP_GOOGLE_CLIENT_ID=your_client_id
REACT_APP_GOOGLE_API_KEY=your_api_key
GOOGLE_SERVICE_ACCOUNT_KEY=your_service_account_json
```

### Production Deployment
The application is ready for deployment to:
- Netlify
- Vercel
- AWS Amplify

### Google Sheets Production Setup
1. Configure OAuth consent screen
2. Set up authorized domains
3. Deploy with proper CORS settings
4. Configure rate limiting policies
5. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both mock and production modes
5. Submit a pull request

## License

This project is proprietary and confidential.