import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Generate random coordinates within a bounding box
function randomCoordinate(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Sample cities in North America with their approximate coordinates
const cities = [
  { name: 'Vancouver', lat: 49.2827, lng: -123.1207, state: 'BC' },
  { name: 'Surrey', lat: 49.1913, lng: -122.8490, state: 'BC' },
  { name: 'Burnaby', lat: 49.2488, lng: -122.9805, state: 'BC' },
  { name: 'Richmond', lat: 49.1666, lng: -123.1336, state: 'BC' },
  { name: 'Seattle', lat: 47.6062, lng: -122.3321, state: 'WA' },
  { name: 'Portland', lat: 45.5155, lng: -122.6789, state: 'OR' },
  { name: 'San Francisco', lat: 37.7749, lng: -122.4194, state: 'CA' },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, state: 'CA' },
];

const businessTypes = [
  'Coffee Shop', 'Restaurant', 'Retail Store', 'Office', 'Warehouse',
  'Medical Clinic', 'Pharmacy', 'Bank', 'Gym', 'Salon'
];

const streets = [
  'Main St', 'Oak Ave', 'Maple Dr', 'Pine Rd', 'Cedar Ln',
  'Elm St', 'Broadway', 'Park Ave', 'Market St', 'First Ave'
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.address.deleteMany();

  const addresses = [];

  // Generate 1000 addresses
  for (let i = 0; i < 1000; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const businessType = businessTypes[Math.floor(Math.random() * businessTypes.length)];
    const street = streets[Math.floor(Math.random() * streets.length)];
    
    // Generate coordinates within ~50km of city center
    const latOffset = (Math.random() - 0.5) * 0.5; // ~50km
    const lngOffset = (Math.random() - 0.5) * 0.5;
    
    addresses.push({
      name: `${businessType} ${i + 1}`,
      street: `${Math.floor(Math.random() * 9999) + 1} ${street}`,
      city: city.name,
      state: city.state,
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      country: 'USA',
      latitude: city.lat + latOffset,
      longitude: city.lng + lngOffset,
      notes: i % 10 === 0 ? 'Priority customer' : null,
    });
  }

  // Bulk insert
  await prisma.address.createMany({
    data: addresses,
  });

  console.log(`✅ Seeded ${addresses.length} addresses`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
