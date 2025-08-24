# 🚀 Startup Value Simulator - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Features & Functionality](#features--functionality)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Component Structure](#component-structure)
7. [Authentication System](#authentication-system)
8. [State Management](#state-management)
9. [Styling & UI](#styling--ui)
10. [Installation & Setup](#installation--setup)
11. [Usage Guide](#usage-guide)
12. [Troubleshooting](#troubleshooting)
13. [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

**Startup Value Simulator** is a comprehensive web application designed to help entrepreneurs and investors model cap table scenarios, track ownership dilution, and calculate potential returns at different exit valuations. It's built with Next.js 15, React 19, TypeScript, and Supabase.

### 🎨 Key Features

- **Cap Table Management**: Create and manage company ownership structures
- **Founder Management**: Add and track founder equity and shares
- **Funding Rounds**: Model different investment rounds and dilution
- **Exit Scenario Calculator**: Analyze potential returns at various exit valuations
- **Real-time Calculations**: Dynamic updates as you modify parameters
- **Professional UI/UX**: Modern, responsive design with smooth animations

---

## ✨ Features & Functionality

### 🏢 Company Management

- **Company Profile**: Set company name, total shares, and valuation
- **Real-time Updates**: Instant calculations as you modify company details
- **Professional Interface**: Clean, intuitive forms with validation

### 👥 Founder Management

- **Founder Profiles**: Add founder names and initial ownership percentages
- **Equity Tracking**: Monitor founder shares and ownership dilution
- **Visual Representation**: Clear display of founder equity distribution

### 💰 Funding Rounds

- **Round Configuration**: Set investment amounts, valuations, and share issuance
- **Dilution Modeling**: See how each round affects existing shareholders
- **Order Management**: Automatic sequencing of funding rounds

### 📊 Exit Scenario Calculator

- **Exit Value Input**: Set different exit valuations ($10M to $1B+)
- **ESOP Pool Management**: Configure employee stock option pools (0-25%)
- **Ownership Breakdown**: Visual representation of final ownership
- **Returns Analysis**: Calculate founder and investor returns
- **Bar Charts**: Visual breakdown of stakeholder returns

### 🔄 Scenario Comparison Tool

- **Scenario Management**: Save, name, and organize multiple exit scenarios
- **Side-by-Side Comparison**: Compare 2-3 scenarios simultaneously
- **Interactive Charts**: Visual comparison of ownership, dilution, and returns
- **Export Functionality**: Export comparison data for sharing and analysis
- **Professional Interface**: Clean, intuitive scenario management

### 📅 Scenario Timeline / Milestones

- **Interactive Timeline**: Visual representation of funding rounds and ownership evolution
- **Milestone Tracking**: Company formation → Seed → Series A → Series B → Exit
- **Ownership Evolution**: See how founder equity dilutes through each round
- **Valuation Changes**: Track pre-money and post-money valuations per round
- **Share Price History**: Monitor price per share changes over time
- **Founder Details**: Individual founder ownership and value at each milestone

### 🔍 Database Debug Tools

- **Data Inspection**: View all database tables and records
- **Store State Monitoring**: Track application state in real-time
- **Error Handling**: Comprehensive error reporting and debugging

---

## 🏗️ Technical Architecture

### 🎯 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: Ant Design 5.27.0
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.7
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Ant Design Icons, Lucide React
- **Build Tool**: Next.js built-in bundler

### 📁 Project Structure

```
startup-simulator-next/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main dashboard
│   │   └── page.tsx           # Landing page
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard-specific components
│   │   ├── ProtectedRoute.tsx # Route protection
│   │   └── ClientProviders.tsx # Context providers
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── hooks/                 # Custom React hooks
│   │   ├── useJWT.ts          # JWT management
│   │   └── useAuth.ts         # Authentication hooks
│   ├── lib/                   # Utility libraries
│   │   ├── supabase.ts        # Supabase client
│   │   ├── database-service.ts # Database operations
│   │   ├── finance-engine.ts  # Financial calculations
│   │   ├── jwt-utils.ts       # JWT utilities
│   │   └── jwt-cookies.ts     # Cookie management
│   ├── store/                 # State management
│   │   └── simulator-store.ts # Zustand store
│   └── types/                 # TypeScript definitions
│       └── index.ts           # Type interfaces
├── public/                    # Static assets
├── package.json               # Dependencies
└── tailwind.config.ts         # Tailwind configuration
```

---

## 🗄️ Database Schema

### 📊 Tables Structure

#### **users**

```sql
- id: string (UUID, Primary Key)
- username: string
- email: string
- created_at: timestamp
- updated_at: timestamp
```

#### **companies**

```sql
- id: string (UUID, Primary Key)
- name: string
- user_id: string (Foreign Key to users.id)
- total_shares: number
- valuation: number (nullable)
- created_at: timestamp
- updated_at: timestamp
```

#### **founders**

```sql
- id: string (UUID, Primary Key)
- company_id: string (Foreign Key to companies.id)
- name: string
- initial_ownership: number
- current_ownership: number
- shares: number
- created_at: timestamp
- updated_at: timestamp
```

#### **funding_rounds**

```sql
- id: string (UUID, Primary Key)
- company_id: string (Foreign Key to companies.id)
- name: string
- investment_amount: number
- pre_money_valuation: number
- post_money_valuation: number
- shares_issued: number
- price_per_share: number
- order: number
- esop_allocation_percent: number (nullable)
- created_at: timestamp
- updated_at: timestamp
```

---

## 🌐 API Endpoints

### 🔐 Protected Routes

All API endpoints require JWT authentication via Authorization header.

#### **GET /api/protected/user-profile**

- **Purpose**: Fetch user profile information
- **Authentication**: Required
- **Response**: User profile data

#### **PUT /api/protected/user-profile**

- **Purpose**: Update user profile information
- **Authentication**: Required
- **Body**: Profile update data

#### **GET /api/debug/database**

- **Purpose**: Debug database content
- **Authentication**: Required
- **Response**: All database tables and records

#### **GET /api/protected/scenarios?companyId=xxx**

- **Purpose**: Fetch all scenarios for a company
- **Authentication**: Required
- **Response**: Array of scenario objects

#### **POST /api/protected/scenarios**

- **Purpose**: Create a new scenario
- **Authentication**: Required
- **Body**: Company ID, scenario name, and configuration
- **Response**: Created scenario object

#### **PUT /api/protected/scenarios/[id]**

- **Purpose**: Update an existing scenario
- **Authentication**: Required
- **Body**: Updated scenario data
- **Response**: Updated scenario object

#### **DELETE /api/protected/scenarios/[id]**

- **Purpose**: Delete a scenario
- **Authentication**: Required
- **Response**: Success message

---

## 🧩 Component Structure

### 🎛️ Dashboard Components

#### **DashboardHeader.tsx**

- **Purpose**: Main application header with navigation
- **Features**:
  - Company status display
  - User information
  - Logout functionality
  - Quick statistics
  - Hover effects and animations

#### **CompanyTab.tsx**

- **Purpose**: Company profile management
- **Features**:
  - Company information form
  - Valuation settings
  - Share structure configuration
  - Next steps navigation

#### **FoundersTab.tsx**

- **Purpose**: Founder equity management
- **Features**:
  - Add/remove founders
  - Ownership percentage allocation
  - Share calculation
  - Visual equity display

#### **FundingRoundsTab.tsx**

- **Purpose**: Investment round management
- **Features**:
  - Add funding rounds
  - Investment amount tracking
  - Valuation calculations
  - Share issuance tracking

#### **ResultsTab.tsx**

- **Purpose**: Exit scenario analysis
- **Features**:
  - Exit value calculator
  - ESOP pool configuration
  - Ownership breakdown
  - Returns visualization
  - Bar charts and progress bars

#### **DatabaseDebugTab.tsx**

- **Purpose**: Database debugging and monitoring
- **Features**:
  - Real-time data inspection
  - Store state monitoring
  - Error reporting
  - Data refresh functionality

#### **ScenarioManager.tsx**

- **Purpose**: Scenario creation and management
- **Features**:
  - Save current scenario configurations
  - Edit and rename existing scenarios
  - Delete scenarios with confirmation
  - Visual scenario overview with metadata
  - Professional modal interface

#### **ScenarioComparisonTab.tsx**

- **Purpose**: Side-by-side scenario comparison
- **Features**:
  - Multi-scenario selection (2-3 scenarios)
  - Comparison table with key metrics
  - Interactive charts and progress bars
  - Ownership breakdown visualization
  - Founder returns comparison
  - Export functionality (placeholder)

#### **ScenarioTimeline.tsx**

- **Purpose**: Interactive timeline of funding rounds and ownership evolution
- **Features**:
  - Visual timeline from company formation to exit
  - Milestone tracking for each funding round
  - Ownership breakdown at each stage
  - Valuation and share price history
  - Individual founder equity tracking
  - Professional timeline UI with Ant Design components

---

## 🔐 Authentication System

### 🎫 JWT Implementation

- **Token Storage**: LocalStorage for client-side, cookies for server-side
- **Token Validation**: Automatic expiration checking
- **Route Protection**: Middleware-based authentication
- **Permission System**: Role-based access control (placeholder)

### 🛡️ Security Features

- **Protected Routes**: Automatic redirect to login
- **Token Refresh**: Automatic token renewal
- **Secure Storage**: HttpOnly cookies for sensitive data
- **CSRF Protection**: Built-in Next.js security

### 🔄 Authentication Flow

1. User logs in via Supabase
2. JWT token generated and stored
3. Token validated on each request
4. Automatic refresh when expiring
5. Logout clears all tokens

---

## 📊 State Management

### 🗃️ Zustand Store Structure

#### **simulator-store.ts**

```typescript
interface SimulatorStore {
  // Company Data
  company: Company | null;
  founders: Founder[];
  fundingRounds: FundingRound[];
  exitResults: ExitResults | null;

  // UI State
  isLoading: boolean;
  error: string | null;
  activeTab: string;

  // Actions
  setCompany: (company: Company) => void;
  addFounder: (founder: Founder) => void;
  removeFounder: (founderId: string) => void;
  addFundingRound: (round: FundingRound) => void;
  removeFundingRound: (roundId: string) => void;
  setExitValue: (value: number) => void;
  setESOPAllocation: (allocation: number) => void;
  calculateScenario: () => void;
  loadUserCompanies: (userId: string) => Promise<void>;
  clearError: () => void;
}
```

### 🔄 State Persistence

- **Local Storage**: User preferences and settings
- **Database**: Company and financial data
- **Session**: Authentication tokens and user state

---

## 🎨 Styling & UI

### 🎨 Design System

- **Color Palette**: Blue, indigo, purple gradients
- **Typography**: Ant Design Typography components
- **Spacing**: Consistent 8px grid system
- **Shadows**: Layered shadow system for depth
- **Borders**: Rounded corners (xl, 2xl) for modern look

### 🎭 Animation Features

- **Hover Effects**: Scale, translate, color transitions
- **Smooth Transitions**: 300ms duration for all animations
- **Transform Effects**: Rotate, scale, translate animations
- **Color Transitions**: Smooth color shifts and gradients

### 📱 Responsive Design

- **Mobile First**: Responsive grid system
- **Breakpoints**: xs, sm, md, lg, xl
- **Flexible Layouts**: Adaptive component sizing
- **Touch Friendly**: Large touch targets and gestures

---

## 🚀 Installation & Setup

### 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Git

### ⚙️ Environment Setup

Create `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🔧 Installation Steps

```bash
# Clone repository
git clone <repository-url>
cd startup-simulator-next

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 📖 Usage Guide

### 🆕 Getting Started

1. **Sign Up**: Create account with email/password
2. **Create Company**: Set company name, shares, and valuation
3. **Add Founders**: Define founder equity and shares
4. **Configure Funding**: Add investment rounds and dilution
5. **Analyze Scenarios**: Use exit calculator for projections

### 🎯 Key Workflows

#### **Company Setup**

1. Navigate to Company tab
2. Enter company details
3. Set total shares and valuation
4. Save company information

#### **Founder Management**

1. Go to Founders tab
2. Add founder names and ownership
3. Review equity distribution
4. Adjust percentages as needed

#### **Funding Analysis**

1. Access Funding Rounds tab
2. Add investment rounds
3. Monitor ownership dilution
4. Track share price changes

#### **Exit Scenarios**

1. Open Exit Scenarios tab
2. Set exit valuation
3. Configure ESOP pool
4. Analyze returns and ownership

#### **Scenario Timeline**

1. Navigate to Timeline tab
2. View interactive timeline of funding rounds
3. Track ownership evolution through each milestone
4. Analyze valuation changes and share price history
5. Monitor individual founder equity dilution

---

## 🔧 Troubleshooting

### ❌ Common Issues

#### **Component Rendering Errors**

- **Symptom**: "Element type is invalid" errors
- **Solution**: Check component imports and exports
- **Prevention**: Use minimal component versions for testing

#### **Database Connection Issues**

- **Symptom**: "Supabase not configured" errors
- **Solution**: Verify environment variables
- **Prevention**: Check .env.local file exists

#### **Authentication Problems**

- **Symptom**: Login redirects or token errors
- **Solution**: Clear browser storage and re-login
- **Prevention**: Regular token refresh

#### **Styling Issues**

- **Symptom**: CSS not loading or broken layouts
- **Solution**: Check Tailwind configuration
- **Prevention**: Verify CSS imports and classes

### 🐛 Debug Tools

- **Database Debug Tab**: Inspect database content
- **Browser Console**: Check for JavaScript errors
- **Network Tab**: Monitor API requests
- **React DevTools**: Inspect component state

---

## 🚀 Future Enhancements

### 🔮 Planned Features

- **Advanced Analytics**: IRR calculations and sensitivity analysis
- **Scenario Comparison**: Side-by-side scenario analysis ✅ **IMPLEMENTED**
- **Export Functionality**: PDF reports and Excel exports
- **Collaboration Tools**: Team sharing and permissions
- **Mobile App**: Native mobile application
- **API Integration**: Connect with external financial tools
- **Scenario Timeline**: Interactive funding round timeline ✅ **IMPLEMENTED**

### 🎯 Technical Improvements

- **Performance**: Code splitting and lazy loading
- **Testing**: Unit and integration tests
- **Monitoring**: Error tracking and analytics
- **Security**: Enhanced authentication and authorization
- **Accessibility**: WCAG compliance improvements

### 📊 Data Enhancements

- **Market Data**: Real-time valuation data
- **Benchmarking**: Industry comparison tools
- **Forecasting**: AI-powered projections
- **Compliance**: Regulatory reporting features

---

## 📞 Support & Contact

### 🆘 Getting Help

- **Documentation**: This file and code comments
- **Issues**: GitHub issue tracker
- **Community**: Developer forums and discussions
- **Email**: Support email for direct assistance

### 🤝 Contributing

- **Code Standards**: TypeScript, ESLint, Prettier
- **Testing**: Unit tests for new features
- **Documentation**: Update docs with changes
- **Pull Requests**: Fork and submit PRs

---

## 📄 License & Legal

### 📜 License Information

- **License Type**: [Specify License]
- **Copyright**: [Copyright Information]
- **Terms of Service**: [Link to Terms]
- **Privacy Policy**: [Link to Privacy Policy]

### ⚖️ Legal Considerations

- **Financial Advice**: Not financial advice, educational tool only
- **Data Privacy**: GDPR and CCPA compliance
- **Security**: Industry-standard security practices
- **Compliance**: Financial regulations and requirements

---

## 🔄 Version History

### 📅 Recent Updates

- **v1.0.0**: Initial release with core functionality
- **v1.1.0**: Added exit scenario calculator
- **v1.2.0**: Enhanced UI with hover effects
- **v1.3.0**: Database debug tools and improvements
- **v1.4.0**: Scenario comparison tool and timeline feature

### 📋 Changelog

- **Component Enhancements**: Improved styling and animations
- **Bug Fixes**: Resolved rendering and authentication issues
- **Performance**: Optimized calculations and state management
- **UI/UX**: Enhanced user interface and experience
- **New Features**: Added scenario comparison tool and interactive timeline
- **Timeline Component**: Professional timeline visualization with milestone tracking

---

_This documentation is maintained as part of the Startup Value Simulator project. For the most up-to-date information, please refer to the codebase and issue tracker._
