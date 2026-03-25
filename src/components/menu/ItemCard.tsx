'use client';

import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatPrice } from '@/lib/utils';
import ItemModal from './ItemModal';

export default function ItemCard({ item }: { item: MenuItem }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div 
        className={`card ${item.isAvailable ? 'card-hover' : ''}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          cursor: item.isAvailable ? 'pointer' : 'not-allowed',
          opacity: item.isAvailable ? 1 : 0.6,
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={() => { if (item.isAvailable) setModalOpen(true); }}
      >
        {!item.isAvailable && (
          <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--color-error)', color: 'white', padding: '0.25rem 0.5rem', fontSize: '12px', fontWeight: 600, borderBottomLeftRadius: 'var(--radius-md)' }}>
            Sold Out
          </div>
        )}
        
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xs)' }}>
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600, lineHeight: 1.3, paddingRight: 'var(--space-sm)' }}>
              {item.name}
            </h3>
            <span className="price">{formatPrice(item.price)}</span>
          </div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.description}
          </p>
        </div>
        
        <div style={{ marginTop: 'var(--space-md)' }}>
          <button 
            className={`btn ${item.isAvailable ? 'btn-secondary' : 'btn-ghost'}`} 
            style={{ width: '100%' }}
            disabled={!item.isAvailable}
          >
            {item.isAvailable ? 'Quick Add' : 'Currently Unavailable'}
          </button>
        </div>
      </div>

      {modalOpen && (
        <ItemModal item={item} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
}
