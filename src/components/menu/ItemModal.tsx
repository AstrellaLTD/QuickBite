'use client';

import { useState } from 'react';
import { MenuItem, SelectedCustomization } from '@/types';
import { formatPrice } from '@/lib/utils';
import { useCartStore } from '@/stores/cartStore';

interface ItemModalProps {
  item: MenuItem;
  onClose: () => void;
}

export default function ItemModal({ item, onClose }: ItemModalProps) {
  const addItem = useCartStore((state) => state.addItem);
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // State for user's selected options: { customizationId: optionId[] }
  const [selections, setSelections] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    if (item.customizations) {
      item.customizations.forEach(c => {
        initial[c.id] = c.isRequired && c.options.length > 0 ? [c.options[0].id] : [];
      });
    }
    return initial;
  });

  const handleOptionChange = (customizationId: string, optionId: string, type: 'RADIO' | 'CHECKBOX') => {
    setSelections(prev => {
      const current = prev[customizationId] || [];
      if (type === 'RADIO') {
        return { ...prev, [customizationId]: [optionId] };
      } else {
        if (current.includes(optionId)) {
          return { ...prev, [customizationId]: current.filter(id => id !== optionId) };
        } else {
          return { ...prev, [customizationId]: [...current, optionId] };
        }
      }
    });
  };

  // Calculate total price with selected modifiers
  const calculateTotal = () => {
    let modsTotal = 0;
    if (item.customizations) {
      item.customizations.forEach(c => {
        const selectedOptionIds = selections[c.id] || [];
        c.options.forEach(opt => {
          if (selectedOptionIds.includes(opt.id)) {
            modsTotal += opt.priceModifier;
          }
        });
      });
    }
    return (item.price + modsTotal) * quantity;
  };

  const handleAddToCart = () => {
    // Basic validation for required fields
    if (item.customizations) {
      for (const c of item.customizations) {
        if (c.isRequired && (!selections[c.id] || selections[c.id].length === 0)) {
          alert(`Please select an option for ${c.name}`);
          return;
        }
      }
    }

    // Build the selected customizations array for the cart
    const flatSelections: SelectedCustomization[] = [];
    if (item.customizations) {
      item.customizations.forEach(c => {
        const selectedOptionIds = selections[c.id] || [];
        c.options.forEach(opt => {
          if (selectedOptionIds.includes(opt.id)) {
            flatSelections.push({
              customizationId: c.id,
              customizationName: c.name,
              optionId: opt.id,
              optionLabel: opt.label,
              priceModifier: opt.priceModifier,
            });
          }
        });
      });
    }

    addItem(item, quantity, flatSelections, specialInstructions);
    
    // Show a mini notification here or just close for now
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-header">
          <h2 className="modal-title">{item.name}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div style={{ marginBottom: 'var(--space-lg)' }}>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-sm)' }}>
            {item.description}
          </p>
          <div className="price price-lg">{formatPrice(item.price)}</div>
        </div>

        <div className="divider" />

        {/* Customizations */}
        {item.customizations && item.customizations.length > 0 && (
          <div className="flex-col gap-lg" style={{ marginBottom: 'var(--space-xl)' }}>
            {item.customizations.sort((a,b) => a.sortOrder - b.sortOrder).map(c => (
              <div key={c.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xs)' }}>
                  <h4 style={{ fontSize: 'var(--text-base)', fontWeight: 600 }}>{c.name}</h4>
                  {c.isRequired ? (
                    <span className="badge badge-primary">Required</span>
                  ) : (
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>Optional</span>
                  )}
                </div>

                <div className="flex-col gap-xs" style={{ marginTop: 'var(--space-sm)' }}>
                  {c.options.sort((a,b) => a.sortOrder - b.sortOrder).map(opt => {
                    const isSelected = (selections[c.id] || []).includes(opt.id);
                    return (
                      <label 
                        key={opt.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: 'var(--space-sm)',
                          border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-md)',
                          background: isSelected ? 'rgba(255, 107, 53, 0.05)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                          <input
                            type={c.type === 'RADIO' ? 'radio' : 'checkbox'}
                            name={c.id}
                            checked={isSelected}
                            onChange={() => handleOptionChange(c.id, opt.id, c.type)}
                            style={{ accentColor: 'var(--color-primary)', width: '18px', height: '18px' }}
                          />
                          <span>{opt.label}</span>
                        </div>
                        {opt.priceModifier > 0 && (
                          <span style={{ color: 'var(--color-text-secondary)' }}>
                            +{formatPrice(opt.priceModifier)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Special Instructions */}
        <div className="form-group" style={{ marginBottom: 'var(--space-xl)' }}>
          <label className="form-label" htmlFor="instructions">Special Instructions</label>
          <textarea
            id="instructions"
            className="form-textarea"
            placeholder="E.g., No pickles, extra napkins..."
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            style={{ minHeight: '80px' }}
          />
        </div>

        {/* Footer actions */}
        <div style={{ 
          position: 'sticky', 
          bottom: 0, 
          paddingTop: 'var(--space-lg)',
          marginTop: 'auto',
          background: 'var(--bg-card)',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center'
        }}>
          <div className="qty-control">
            <button 
              className="qty-btn" 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >−</button>
            <div className="qty-value">{quantity}</div>
            <button className="qty-btn" onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>
          
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, padding: '1rem', fontSize: 'var(--text-lg)' }}
            onClick={handleAddToCart}
          >
            Add to order • {formatPrice(calculateTotal())}
          </button>
        </div>
      </div>
    </>
  );
}
