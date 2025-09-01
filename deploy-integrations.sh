#!/bin/bash

# TaskFlow Integrations Production Deployment Script
# This script sets up the integrations system for production deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root"
   exit 1
fi

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_ROOT/apps/backend"
ADMIN_DIR="$PROJECT_ROOT/apps/admin"
ENV_FILE="$PROJECT_ROOT/.env"

log "Starting TaskFlow Integrations Production Deployment"

# Step 1: Check prerequisites
log "Checking prerequisites..."

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    error "Node.js 16 or higher is required. Current version: $(node --version)"
    exit 1
fi
success "Node.js version: $(node --version)"

# Check npm
if ! command -v npm &> /dev/null; then
    error "npm is not installed"
    exit 1
fi
success "npm is available"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    warning "MongoDB is not installed locally. Make sure you have a MongoDB instance running."
else
    success "MongoDB is available"
fi

# Step 2: Environment setup
log "Setting up environment variables..."

if [ ! -f "$ENV_FILE" ]; then
    log "Creating .env file..."
    cat > "$ENV_FILE" << EOF
# Database Configuration
DATABASE_URL=mongodb://localhost:27017/taskflow

# JWT Configuration
JWT_SECRET=$(openssl rand -base64 64)
JWT_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Server Configuration
PORT=5000
NODE_ENV=production

# Integration Configuration
INTEGRATION_RATE_LIMIT=100
INTEGRATION_RATE_WINDOW=60000
WEBHOOK_SECRET=$(openssl rand -base64 32)

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Security
CORS_ORIGIN=https://yourdomain.com
SESSION_SECRET=$(openssl rand -base64 64)

# Email Configuration (if needed)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=uploads

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# Monitoring
ENABLE_METRICS=true
METRICS_PORT=9090
EOF
    success "Created .env file"
else
    warning ".env file already exists. Please review and update if needed."
fi

# Step 3: Install dependencies
log "Installing dependencies..."

# Backend dependencies
log "Installing backend dependencies..."
cd "$BACKEND_DIR"
npm ci --only=production
success "Backend dependencies installed"

# Admin frontend dependencies
log "Installing admin frontend dependencies..."
cd "$ADMIN_DIR"
npm ci
success "Admin frontend dependencies installed"

# Step 4: Build frontend
log "Building admin frontend..."
cd "$ADMIN_DIR"
npm run build
success "Admin frontend built"

# Step 5: Database setup
log "Setting up database..."

# Check if MongoDB is running
if command -v mongod &> /dev/null; then
    if pgrep -x "mongod" > /dev/null; then
        success "MongoDB is running"
    else
        warning "MongoDB is not running. Please start MongoDB before continuing."
        read -p "Do you want to continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Step 6: Security checks
log "Performing security checks..."

# Check for weak passwords in .env
if grep -q "password\|secret\|key" "$ENV_FILE"; then
    if grep -q "default\|test\|example" "$ENV_FILE"; then
        error "Found default/test values in .env file. Please update with secure values."
        exit 1
    fi
fi

# Check file permissions
chmod 600 "$ENV_FILE"
success "Set secure permissions on .env file"

# Step 7: Create necessary directories
log "Creating necessary directories..."

mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$BACKEND_DIR/uploads"
mkdir -p "$BACKEND_DIR/backups"

# Set proper permissions
chmod 755 "$BACKEND_DIR/logs"
chmod 755 "$BACKEND_DIR/uploads"
chmod 755 "$BACKEND_DIR/backups"

success "Created necessary directories"

# Step 8: Database initialization
log "Initializing database..."

cd "$BACKEND_DIR"

# Run database migrations/seeds
if [ -f "src/scripts/init-db.js" ]; then
    node src/scripts/init-db.js
    success "Database initialized"
else
    warning "Database initialization script not found. Please run manually if needed."
fi

# Step 9: Test integrations
log "Testing integrations..."

# Test database connection
if node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Database connection successful');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
" 2>/dev/null; then
    success "Database connection test passed"
else
    error "Database connection test failed"
    exit 1
fi

# Step 10: Create systemd service (optional)
log "Creating systemd service..."

if command -v systemctl &> /dev/null; then
    read -p "Do you want to create a systemd service for the backend? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        sudo tee /etc/systemd/system/taskflow-backend.service > /dev/null << EOF
[Unit]
Description=TaskFlow Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node src/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
        sudo systemctl daemon-reload
        sudo systemctl enable taskflow-backend
        success "Created systemd service: taskflow-backend"
    fi
fi

# Step 11: Setup monitoring
log "Setting up monitoring..."

# Create monitoring script
cat > "$PROJECT_ROOT/monitor-integrations.sh" << 'EOF'
#!/bin/bash

# Integration monitoring script
BACKEND_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/apps/backend" && pwd)"
LOG_FILE="$BACKEND_DIR/logs/integration-monitor.log"

# Check if backend is running
if ! pgrep -f "node.*server.js" > /dev/null; then
    echo "$(date): Backend is not running" >> "$LOG_FILE"
    # Restart backend
    cd "$BACKEND_DIR"
    nohup node src/server.js > logs/server.log 2>&1 &
fi

# Check database connection
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Database OK');
    process.exit(0);
  })
  .catch(err => {
    console.error('Database ERROR:', err.message);
    process.exit(1);
  });
" >> "$LOG_FILE" 2>&1

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo "$(date): Disk usage is high: ${DISK_USAGE}%" >> "$LOG_FILE"
fi
EOF

chmod +x "$PROJECT_ROOT/monitor-integrations.sh"
success "Created monitoring script"

# Step 12: Setup cron job for monitoring
log "Setting up cron job for monitoring..."

# Add to crontab if not already present
if ! crontab -l 2>/dev/null | grep -q "monitor-integrations.sh"; then
    (crontab -l 2>/dev/null; echo "*/5 * * * * $PROJECT_ROOT/monitor-integrations.sh") | crontab -
    success "Added monitoring cron job (runs every 5 minutes)"
else
    success "Monitoring cron job already exists"
fi

# Step 13: Final checks
log "Performing final checks..."

# Check if all required files exist
REQUIRED_FILES=(
    "$ENV_FILE"
    "$BACKEND_DIR/src/server.js"
    "$ADMIN_DIR/dist/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "✓ $file exists"
    else
        error "✗ $file missing"
        exit 1
    fi
done

# Step 14: Start services
log "Starting services..."

cd "$BACKEND_DIR"

# Start backend in background
nohup node src/server.js > logs/server.log 2>&1 &
BACKEND_PID=$!

# Wait a moment for server to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    success "Backend started successfully (PID: $BACKEND_PID)"
else
    error "Backend failed to start"
    exit 1
fi

# Step 15: Summary
log "Deployment completed successfully!"
echo
echo "=== DEPLOYMENT SUMMARY ==="
echo "Backend URL: http://localhost:5000"
echo "Admin Panel: http://localhost:5000/admin"
echo "API Documentation: http://localhost:5000/api/docs"
echo
echo "=== IMPORTANT FILES ==="
echo "Environment: $ENV_FILE"
echo "Backend Logs: $BACKEND_DIR/logs/"
echo "Monitoring Script: $PROJECT_ROOT/monitor-integrations.sh"
echo
echo "=== NEXT STEPS ==="
echo "1. Update .env file with your actual configuration"
echo "2. Set up your domain and SSL certificates"
echo "3. Configure your reverse proxy (nginx/apache)"
echo "4. Set up backup procedures"
echo "5. Configure monitoring and alerting"
echo
echo "=== SECURITY REMINDERS ==="
echo "✓ Change default passwords"
echo "✓ Update API keys and secrets"
echo "✓ Configure firewall rules"
echo "✓ Set up SSL/TLS certificates"
echo "✓ Regular security updates"
echo
success "TaskFlow Integrations is ready for production!"

# Save PID for easy management
echo $BACKEND_PID > "$PROJECT_ROOT/backend.pid"
echo "Backend PID saved to: $PROJECT_ROOT/backend.pid"
