#!/bin/bash

echo "=========================================="
echo "DevInsights - Automated Integration Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Please run this script from the devinsights-blog root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Directory structure verified${NC}"
echo ""

# Step 1: Integrate server.js
echo "📝 Step 1: Integrating backend server..."
cd backend/src

if [ -f "server-integrated.js" ]; then
    # Backup original
    if [ -f "server.js" ] && [ ! -f "server-original.js" ]; then
        mv server.js server-original.js
        echo -e "${YELLOW}   Backed up original server.js → server-original.js${NC}"
    fi
    
    # Use integrated version
    cp server-integrated.js server.js
    echo -e "${GREEN}   ✅ Integrated server.js updated${NC}"
else
    echo -e "${YELLOW}   ⚠️  server-integrated.js not found, skipping...${NC}"
fi

cd ../..

# Step 2: Integrate frontend main.js
echo ""
echo "📝 Step 2: Integrating frontend JavaScript..."
cd frontend/public/js

if [ -f "main-integrated.js" ]; then
    # Backup original
    if [ -f "main.js" ] && [ ! -f "main-original.js" ]; then
        mv main.js main-original.js
        echo -e "${YELLOW}   Backed up original main.js → main-original.js${NC}"
    fi
    
    # Use integrated version
    cp main-integrated.js main.js
    echo -e "${GREEN}   ✅ Integrated main.js updated${NC}"
else
    echo -e "${YELLOW}   ⚠️  main-integrated.js not found, skipping...${NC}"
fi

cd ../../..

# Step 3: Update HTML files
echo ""
echo "📝 Step 3: Updating HTML file paths..."
cd frontend/views

# Function to update HTML file
update_html_file() {
    local file=$1
    if [ -f "$file" ]; then
        # Create backup
        if [ ! -f "${file}.backup" ]; then
            cp "$file" "${file}.backup"
        fi
        
        # Update paths
        sed -i.tmp 's|href="index\.html"|href="/"|g' "$file"
        sed -i.tmp 's|href="blog-list\.html"|href="/blog-list"|g' "$file"
        sed -i.tmp 's|href="blog-detail\.html"|href="/blog-detail"|g' "$file"
        sed -i.tmp 's|href="about\.html"|href="/about"|g' "$file"
        sed -i.tmp 's|href="contact\.html"|href="/contact"|g' "$file"
        sed -i.tmp 's|href="login\.html"|href="/login"|g' "$file"
        sed -i.tmp 's|href="register\.html"|href="/register"|g' "$file"
        sed -i.tmp 's|href="admin-dashboard\.html"|href="/admin-dashboard"|g' "$file"
        sed -i.tmp 's|src="../public/css/style\.css"|src="/css/style.css"|g' "$file"
        sed -i.tmp 's|src="../public/js/|src="/js/|g' "$file"
        sed -i.tmp 's|href="../public/images/|href="/images/|g' "$file"
        
        # Remove temporary files
        rm -f "${file}.tmp"
        
        echo -e "${GREEN}   ✅ Updated $file${NC}"
    fi
}

# Update all HTML files
for htmlfile in *.html; do
    update_html_file "$htmlfile"
done

cd ../..

# Step 4: Update .env
echo ""
echo "📝 Step 4: Setting up environment variables..."
cd backend

if [ ! -f ".env" ]; then
    if [ -f ".env.example-integrated" ]; then
        cp .env.example-integrated .env
        echo -e "${GREEN}   ✅ Created .env from .env.example-integrated${NC}"
        echo -e "${YELLOW}   ⚠️  Please edit .env and add your PostgreSQL credentials${NC}"
    elif [ -f ".env.example" ]; then
        cp .env.example .env
        # Update CORS_ORIGIN
        sed -i.tmp 's|CORS_ORIGIN=.*|CORS_ORIGIN="*"|g' .env
        rm -f .env.tmp
        echo -e "${GREEN}   ✅ Created .env and updated CORS settings${NC}"
        echo -e "${YELLOW}   ⚠️  Please edit .env and add your PostgreSQL credentials${NC}"
    fi
else
    echo -e "${YELLOW}   ℹ️  .env already exists${NC}"
    # Update CORS_ORIGIN in existing .env
    if grep -q "CORS_ORIGIN=" .env; then
        sed -i.tmp 's|CORS_ORIGIN=.*|CORS_ORIGIN="*"|g' .env
        rm -f .env.tmp
        echo -e "${GREEN}   ✅ Updated CORS_ORIGIN to '*'${NC}"
    fi
fi

cd ..

echo ""
echo "=========================================="
echo -e "${GREEN}✅ Integration Complete!${NC}"
echo "=========================================="
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Configure Database:"
echo "   cd backend"
echo "   Edit .env file with your PostgreSQL credentials"
echo ""
echo "2. Setup Database:"
echo "   npm install"
echo "   npx prisma generate"
echo "   npx prisma migrate dev"
echo "   node prisma/seed.js"
echo ""
echo "3. Start Server:"
echo "   npm run dev"
echo ""
echo "4. Open Browser:"
echo "   http://localhost:3000"
echo ""
echo "=========================================="
echo "📧 Test Accounts:"
echo "   Admin:  admin@devinsights.com  / admin123"
echo "   Writer: writer@devinsights.com / writer123"
echo "   Reader: reader@devinsights.com / reader123"
echo "=========================================="
echo ""
echo -e "${GREEN}Happy Coding! 🚀${NC}"
echo ""