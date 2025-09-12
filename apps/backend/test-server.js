const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORS configuration for mobile app
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://192.168.1.101:8081',
    'exp://192.168.1.101:8081',
    'exp://z4eqyc4-anonymous-8081.exp.direct'
  ],
  credentials: true
}));

app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Auth endpoints for mobile app
app.post('/api/auth/register', (req, res) => {
  console.log('Registration request received:', req.body);
  res.json({ 
    success: true, 
    message: 'Registration successful',
    user: { id: 1, email: req.body.email },
    token: 'test-jwt-token'
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request received:', req.body);
  res.json({ 
    success: true, 
    message: 'Login successful',
    token: 'test-jwt-token',
    user: { id: 1, email: req.body.email }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Test server running on http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile app can connect to: http://192.168.1.101:${PORT}/api`);
});
