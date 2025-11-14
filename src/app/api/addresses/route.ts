import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/addresses - List all addresses
export async function GET() {
  try {
    const addresses = await prisma.address.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch addresses' },
      { status: 500 }
    );
  }
}

// POST /api/addresses - Create new address
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const address = await prisma.address.create({
      data: {
        name: body.name,
        street: body.street,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        country: body.country || 'USA',
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        notes: body.notes,
      }
    });

    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error('Error creating address:', error);
    return NextResponse.json(
      { error: 'Failed to create address' },
      { status: 500 }
    );
  }
}

// PUT /api/addresses/:id - Update address
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const address = await prisma.address.update({
      where: { id },
      data: {
        name: data.name,
        street: data.street,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        country: data.country,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        notes: data.notes,
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error('Error updating address:', error);
    return NextResponse.json(
      { error: 'Failed to update address' },
      { status: 500 }
    );
  }
}

// DELETE /api/addresses/:id - Delete address
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id') || '0');

    await prisma.address.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting address:', error);
    return NextResponse.json(
      { error: 'Failed to delete address' },
      { status: 500 }
    );
  }
}
