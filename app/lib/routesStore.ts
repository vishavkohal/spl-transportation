// lib/routesStore.ts
import { prisma } from './prisma';

// Define a type that matches your current JSON shape
export type PricingItem = {
  passengers: string;
  price: number;
};

export type RouteDTO = {
  id: number;
  from: string;
  to: string;
  distance: string;
  duration: string;
  pricing: PricingItem[];
};

// Helper to map Prisma Route + RoutePricing[] to your DTO
function mapRoute(route: any): RouteDTO {
  return {
    id: route.id,
    from: route.from,
    to: route.to,
    distance: route.distance,
    duration: route.duration,
    pricing: route.pricing.map((p: any) => ({
      passengers: p.passengers,
      price: p.price,
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

export async function addRoute(route: Omit<RouteDTO, 'id'>): Promise<RouteDTO> {
  const created = await prisma.route.create({
    data: {
      from: route.from,
      to: route.to,
      distance: route.distance,
      duration: route.duration,
      pricing: {
        create: route.pricing.map((p) => ({
          passengers: p.passengers,
          price: p.price,
        })),
      },
    },
    include: { pricing: true },
  });

  return mapRoute(created);
}

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
      })),
    };
  }

  try {
    const updated = await prisma.route.update({
      where: { id },
      data: {
        from: patch.from,
        to: patch.to,
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
