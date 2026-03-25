import prisma from '@/lib/prisma';
import MenuClient from './MenuClient';
import { Category, MenuItem, ItemCustomization, CustomizationOption } from '@/types';

// Convert Prisma types to our shared frontend types
function mapPrismaItems(prismaItems: any[]): MenuItem[] {
  return prismaItems.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    image: item.imageUrl,
    categoryId: item.categoryId,
    isAvailable: item.isAvailable,
    customizations: item.customizations.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      isRequired: c.isRequired,
      sortOrder: c.sortOrder,
      options: c.options.map((o: any) => ({
        id: o.id,
        label: o.label,
        priceModifier: o.priceModifier,
        sortOrder: o.sortOrder
      }))
    }))
  }));
}

export default async function MenuPage() {
  // Fetch fully hydrated categories and items
  const dbCategories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  });

  const dbItems = await prisma.menuItem.findMany({
    include: {
      customizations: {
        orderBy: { sortOrder: 'asc' },
        include: {
          options: {
            orderBy: { sortOrder: 'asc' }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' } // or sortOrder if added in future
  });

  const categories: Category[] = dbCategories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
  }));

  const items = mapPrismaItems(dbItems);

  return <MenuClient categories={categories} items={items} />;
}
