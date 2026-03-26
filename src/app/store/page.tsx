import prisma from '@/lib/prisma';
import { Suspense } from 'react';
import StorefrontClient from '@/components/store/StorefrontClient';
import { Category, Product } from '@/types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Menu — HibaFood',
};

export default async function StorePage() {
  const dbCategories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      subcategories: { orderBy: { sortOrder: 'asc' } },
    },
  });

  const dbProducts = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      variations: { orderBy: { sortOrder: 'asc' } },
      optionGroups: {
        orderBy: { sortOrder: 'asc' },
        include: {
          choices: { orderBy: { sortOrder: 'asc' } },
        },
      },
      extras: { orderBy: { sortOrder: 'asc' } },
    },
  });

  const categories: Category[] = dbCategories.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    emoji: c.emoji,
    description: c.description,
    imageUrl: c.imageUrl,
    sortOrder: c.sortOrder,
    isActive: c.isActive,
    subcategories: c.subcategories.map((s: any) => ({
      id: s.id,
      categoryId: s.categoryId,
      slug: s.slug,
      name: s.name,
      imageUrl: s.imageUrl,
      sortOrder: s.sortOrder,
    })),
  }));

  const products: Product[] = dbProducts.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    categoryId: p.categoryId,
    subcategoryId: p.subcategoryId,
    name: p.name,
    description: p.description,
    basePrice: p.basePrice,
    maxPrice: p.maxPrice,
    imageUrl: p.imageUrl,
    isAvailable: p.isAvailable,
    isBestSeller: p.isBestSeller,
    note: p.note,
    variations: p.variations.map((v: any) => ({
      id: v.id,
      name: v.name,
      price: v.price,
      sortOrder: v.sortOrder,
    })),
    optionGroups: p.optionGroups.map((g: any) => ({
      id: g.id,
      name: g.name,
      maxSelect: g.maxSelect,
      sortOrder: g.sortOrder,
      choices: g.choices.map((c: any) => ({
        id: c.id,
        name: c.name,
        priceAdd: c.priceAdd,
        sortOrder: c.sortOrder,
      })),
    })),
    extras: p.extras.map((e: any) => ({
      id: e.id,
      name: e.name,
      priceAdd: e.priceAdd,
      sortOrder: e.sortOrder,
    })),
  }));

  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'rgba(245,240,235,0.5)', fontSize: '1.1rem' }}>Chargement du menu…</div>
      </div>
    }>
      <StorefrontClient categories={categories} products={products} />
    </Suspense>
  );
}
