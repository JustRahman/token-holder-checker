# 🚀 Production Deployment Guide

Complete guide for deploying the Token Holder Monitor agent to production.

## 📋 Prerequisites

- **Node.js**: ≥ 18.x
- **npm**: ≥ 9.x
- **API Keys**: Moralis, CoinGecko (optional: Alchemy)
- **Server**: Linux/Ubuntu recommended
- **Domain**: (optional) for public access

## 🎯 Quick Start - Production Deployment

### Option 1: PM2 (Recommended for Node.js)

```bash
# 1. Install PM2 globally
npm install -g pm2

# 2. Clone and setup
git clone <your-repo>
cd token-holder-monitor

# 3. Install dependencies and build
npm ci
npm run build

# 4. Configure environment
cp .env.production .env
# Edit .env with your API keys

# 5. Start with PM2
npm run deploy:pm2

# 6. View logs
npm run logs:pm2

# 7. Set up auto-start on reboot
pm2 startup
pm2 save
```

### Option 2: Docker (Recommended for Containerized)

```bash
# 1. Clone and setup
git clone <your-repo>
cd token-holder-monitor

# 2. Configure environment
cp .env.production .env
# Edit .env with your API keys

# 3. Build and start
npm run deploy:docker

# 4. View logs
npm run logs:docker

# 5. Check status
docker-compose ps
```

### Option 3: Direct Node.js

```bash
# 1. Clone and setup
git clone <your-repo>
cd token-holder-monitor

# 2. Install and build
npm ci
npm run build

# 3. Configure environment
cp .env.production .env
# Edit .env with your API keys

# 4. Start in production mode
npm run start:prod
```

## 🔧 Environment Configuration

### Required Environment Variables

Create a `.env` file based on `.env.production`:

```bash
# API Keys (REQUIRED)
MORALIS_API_KEY=your_moralis_key_here
COINGECKO_API_KEY=your_coingecko_key_here

# Node Environment
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# Cache Configuration
CACHE_TTL_HOLDER_DATA=600
CACHE_TTL_PRICE_DATA=60
CACHE_TTL_TOKEN_INFO=3600

# Rate Limiting
API_RATE_LIMIT=5
```

### Getting API Keys

1. **Moralis** (Required):
   - Sign up at https://moralis.io
   - Create a project
   - Copy your API key

2. **CoinGecko** (Recommended):
   - Sign up at https://www.coingecko.com/en/api
   - Free tier available
   - Pro tier for higher limits

3. **Alchemy** (Optional backup):
   - Sign up at https://www.alchemy.com
   - Create an app
   - Copy your API key

## 📦 Deployment Methods

### PM2 Deployment

**Advantages:**
- ✅ Process management and auto-restart
- ✅ Built-in load balancing
- ✅ Log management
- ✅ Auto-start on server reboot
- ✅ Memory and CPU monitoring

**Commands:**
```bash
# Start
pm2 start ecosystem.config.cjs

# Monitor
pm2 monit

# Logs
pm2 logs token-holder-monitor

# Restart
pm2 restart token-holder-monitor

# Stop
pm2 stop token-holder-monitor

# Delete
pm2 delete token-holder-monitor
```

**Configuration:**
Edit `ecosystem.config.cjs` to customize:
- Memory limits
- Number of instances
- Log file locations
- Auto-restart settings

### Docker Deployment

**Advantages:**
- ✅ Isolated environment
- ✅ Easy scaling
- ✅ Consistent deployment
- ✅ Easy updates

**Commands:**
```bash
# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Restart
docker-compose restart

# Stop
docker-compose down

# Rebuild
docker-compose up -d --build --force-recreate
```

**Health Check:**
Docker automatically monitors the `/health` endpoint.

### Cloud Platform Deployments

#### AWS EC2
```bash
# 1. Launch Ubuntu instance
# 2. Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Clone and deploy
git clone <your-repo>
cd token-holder-monitor
npm ci
npm run build
npm run deploy:pm2
```

#### DigitalOcean Droplet
```bash
# Use Docker for easier deployment
sudo apt update
sudo apt install docker.io docker-compose
git clone <your-repo>
cd token-holder-monitor
cp .env.production .env
# Edit .env
docker-compose up -d
```

#### Heroku
```bash
# Create Procfile
echo "web: npm run start:prod" > Procfile

# Deploy
heroku create token-holder-monitor
heroku config:set MORALIS_API_KEY=your_key
git push heroku main
```

#### Railway
```bash
# Use railway.json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci && npm run build"
  },
  "deploy": {
    "startCommand": "npm run start:prod",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

## 🔍 Health Checks

The agent exposes a health check endpoint:

**Endpoint:** `/health` or call with agent-kit

**Response:**
```json
{
  "status": "ok",
  "version": "0.1.0",
  "timestamp": 1699564800000,
  "supported_chains": [
    "ethereum",
    "base",
    "arbitrum",
    "optimism",
    "polygon",
    "bsc"
  ]
}
```

**Usage:**
```bash
# Direct HTTP check (if using HTTP server)
curl http://localhost:3000/health

# With agent-kit client
# Call the "health" entrypoint
```

## 📊 Monitoring

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# Process list
pm2 list

# Detailed info
pm2 show token-holder-monitor

# CPU and Memory usage
pm2 describe token-holder-monitor
```

### Docker Monitoring
```bash
# Container stats
docker stats token-holder-monitor

# Logs
docker logs -f token-holder-monitor

# Health status
docker inspect --format='{{.State.Health.Status}}' token-holder-monitor
```

### Application Logs

**PM2:**
- Logs location: `./logs/` directory
- Error logs: `./logs/error.log`
- Output logs: `./logs/out.log`

**Docker:**
- View with: `docker-compose logs -f`
- Logs are managed by Docker with rotation

## 🔐 Security Best Practices

1. **API Keys:**
   - Never commit `.env` to git
   - Use environment variables
   - Rotate keys regularly

2. **Server Security:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade

   # Configure firewall
   sudo ufw allow 22/tcp
   sudo ufw allow 3000/tcp
   sudo ufw enable
   ```

3. **HTTPS (Recommended for production):**
   - Use a reverse proxy (nginx)
   - Get free SSL with Let's Encrypt
   - See `nginx.conf` example below

4. **Rate Limiting:**
   - Already implemented in the agent
   - Configure in `.env`: `API_RATE_LIMIT=5`

## 🌐 Reverse Proxy Setup (Optional)

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/token-holder-monitor
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Enable and restart:**
```bash
sudo ln -s /etc/nginx/sites-available/token-holder-monitor /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 🔄 Updates and Maintenance

### Update Process (PM2)
```bash
# 1. Pull latest changes
git pull origin main

# 2. Install dependencies
npm ci

# 3. Rebuild
npm run build

# 4. Restart
pm2 restart token-holder-monitor --update-env
```

### Update Process (Docker)
```bash
# 1. Pull latest changes
git pull origin main

# 2. Rebuild and restart
docker-compose up -d --build
```

### Backup Configuration
```bash
# Backup environment variables
cp .env .env.backup

# Backup PM2 config
pm2 save
```

## 📈 Scaling

### Vertical Scaling (More resources)
- Increase server CPU/RAM
- Adjust `max_memory_restart` in `ecosystem.config.cjs`

### Horizontal Scaling (Multiple instances)

**PM2:**
```javascript
// In ecosystem.config.cjs
instances: 4,  // or "max" for CPU count
exec_mode: 'cluster'
```

**Docker:**
```bash
docker-compose up -d --scale token-holder-monitor=4
```

## ⚠️ Troubleshooting

### Common Issues

**Issue: Agent won't start**
```bash
# Check logs
pm2 logs token-holder-monitor --lines 100

# Check environment
cat .env

# Verify build
npm run build
```

**Issue: API errors**
```bash
# Test API keys
curl -H "X-API-Key: $MORALIS_API_KEY" \
  https://deep-index.moralis.io/api/v2.2/erc20/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/owners

# Check rate limits
# Check account status on provider dashboards
```

**Issue: High memory usage**
```bash
# Restart PM2
pm2 restart token-holder-monitor

# Check cache settings in .env
# Reduce cache TTL if needed
```

**Issue: Port already in use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

## 📞 Support

For deployment issues:
1. Check logs: `pm2 logs` or `docker logs`
2. Verify environment variables in `.env`
3. Test API keys separately
4. Check server resources (memory, CPU)
5. Review firewall settings

## ✅ Deployment Checklist

Before going live:

- [ ] API keys configured in `.env`
- [ ] Application builds successfully (`npm run build`)
- [ ] Health check passes
- [ ] Logs are being written
- [ ] Server firewall configured
- [ ] (Optional) HTTPS/SSL certificate installed
- [ ] (Optional) Domain name configured
- [ ] Monitoring set up (PM2 or Docker)
- [ ] Auto-restart configured
- [ ] Backup strategy in place

## 🎉 Production Ready!

Once deployed, test the agent:

```bash
# Health check
curl http://your-server:3000/health

# Or use agent-kit client to call the health entrypoint
```

Your Token Holder Monitor is now running in production! 🚀

---

**Status:** ✅ Production Ready
**Estimated Setup Time:** 15-30 minutes
**Difficulty:** Easy to Medium
