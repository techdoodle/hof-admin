# HOF Admin Panel

React Admin dashboard for managing House of Football platform.

## Features

### 🔐 **Role-Based Access Control**
- **Super Admin**: Full access to all features
- **Admin**: User management + Match management  
- **Football Chief**: Match management only
- **Academy Admin**: Match management only
- **Player**: Read-only access to own data (via main app)

### 👥 **User Management** (Admin/Super Admin only)
- View all users with search and filters
- Create/edit/delete users
- Assign roles and permissions
- View user profiles and activity

### ⚽ **Match Management** (All admin roles)
- Create and manage matches
- Edit match details and settings
- View match participants
- Upload CSV for bulk stats import
- Set MVP for matches

### 📊 **CSV Stats Upload** (All admin roles)
- Upload CSV files with match statistics
- Preview and edit data before final upload
- Validation and error handling
- Progress tracking and success confirmation

## Getting Started

### Prerequisites
- Node.js 16+ 
- Backend API running (hof-web-app-backend)

### Installation

1. Install dependencies:
```bash
npm install react-admin ra-data-json-server axios @tanstack/react-query
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install react-router-dom @types/react-router-dom
npm install react-hook-form @hookform/resolvers yup
npm install date-fns lodash @types/lodash react-dropzone
npm install --save-dev @types/node
```

2. Set up environment variables:
```bash
# Create .env.local file
REACT_APP_ENVIRONMENT=local
REACT_APP_API_URL=http://localhost:3000
```

3. Start the development server:
```bash
npm start
```

## Environment Configuration

### Local Development
```bash
npm start
# Uses http://localhost:3000 as API URL
```

### Staging
```bash
npm run start:staging
# Uses staging API URL
```

### Production
```bash
npm run start:production  
# Uses production API URL
```

## Authentication

The admin panel uses the same OTP-based authentication as the main app:

1. Enter mobile number
2. Receive OTP via SMS
3. Verify OTP
4. Access granted based on user role

Only users with admin roles can access the panel.

## File Structure

```
src/
├── components/          # Reusable UI components
├── config/             # Environment configuration
├── dashboard/          # Dashboard components
├── hooks/              # Custom React hooks
├── layout/             # Layout components
├── providers/          # React Admin providers
├── resources/          # Resource management
│   ├── users/          # User CRUD operations
│   ├── matches/        # Match CRUD operations
│   ├── matchParticipants/  # Participant management
│   └── statsUpload/    # CSV upload interface
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── theme.ts            # Material-UI theme
```

## Key Features

### 🔄 **CSV Upload Workflow**
1. **Upload**: Select CSV file from local system
2. **Preview**: View parsed data with validation
3. **Edit**: Modify data in editable table
4. **Confirm**: Final upload to database

### 🛡️ **Security Features**
- JWT token authentication
- Role-based route protection  
- Environment-specific API URLs
- Automatic token refresh
- Secure logout handling

### 📱 **Responsive Design**
- Mobile-friendly interface
- Adaptive layouts for different screen sizes
- Touch-friendly controls

## API Integration

The admin panel integrates with the NestJS backend:

- **Authentication**: `/auth/send-otp`, `/auth/verify-otp`
- **Users**: `/admin/users/*`
- **Matches**: `/admin/matches/*` 
- **Participants**: `/admin/match-participants/*`
- **CSV Upload**: `/admin/matches/:id/preview-csv`, `/admin/matches/:id/upload-stats`

## Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run start:staging` - Start with staging environment
- `npm run build:production` - Build for production environment

### Adding New Resources

1. Create resource folder in `src/resources/`
2. Add CRUD components (List, Create, Edit, Show)
3. Export from index.ts
4. Add to App.tsx resources
5. Update data provider if needed

## Deployment

### Build Commands
```bash
# For staging
npm run build:staging

# For production  
npm run build:production
```

### Environment Variables
Set these in your deployment platform:

- `REACT_APP_ENVIRONMENT` (local/staging/production)
- `REACT_APP_API_URL` (backend API URL)
- `REACT_APP_API_URL_STAGING` (staging API URL)
- `REACT_APP_API_URL_PROD` (production API URL)

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow Material-UI design patterns
4. Test role-based access control
5. Ensure responsive design