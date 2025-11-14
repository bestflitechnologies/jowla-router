#!/bin/bash

echo "🚀 Route Optimizer Setup Script"
echo "================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "ℹ️  .env file already exists"
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d db

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run database migrations
echo "🗄️  Running database migrations..."
docker-compose exec -T db psql -U routeuser -d routeoptimizer -c "CREATE EXTENSION IF NOT EXISTS postgis;"

# Build and start the app
echo "🏗️  Building and starting the application..."
docker-compose up --build -d app

# Wait for the app to be ready
echo "⏳ Waiting for application to start..."
sleep 5

# Run migrations through the app
echo "📊 Running Prisma migrations..."
docker-compose exec -T app npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database with sample data..."
docker-compose exec -T app npm run seed

# Start OSRM (this takes a while on first run)
echo "🗺️  Starting OSRM routing engine..."
echo "⚠️  Note: OSRM will take 10-20 minutes to download and process map data on first run"
docker-compose up -d osrm

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 Your application is running at: http://localhost:3000"
echo "🗄️  PostgreSQL is running at: localhost:5432"
echo "🗺️  OSRM will be ready at: http://localhost:5000 (may take time on first run)"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To reset everything: docker-compose down -v && ./scripts/setup.sh"
echo ""
