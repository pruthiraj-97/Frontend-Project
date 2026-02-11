# 🏠 HouseMate - On-Demand Home Services Platform

A comprehensive Angular 19 application for connecting customers with trusted home service experts. Built with modern web technologies and following best practices.

## 📋 Overview

HouseMate is a full-stack home services platform similar to Urban Company, featuring:

- **Customer App**: Book services, track experts, manage bookings, rate services
- **Expert App**: Accept jobs, manage availability, track earnings
- **Admin Panel**: Manage users, services, and platform operations (planned)

## ✨ Features

### Customer Features
- ✅ Multi-step registration with ID verification
- ✅ Secure login with phone + password
- ✅ Browse service categories
- ✅ Complete booking flow (5 steps)
  - Category selection
  - Service selection with pricing
  - Optional addons
  - Address selection
  - Booking confirmation (ASAP/Scheduled)
- ✅ Booking history with filters
- ✅ Dashboard with quick actions
- 🚧 Real-time expert tracking
- 🚧 Rating and feedback system
- 🚧 Address management
- 🚧 Booking modifications

### Expert Features
- 🚧 Expert registration with skills and zones
- 🚧 Job offers and acceptance
- 🚧 Availability management
- 🚧 Earnings and payout tracking
- 🚧 Navigation to customer location
- 🚧 OTP-based job completion

### Technical Features
- ✅ Angular 19 with standalone components
- ✅ Reactive forms with validation
- ✅ JWT-based authentication
- ✅ Role-based access control (Customer/Expert)
- ✅ HTTP interceptors for auth
- ✅ Route guards for protection
- ✅ Lazy loading for performance
- ✅ Responsive design (mobile-first)
- ✅ JSON Server mock backend
- ✅ TypeScript strict mode
- ✅ SCSS for styling

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ (v24.12.0 recommended)
- npm v9+ (v11.6.2 recommended)
- Modern web browser

### Installation

```bash
# Clone or navigate to the project
cd "/Users/osurtani/Desktop/angular project telegram"

# Install dependencies
npm install

# Or use yarn
yarn install
```

### Running the Application

```bash
# Start both backend and frontend
npm run dev

# Or start separately:
# Terminal 1 - JSON Server (Backend)
npm run server

# Terminal 2 - Angular Dev Server (Frontend)
npm start
```

### Access the Application

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

## 🧪 Test Credentials

### Customer Account
- Phone: `9876543210`
- Password: `password123`

### Expert Account
- Phone: `9876543211`
- Password: `password123`

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services and guards
│   │   ├── auth/               # Authentication service
│   │   ├── guards/             # Route guards
│   │   └── interceptors/       # HTTP interceptors
│   ├── features/               # Feature modules
│   │   ├── landing/           # Landing page
│   │   ├── customer/          # Customer features
│   │   └── expert/            # Expert features
│   ├── shared/                # Shared components and models
│   │   └── models/           # TypeScript interfaces
│   ├── app.component.ts      # Root component
│   └── app.routes.ts         # Application routes
├── index.html                # Main HTML file
├── main.ts                   # Application entry point
└── styles.scss              # Global styles
```

## 🎨 Design System

### Color Palette
- **Primary**: `#667eea` (Purple)
- **Secondary**: `#764ba2` (Dark Purple)
- **Accent**: `#1976d2` (Blue)
- **Success**: `#4caf50` (Green)
- **Warning**: `#ff9800` (Orange)
- **Error**: `#f44336` (Red)

### Typography
- **Headings**: Bold, 24-36px
- **Body**: Regular, 14-16px
- **Small**: 12-13px

### Components
- Cards with 12-16px border-radius
- Material Icons for iconography
- Responsive grid layouts
- Form validation with error states

## 📚 Documentation

- [Installation Guide](INSTALLATION.md) - Detailed installation instructions
- [Project Status](PROJECT_STATUS.md) - Current progress and roadmap
- [Figma Designs](figma/README.md) - Design documentation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Angular 19
- **Language**: TypeScript 5.6
- **Styling**: SCSS
- **State Management**: RxJS BehaviorSubjects
- **Forms**: Reactive Forms
- **Routing**: Angular Router with lazy loading
- **Icons**: Material Icons

### Backend (Mock)
- **Server**: JSON Server
- **Database**: db.json (mock data)
- **API**: RESTful endpoints

### Development Tools
- **Build Tool**: Angular CLI
- **Package Manager**: npm/yarn
- **Concurrent Execution**: concurrently

## 📦 Available Scripts

```bash
npm start          # Start Angular dev server (port 4200)
npm run server     # Start JSON server (port 3000)
npm run dev        # Start both servers concurrently
npm run build      # Build for production
npm test           # Run tests (when implemented)
```

## 🗺️ Roadmap

### Phase 1: Customer Features (60% Complete)
- [x] Registration and Login
- [x] Dashboard
- [x] Book Service Flow
- [x] Booking History
- [ ] Booking Details with Tracking
- [ ] Address Management
- [ ] Modify/Cancel Bookings
- [ ] Rating and Feedback

### Phase 2: Expert Features (10% Complete)
- [ ] Expert Registration
- [ ] Expert Dashboard
- [ ] Job Management
- [ ] Availability Control
- [ ] Earnings Tracking
- [ ] Navigation and OTP

### Phase 3: Advanced Features (0% Complete)
- [ ] Real-time Tracking (WebSocket)
- [ ] Payment Gateway Integration
- [ ] SMS/Email OTP Verification
- [ ] Push Notifications
- [ ] In-app Chat
- [ ] Admin Panel

### Phase 4: Production Ready
- [ ] Unit Tests
- [ ] E2E Tests
- [ ] Performance Optimization
- [ ] SEO Optimization
- [ ] PWA Features
- [ ] Deployment

## 🤝 Contributing

This is a learning/demonstration project. Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational purposes.

## 🙏 Acknowledgments

- Figma designs provided by the team
- Inspired by Urban Company and similar platforms
- Built with Angular 19 and modern web technologies

## 📞 Support

For issues or questions:
1. Check the [Installation Guide](INSTALLATION.md)
2. Review the [Project Status](PROJECT_STATUS.md)
3. Check console logs for errors
4. Verify JSON Server is running on port 3000

---

**Built with ❤️ using Angular 19**

