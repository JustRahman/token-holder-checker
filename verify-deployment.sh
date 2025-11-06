#!/bin/bash

# Deployment Verification Script
# Checks if the Token Holder Monitor is ready for production

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     Token Holder Monitor - Deployment Verification            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

check_pass() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS_PASSED++))
}

check_fail() {
    echo -e "${RED}❌ $1${NC}"
    ((CHECKS_FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((CHECKS_WARNING++))
}

echo "🔍 Checking Prerequisites..."
echo ""

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: $NODE_VERSION"
else
    check_fail "Node.js not installed"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    check_pass "npm installed: $NPM_VERSION"
else
    check_fail "npm not installed"
fi

echo ""
echo "📦 Checking Project Files..."
echo ""

# Check package.json
if [ -f "package.json" ]; then
    check_pass "package.json exists"
else
    check_fail "package.json missing"
fi

# Check tsconfig.json
if [ -f "tsconfig.json" ]; then
    check_pass "tsconfig.json exists"
else
    check_fail "tsconfig.json missing"
fi

# Check source files
if [ -d "src" ]; then
    check_pass "src/ directory exists"
else
    check_fail "src/ directory missing"
fi

echo ""
echo "🚀 Checking Deployment Files..."
echo ""

# Check deployment files
if [ -f "ecosystem.config.cjs" ]; then
    check_pass "PM2 config (ecosystem.config.cjs) exists"
else
    check_warn "PM2 config missing (optional for PM2 deployment)"
fi

if [ -f "Dockerfile" ]; then
    check_pass "Dockerfile exists"
else
    check_warn "Dockerfile missing (optional for Docker deployment)"
fi

if [ -f "docker-compose.yml" ]; then
    check_pass "docker-compose.yml exists"
else
    check_warn "docker-compose.yml missing (optional for Docker deployment)"
fi

if [ -f ".env.production" ]; then
    check_pass ".env.production template exists"
else
    check_warn ".env.production template missing"
fi

echo ""
echo "🔧 Checking Configuration..."
echo ""

# Check .env file
if [ -f ".env" ]; then
    check_pass ".env file exists"

    # Check for API keys
    if grep -q "MORALIS_API_KEY" .env && ! grep -q "MORALIS_API_KEY=your" .env; then
        check_pass "Moralis API key configured"
    else
        check_warn "Moralis API key not configured (will use mock data)"
    fi
else
    check_warn ".env file missing (will use defaults)"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    check_pass "Dependencies installed (node_modules exists)"
else
    check_warn "Dependencies not installed (run: npm install)"
fi

echo ""
echo "🔨 Checking Build..."
echo ""

# Check if dist exists
if [ -d "dist" ]; then
    check_pass "Build directory (dist/) exists"

    # Check if index.js exists
    if [ -f "dist/index.js" ]; then
        check_pass "Main file (dist/index.js) exists"
    else
        check_warn "Main file missing (run: npm run build)"
    fi
else
    check_warn "Build directory missing (run: npm run build)"
fi

echo ""
echo "📚 Checking Documentation..."
echo ""

# Check documentation
if [ -f "README.md" ]; then
    check_pass "README.md exists"
else
    check_warn "README.md missing"
fi

if [ -f "DEPLOYMENT.md" ]; then
    check_pass "DEPLOYMENT.md exists"
else
    check_warn "DEPLOYMENT.md missing"
fi

if [ -f "DEPLOYMENT_SUMMARY.md" ]; then
    check_pass "DEPLOYMENT_SUMMARY.md exists"
else
    check_warn "DEPLOYMENT_SUMMARY.md missing"
fi

echo ""
echo "📁 Checking Directory Structure..."
echo ""

# Check required directories
if [ -d "src/services" ]; then
    check_pass "Services directory exists"
else
    check_fail "Services directory missing"
fi

if [ -d "logs" ]; then
    check_pass "Logs directory exists"
else
    check_warn "Logs directory missing (will be created)"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "                        SUMMARY                                 "
echo "════════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}Passed:${NC}   $CHECKS_PASSED"
echo -e "${YELLOW}Warnings:${NC} $CHECKS_WARNING"
echo -e "${RED}Failed:${NC}   $CHECKS_FAILED"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo "════════════════════════════════════════════════════════════════"
    echo -e "${GREEN}✅ DEPLOYMENT READY!${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Next steps:"
    echo "  1. If warnings exist, review them above"
    echo "  2. Configure .env with your API keys"
    echo "  3. Run: npm run deploy:pm2 or npm run deploy:docker"
    echo "  4. Test: Call the 'health' entrypoint"
    echo ""
    exit 0
else
    echo "════════════════════════════════════════════════════════════════"
    echo -e "${RED}❌ ISSUES FOUND!${NC}"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "Please fix the failed checks above before deploying."
    echo ""
    exit 1
fi
