# 🚀 HouseMate - Quick Reference Guide

## ⚡ Quick Start (3 Steps)

```bash
# 1. Install dependencies
npm install

# 2. Start the application
npm run dev

# 3. Open browser
# http://localhost:4200
```

Or use the quick start script:
```bash
./start.sh
```

## 🔑 Test Credentials

| Role | Phone | Password |
|------|-------|----------|
| Customer | `9876543210` | `password123` |
| Expert | `9876543211` | `password123` |

## 📍 URLs

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:4200 | Angular app |
| Backend API | http://localhost:3000 | JSON Server |
| Users API | http://localhost:3000/users | View all users |
| Bookings API | http://localhost:3000/bookings | View all bookings |
| Services API | http://localhost:3000/services | View all services |

## 🗂️ Project Structure

```
angular project telegram/
├── figma/                    # 📐 19 Figma design files
├── src/
│   ├── app/
│   │   ├── core/            # 🔐 Auth, Guards, Interceptors
│   │   ├── features/        # 🎯 Customer & Expert features
│   │   └── shared/          # 🔄 Models & Utilities
│   ├── index.html           # 📄 Main HTML
│   ├── main.ts              # 🚀 Entry point
│   └── styles.scss          # 🎨 Global styles
├── db.json                  # 💾 Mock database
├── package.json             # 📦 Dependencies
├── README.md                # 📖 Main documentation
├── INSTALLATION.md          # 🔧 Installation guide
├── PROJECT_STATUS.md        # 📊 Progress tracker
└── SUMMARY.md               # 📝 Complete summary
```

## ✅ What's Working

### Customer Features
- ✅ Registration (3-step wizard)
- ✅ Login (phone + password)
- ✅ Dashboard (categories, quick actions, recent bookings)
- ✅ Book Service (5-step flow)
- ✅ Booking History (with filters)

### Infrastructure
- ✅ Authentication & Authorization
- ✅ Route Guards
- ✅ HTTP Interceptors
- ✅ Mock Backend (JSON Server)
- ✅ Responsive Design

## 🚧 What's Pending

### Customer Features
- ⏳ Booking Details
- ⏳ Address Management
- ⏳ Modify Booking
- ⏳ Feedback/Rating
- ⏳ Real-time Tracking

### Expert Features
- ⏳ Expert Registration
- ⏳ Expert Dashboard
- ⏳ Job Management
- ⏳ Availability Control
- ⏳ Earnings Tracking

## 📜 Available Commands

```bash
# Development
npm start              # Start Angular dev server only
npm run server         # Start JSON server only
npm run dev            # Start both servers

# Build
npm run build          # Build for production

# Utilities
./start.sh             # Quick start script
```

## 🎨 Design System

### Colors
```scss
$primary: #667eea;      // Purple
$secondary: #764ba2;    // Dark Purple
$accent: #1976d2;       // Blue
$success: #4caf50;      // Green
$warning: #ff9800;      // Orange
$error: #f44336;        // Red
```

### Breakpoints
```scss
$mobile: 768px;
```

## 🔍 Common Tasks

### Add a New Component
```bash
# Customer component
ng generate component features/customer/my-component --standalone

# Expert component
ng generate component features/expert/my-component --standalone
```

### Add a New Service
```bash
ng generate service core/services/my-service
```

### Add a New Model
Create file in `src/app/shared/models/my-model.model.ts`

### Test API Endpoints
```bash
# Get all users
curl http://localhost:3000/users

# Get all bookings
curl http://localhost:3000/bookings

# Get specific user
curl http://localhost:3000/users/1
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 4200
lsof -ti:4200 | xargs kill -9
```

### npm Install Fails
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install --registry=https://registry.npmjs.org/
```

### Angular CLI Not Found
```bash
npm install -g @angular/cli@19
```

## 📊 Progress Tracker

| Feature | Status | Completion |
|---------|--------|------------|
| Backend Setup | ✅ | 100% |
| Core Infrastructure | ✅ | 100% |
| Landing Page | ✅ | 100% |
| Customer Registration | ✅ | 100% |
| Customer Login | ✅ | 100% |
| Customer Dashboard | ✅ | 100% |
| Book Service | ✅ | 100% |
| Booking History | ✅ | 100% |
| Booking Details | ⏳ | 0% |
| Address Management | ⏳ | 0% |
| Expert Features | ⏳ | 10% |
| Advanced Features | ⏳ | 0% |
| **Overall** | 🚧 | **40%** |

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Main project overview |
| `INSTALLATION.md` | Detailed installation steps |
| `PROJECT_STATUS.md` | Current progress & roadmap |
| `SUMMARY.md` | Complete work summary |
| `QUICK_REFERENCE.md` | This file - quick reference |
| `figma/README.md` | Design documentation |

## 🎯 Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm run dev`
3. ✅ Test customer registration
4. ✅ Test booking flow
5. 🚧 Build remaining features
6. 🚧 Add tests
7. 🚧 Deploy

## 💡 Tips

- Use Chrome DevTools for debugging
- Check Network tab for API calls
- JSON Server auto-saves changes to db.json
- All routes are lazy-loaded for performance
- Forms have built-in validation
- Components are responsive by default

## 🆘 Need Help?

1. Check the console for errors
2. Verify JSON Server is running (http://localhost:3000)
3. Check if ports 3000 and 4200 are available
4. Review the documentation files
5. Check the Figma designs in `figma/` folder

---

**Quick Start**: `./start.sh` or `npm run dev`
**Documentation**: See README.md, INSTALLATION.md, PROJECT_STATUS.md
**Progress**: 40% Complete - Customer features working, Expert features pending

