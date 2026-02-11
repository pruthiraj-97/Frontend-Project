const jsonServer = require('json-server');
const cors = require('cors');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Enable CORS for all origins
server.use(cors());

// Add custom middleware for logging
server.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add custom routes before JSON Server router
server.use(jsonServer.bodyParser);

// Custom route for authentication
server.post('/auth/login', (req, res) => {
  const { phone, password } = req.body;
  const db = router.db;
  const user = db.get('users').find({ phone, password }).value();
  
  if (user) {
    // Create a simple JWT-like token (in production, use proper JWT)
    const token = Buffer.from(JSON.stringify({ 
      id: user.id, 
      phone: user.phone, 
      roles: user.roles 
    })).toString('base64');
    
    res.json({ 
      success: true, 
      token, 
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles
      }
    });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Custom route for registration
server.post('/auth/register', (req, res) => {
  const { phone, email, fullName, password, role } = req.body;
  const db = router.db;
  
  // Check if user already exists
  const existingUser = db.get('users').find({ phone }).value();
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'User already exists' });
  }
  
  // Create new user
  const newUser = {
    id: `user-${Date.now()}`,
    phone,
    email,
    fullName,
    password,
    roles: [role === 'expert' ? 'ROLE_EXPERT' : 'ROLE_CUSTOMER'],
    blocked: false,
    createdAt: new Date().toISOString()
  };
  
  db.get('users').push(newUser).write();
  
  res.json({ 
    success: true, 
    user: {
      id: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      fullName: newUser.fullName,
      roles: newUser.roles
    }
  });
});

// Use default router
server.use(router);

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log('');
  console.log('🚀 HouseMate Backend Server is running!');
  console.log('');
  console.log(`📡 API Server: http://localhost:${PORT}`);
  console.log(`📊 Resources: http://localhost:${PORT}/db`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  - POST /auth/login');
  console.log('  - POST /auth/register');
  console.log('  - GET/POST/PUT/PATCH/DELETE /users');
  console.log('  - GET/POST/PUT/PATCH/DELETE /customerProfiles');
  console.log('  - GET/POST/PUT/PATCH/DELETE /expertProfiles');
  console.log('  - GET/POST/PUT/PATCH/DELETE /bookings');
  console.log('  - GET/POST/PUT/PATCH/DELETE /services');
  console.log('  - GET/POST/PUT/PATCH/DELETE /categories');
  console.log('  - GET/POST/PUT/PATCH/DELETE /addresses');
  console.log('  - GET/POST/PUT/PATCH/DELETE /payments');
  console.log('  - GET/POST/PUT/PATCH/DELETE /ratings');
  console.log('  - And more...');
  console.log('');
});

