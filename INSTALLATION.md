# HouseMate Installation Guide

## Prerequisites

- Node.js v18+ (you have v24.12.0 ✅)
- npm v9+ (you have v11.6.2 ✅)
- Yarn (optional, installed via brew ✅)

## Installation Steps

### Option 1: Using NPM (Recommended)

The project has a `.npmrc` file configured to use the public npm registry.

```bash
# Navigate to project directory
cd "/Users/osurtani/Desktop/angular project telegram"

# Install dependencies
npm install

# If you encounter proxy issues, try:
npm install --registry=https://registry.npmjs.org/
```

### Option 2: Using Yarn

```bash
# Navigate to project directory
cd "/Users/osurtani/Desktop/angular project telegram"

# Install dependencies
yarn install
```

### Option 3: Manual Installation (If automated install fails)

If npm/yarn installations fail due to corporate proxy issues, you can install packages individually:

```bash
# Core Angular packages
npm install @angular/animations@19 @angular/common@19 @angular/compiler@19 @angular/core@19 @angular/forms@19 @angular/platform-browser@19 @angular/platform-browser-dynamic@19 @angular/router@19 --registry=https://registry.npmjs.org/

# RxJS and Zone.js
npm install rxjs@7 zone.js@0.15 tslib@2 --registry=https://registry.npmjs.org/

# JWT Decode
npm install jwt-decode@4 --registry=https://registry.npmjs.org/

# Dev Dependencies
npm install -D @angular-devkit/build-angular@19 @angular/cli@19 @angular/compiler-cli@19 typescript@5.6 --registry=https://registry.npmjs.org/

# JSON Server and Concurrently
npm install -D json-server@1 concurrently@9 --registry=https://registry.npmjs.org/
```

## Running the Application

### Start Both Servers (Recommended)

```bash
npm run dev
```

This will start:
- JSON Server on `http://localhost:3000`
- Angular Dev Server on `http://localhost:4200`

### Start Servers Separately

#### Terminal 1: JSON Server (Backend)
```bash
npm run server
```

#### Terminal 2: Angular Dev Server (Frontend)
```bash
npm start
```

## Verify Installation

### 1. Check JSON Server
Open browser and navigate to:
```
http://localhost:3000/users
```

You should see the mock users data.

### 2. Check Angular App
Open browser and navigate to:
```
http://localhost:4200
```

You should see the HouseMate landing page.

## Test the Application

### Customer Flow
1. Go to `http://localhost:4200`
2. Click "BOOK SERVICE" or navigate to Customer Login
3. **Register a new customer** or **Login with test credentials**:
   - Phone: `9876543210` (without +91)
   - Password: `password123`
4. Explore the customer dashboard
5. Try booking a service

### Expert Flow
1. Navigate to Expert Login
2. Login with test credentials:
   - Phone: `9876543211` (without +91)
   - Password: `password123`
3. Explore expert features (currently placeholders)

## Troubleshooting

### Issue: npm install fails with 403 Forbidden

**Solution**: The `.npmrc` file should handle this, but if it persists:

```bash
# Temporarily override npm registry
npm config set registry https://registry.npmjs.org/

# Install dependencies
npm install

# Restore original registry (if needed)
npm config set registry https://jfrog-proxy.tekioncloud.xyz/artifactory/api/npm/rpe-virtual-npm/
```

### Issue: Port 3000 or 4200 already in use

**Solution**: Kill the process using the port

```bash
# For macOS/Linux
lsof -ti:3000 | xargs kill -9
lsof -ti:4200 | xargs kill -9

# Or change the port in package.json
```

### Issue: Angular CLI not found

**Solution**: Install Angular CLI globally

```bash
npm install -g @angular/cli@19 --registry=https://registry.npmjs.org/
```

### Issue: TypeScript errors

**Solution**: Ensure TypeScript version matches

```bash
npm install typescript@5.6 --save-dev
```

## Project Structure

```
angular project telegram/
├── figma/              # Figma design files
├── src/                # Angular source code
│   ├── app/           # Application code
│   ├── index.html     # Main HTML file
│   ├── main.ts        # Application entry point
│   └── styles.scss    # Global styles
├── db.json            # JSON Server database
├── package.json       # Dependencies
├── angular.json       # Angular configuration
├── tsconfig.json      # TypeScript configuration
├── .npmrc             # NPM registry configuration
└── .yarnrc            # Yarn registry configuration
```

## Available Scripts

```bash
# Start Angular dev server
npm start

# Start JSON server
npm run server

# Start both servers concurrently
npm run dev

# Build for production
npm run build

# Run tests (when implemented)
npm test
```

## Next Steps After Installation

1. ✅ Verify both servers are running
2. ✅ Test customer registration and login
3. ✅ Test booking service flow
4. ✅ Test booking history
5. 🚧 Complete remaining features (see PROJECT_STATUS.md)

## Support

If you encounter any issues:
1. Check the console for error messages
2. Verify all dependencies are installed: `npm list`
3. Clear npm cache: `npm cache clean --force`
4. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Development Tips

- Use Chrome DevTools for debugging
- Check Network tab for API calls to JSON Server
- Use Redux DevTools for state management (if implemented)
- Enable source maps for easier debugging

## Production Build

When ready to deploy:

```bash
# Build the application
npm run build

# The build artifacts will be in the dist/ folder
# Deploy the contents of dist/ to your hosting service
```

For JSON Server in production, consider replacing it with a real backend (Node.js/Express, Spring Boot, etc.)

