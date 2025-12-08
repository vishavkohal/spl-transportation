// lib/routesStore.ts
import { prisma } from '@/lib/prisma';

// 1. UPDATED: PricingItem type with 'vehicleType'
export type PricingItem = {
  passengers: string;
  price: number;
  vehicleType: string; // New field
};

// 2. UPDATED: RouteDTO type with 'label' and 'description'
export type RouteDTO = {
  id: number;
  from: string;
  to: string;
  label: string | null; // New field, matches String? in Prisma
  description: string | null; // New field, matches String? in Prisma
  distance: string;
  duration: string;
  pricing: PricingItem[];
};

// 3. UPDATED: mapRoute function to include new fields
function mapRoute(route: any): RouteDTO {
  return {
    id: route.id,
    from: route.from,
    to: route.to,
    label: route.label, // Include new field
    description: route.description, // Include new field
    distance: route.distance,
    duration: route.duration,
    pricing: route.pricing.map((p: any) => ({
      passengers: p.passengers,
      price: p.price,
      vehicleType: p.vehicleType, // Include new field
    })),
  };
}

export async function getRoutes(): Promise<RouteDTO[]> {
  const routes = await prisma.route.findMany({
    include: { pricing: true },
    orderBy: { id: 'asc' },
  });

  return routes.map(mapRoute);
}

// 4. UPDATED: addRoute function to include new fields
export async function addRoute(route: Omit<RouteDTO, 'id'>): Promise<RouteDTO> {
  const created = await prisma.route.create({
    data: {
      from: route.from,
      to: route.to,
      label: route.label, // Include new field
      description: route.description, // Include new field
      distance: route.distance,
      duration: route.duration,
      pricing: {
        create: route.pricing.map((p) => ({
          passengers: p.passengers,
          price: p.price,
          vehicleType: p.vehicleType, // Include new field
        })),
      },
    },
    include: { pricing: true },
  });

  return mapRoute(created);
}

// 5. UPDATED: updateRoute function to include new fields
export async function updateRoute(
  id: number,
  patch: Partial<RouteDTO>
): Promise<RouteDTO | null> {
  // If pricing is included, for simplicity we’ll delete old pricing and recreate
  let pricingOp = undefined as any;

  if (patch.pricing) {
    pricingOp = {
      deleteMany: {}, // delete all existing pricing rows for this route
      create: patch.pricing.map((p) => ({
        passengers: p.passengers,
        price: p.price,
        vehicleType: p.vehicleType, // Include new field
      })),
    };
  }

  try {
    const updated = await prisma.route.update({
      where: { id },
      data: {
        from: patch.from,
        to: patch.to,
        label: patch.label, // Include new field
        description: patch.description, // Include new field
        distance: patch.distance,
        duration: patch.duration,
        ...(pricingOp && { pricing: pricingOp }),
      },
      include: { pricing: true },
    });

    return mapRoute(updated);
  } catch (err: any) {
    if (err.code === 'P2025') {
      // Record not found
      return null;
    }
    throw err;
  }
}

export async function deleteRoute(id: number): Promise<boolean> {
  try {
    await prisma.route.delete({
      where: { id },
    });
    return true;
  } catch (err: any) {
    if (err.code === 'P2025') {
      return false; // not found
    }
    throw err;
  }
}