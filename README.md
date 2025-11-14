  # jowla-router
App for providing the house that was visited earliest in the vicinity
# Route Optimizer - Salesman Route Planning App

A full-stack Next.js application for finding and optimizing routes to the nearest addresses based on your location.

## Features

- 🗺️ Interactive map interface
- 📍 Geospatial address storage with PostGIS
- 🚗 Real driving distances using OSRM
- 🎯 Configurable number of addresses (5-10)
- 🔄 Automatic route optimization (TSP solver)
- 📱 Responsive design

## Tech Stack

- **Frontend**: Next.js 14, React, Leaflet maps, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with PostGIS extension
- **Routing**: OSRM (Open Source Routing Machine)
- **ORM**: Prisma

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
git clone <your-repo-url>
cd route-optimizer
chmod +x scripts/setup.sh
./scripts/setup.sh
```

The script will:
- Create `.env` file
- Start PostgreSQL with PostGIS
- Run database migrations
- Seed 1000 sample addresses
- Start the Next.js app
- Initialize OSRM routing engine

⚠️ **Note**: OSRM will take 10-20 minutes to download and process North America map data on first run.

### Option 2: Manual Setup

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd route-optimizer
cp .env.example .env

# 2. Start containers
docker-compose up --build -d

# 3. Wait for PostgreSQL (about 10 seconds)
sleep 10

# 4. Run migrations
docker-compose exec app npx prisma migrate deploy

# 5. Seed database
docker-compose exec app npm run seed

# 6. Access the app
open http://localhost:3000
```

### Verify Installation

```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f app

# Check OSRM status
curl http://localhost:5000/health
```

## Project Structure

```
route-optimizer/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── addresses/
│   │   │   │   └── route.ts          # CRUD endpoints
│   │   │   └── routes/
│   │   │       ├── nearest/route.ts  # Find nearest addresses
│   │   │       └── optimize/route.ts # Optimize route
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Main map interface
│   ├── components/
│   │   ├── AddressForm.tsx           # Add/edit addresses
│   │   ├── AddressList.tsx           # Address management
│   │   └── RouteMap.tsx              # Interactive map
│   ├── lib/
│   │   ├── db.ts                     # Prisma client
│   │   └── osrm.ts                   # OSRM integration
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docker-compose.yml
├── Dockerfile
├── package.json
└── README.md
```

## API Endpoints

### Addresses CRUD

- `GET /api/addresses` - List all addresses
- `POST /api/addresses` - Create address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address

### Route Operations

- `POST /api/routes/nearest` - Find nearest addresses
  ```json
  {
    "latitude": 49.2827,
    "longitude": -123.1207,
    "limit": 10
  }
  ```

- `POST /api/routes/optimize` - Optimize route order
  ```json
  {
    "start": {"lat": 49.2827, "lng": -123.1207},
    "addressIds": [1, 2, 3, 4, 5]
  }
  ```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@db:5432/routeoptimizer?schema=public"

# OSRM
OSRM_URL="http://osrm:5000"
# Or use public API: https://router.project-osrm.org

# App
NEXT_PUBLIC_MAP_CENTER_LAT=49.2827
NEXT_PUBLIC_MAP_CENTER_LNG=-123.1207
```

## Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Start PostgreSQL with PostGIS (requires Docker)
docker-compose up db osrm

# Run migrations
npm run prisma:migrate

# Start dev server
npm run dev
```

### Database Management

```bash
# Create migration
npm run prisma:migrate:dev

# Open Prisma Studio
npm run prisma:studio

# Reset database
npm run prisma:reset
```

## Deployment

### Single Container Deployment

Build and push:
```bash
docker build -t route-optimizer .
docker push your-registry/route-optimizer
```

### Multi-Container Deployment

Use the provided `docker-compose.yml` with your cloud provider:
- AWS ECS
- Google Cloud Run
- Azure Container Instances
- DigitalOcean App Platform

## OSRM Setup

### Using Public OSRM API
Set `OSRM_URL=https://router.project-osrm.org` in your `.env`

**Limitations**: 
- Rate limited
- Public infrastructure
- Demo use only

### Self-Hosted OSRM (Recommended for Production)

The included `docker-compose.yml` already sets up OSRM with North America data.

To use a different region:
1. Download map data from http://download.geofabrik.de/
2. Update `docker-compose.yml` osrm service volume
3. Rebuild containers

## Sample Data

The seed script adds 1000 sample addresses. To customize:

```bash
# Edit prisma/seed.ts
npm run seed
```

## Configuration

### Number of Addresses
Configure in the UI (default: 5-10 range)

### Map Settings
Update in `.env`:
- `NEXT_PUBLIC_MAP_CENTER_LAT`
- `NEXT_PUBLIC_MAP_CENTER_LNG`

### Search Radius
Modify in `src/app/api/routes/nearest/route.ts` (default: 50km initial filter)

## Performance Tips

1. **PostGIS Indexes**: Already configured in schema
2. **OSRM Caching**: Consider Redis for frequently requested routes
3. **Database Connection Pool**: Configured in Prisma
4. **Map Tile Caching**: Uses OpenStreetMap CDN

## Troubleshooting

### PostGIS Extension Error
```bash
docker-compose exec db psql -U user -d routeoptimizer -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

### OSRM Container Issues
OSRM needs time to process map data on first startup (5-10 minutes)

### Port Conflicts
Change ports in `docker-compose.yml` if 3000, 5432, or 5000 are already in use

## Key Implementation Files

See the artifacts below for the complete implementation:
1. `docker-compose.yml` - Container orchestration
2. `Dockerfile` - App container config
3. `package.json` - Dependencies
4. `prisma/schema.prisma` - Database schema
5. `src/app/page.tsx` - Main UI
6. `src/app/api/addresses/route.ts` - Address CRUD
7. `src/app/api/routes/nearest/route.ts` - Find nearest
8. `src/app/api/routes/optimize/route.ts` - Route optimizer
9. `.env.example` - Environment template

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Need help?** Open an issue on GitHub
