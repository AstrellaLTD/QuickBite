'use client';

import { useState } from 'react';
import { Category, MenuItem } from '@/types';
import ItemCard from '@/components/menu/ItemCard';

interface MenuClientProps {
  categories: Category[];
  items: MenuItem[];
}

export default function MenuClient({ categories, items }: MenuClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Filter items by active category
  const filteredItems = activeCategory === 'all' 
    ? items 
    : items.filter(item => item.categoryId === activeCategory);

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) 0' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
        <h1 className="page-title">Our Menu</h1>
        <p className="page-subtitle">Fresh, hot, and delivered fast to your door</p>
      </div>

      {/* Category Navigation */}
      <div 
        style={{ 
          display: 'flex', 
          gap: 'var(--space-sm)', 
          overflowX: 'auto', 
          paddingBottom: 'var(--space-md)',
          marginBottom: 'var(--space-xl)',
          scrollbarWidth: 'none', // Firefox
          WebkitOverflowScrolling: 'touch',
        }}
        className="hide-scrollbar"
      >
        <button
          className={`badge ${activeCategory === 'all' ? 'badge-primary' : 'badge-ghost'}`}
          style={{ fontSize: 'var(--text-base)', padding: '0.5rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
          onClick={() => setActiveCategory('all')}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`badge ${activeCategory === cat.id ? 'badge-primary' : 'badge-ghost'}`}
            style={{ fontSize: 'var(--text-base)', padding: '0.5rem 1rem', cursor: 'pointer', whiteSpace: 'nowrap' }}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-3xl) 0', color: 'var(--color-text-secondary)' }}>
          <p>No items found in this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {filteredItems.map(item => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
