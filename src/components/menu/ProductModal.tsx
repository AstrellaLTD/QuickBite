'use client';

import { useState, useEffect } from 'react';
import { Product, ProductVariation, SelectedVariation, SelectedOption, SelectedExtra } from '@/types';
import { useCartStore } from '@/stores/cartStore';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
}

function formatPrice(amount: number) {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Variation (e.g. pizza size)
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variations.length > 0 ? product.variations[0] : null
  );

  // Required option groups: groupId → selected choice ids
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    product.optionGroups.forEach((g) => {
      init[g.id] = g.maxSelect === 1 && g.choices.length > 0 ? [g.choices[0].id] : [];
    });
    return init;
  });

  // Optional extras: set of extra ids
  const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOptionToggle = (groupId: string, choiceId: string, maxSelect: number) => {
    setSelectedOptions((prev) => {
      const current = prev[groupId] ?? [];
      if (current.includes(choiceId)) {
        // Deselect (only if maxSelect > 1 — single required must stay selected)
        if (maxSelect === 1) return prev;
        return { ...prev, [groupId]: current.filter((id) => id !== choiceId) };
      } else {
        if (maxSelect === 1) {
          return { ...prev, [groupId]: [choiceId] };
        }
        // Multi-select: enforce max
        if (current.length >= maxSelect) {
          // Drop oldest, add new
          return { ...prev, [groupId]: [...current.slice(1), choiceId] };
        }
        return { ...prev, [groupId]: [...current, choiceId] };
      }
    });
  };

  const handleExtraToggle = (extraId: string) => {
    setSelectedExtras((prev) => {
      const next = new Set(prev);
      if (next.has(extraId)) {
        next.delete(extraId);
      } else {
        next.add(extraId);
      }
      return next;
    });
  };

  // Live price calculation
  const basePrice = selectedVariation ? selectedVariation.price : product.basePrice;

  const optionsTotal = product.optionGroups.reduce((sum, group) => {
    const selected = selectedOptions[group.id] ?? [];
    return sum + group.choices
      .filter((c) => selected.includes(c.id))
      .reduce((s, c) => s + c.priceAdd, 0);
  }, 0);

  const extrasTotal = product.extras
    .filter((e) => selectedExtras.has(e.id))
    .reduce((sum, e) => sum + e.priceAdd, 0);

  const unitPrice = basePrice + optionsTotal + extrasTotal;
  const totalPrice = unitPrice * quantity;

  // Validate required groups
  const isValid = product.optionGroups.every((group) => {
    const selected = selectedOptions[group.id] ?? [];
    return selected.length > 0;
  });

  const handleAddToCart = () => {
    if (!isValid) return;

    const varSelection: SelectedVariation | null = selectedVariation
      ? { variationId: selectedVariation.id, name: selectedVariation.name, price: selectedVariation.price }
      : null;

    const optSelections: SelectedOption[] = [];
    product.optionGroups.forEach((group) => {
      const selectedIds = selectedOptions[group.id] ?? [];
      group.choices.forEach((choice) => {
        if (selectedIds.includes(choice.id)) {
          optSelections.push({
            groupId: group.id,
            groupName: group.name,
            choiceId: choice.id,
            choiceName: choice.name,
            priceAdd: choice.priceAdd,
          });
        }
      });
    });

    const extSelections: SelectedExtra[] = product.extras
      .filter((e) => selectedExtras.has(e.id))
      .map((e) => ({ extraId: e.id, name: e.name, priceAdd: e.priceAdd }));

    addItem(product, quantity, varSelection, optSelections, extSelections, specialInstructions);
    onClose();
  };

  const categoryEmoji: Record<string, string> = {
    pizza: '🍕', burgers: '🍔', sandwiches: '🥖',
    tacos: '🌯', croustillants: '🍟', boissons: '🥤', desserts: '🍰',
  };
  function fallbackEmoji() {
    for (const [k, e] of Object.entries(categoryEmoji)) {
      if (product.slug.startsWith(k) || product.slug.includes(k)) return e;
    }
    return '🍽️';
  }

  return (
    <>
      <div className="pm-backdrop" onClick={onClose} />
      <div className="pm-modal" role="dialog" aria-modal="true" aria-label={product.name}>

        {/* Drag handle (mobile bottom sheet) */}
        <div className="pm-handle" />

        {/* Image */}
        <div className="pm-image">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <div className="pm-image-emoji">{fallbackEmoji()}</div>
          )}
          <button className="pm-close" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        {/* Scrollable body */}
        <div className="pm-body">
          {/* Title */}
          <h2 className="pm-name">
            {product.name}
            {product.isBestSeller && <span className="pm-bestseller">Best Seller</span>}
          </h2>

          {product.description && <p className="pm-desc">{product.description}</p>}
          {product.note && <div className="pm-note">{product.note}</div>}

          {/* Variations as horizontal pills */}
          {product.variations.length > 0 && (
            <>
              <div className="pm-divider" />
              <div className="pm-section">
                <div className="pm-section-header">
                  <span className="pm-section-name">Taille</span>
                  <span className="pm-section-badge required">Obligatoire</span>
                </div>
                <div className="pm-variations">
                  {product.variations.map((v) => {
                    const isSelected = selectedVariation?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        className={`pm-variation-pill ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedVariation(v)}
                      >
                        {v.name} <span className="pm-variation-pill-price">{formatPrice(v.price)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Required option groups */}
          {product.optionGroups.map((group) => {
            const selected = selectedOptions[group.id] ?? [];
            return (
              <div key={group.id}>
                <div className="pm-divider" />
                <div className="pm-section">
                  <div className="pm-section-header">
                    <div>
                      <span className="pm-section-name">{group.name}</span>
                      {group.maxSelect > 1 && (
                        <span className="pm-section-max"> · max {group.maxSelect}</span>
                      )}
                    </div>
                    <span className="pm-section-badge required">Obligatoire</span>
                  </div>
                  {group.choices.map((choice) => {
                    const isSelected = selected.includes(choice.id);
                    return (
                      <div
                        key={choice.id}
                        className={`pm-option-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleOptionToggle(group.id, choice.id, group.maxSelect)}
                      >
                        <div className="pm-option-left">
                          <div className={`pm-option-indicator ${group.maxSelect > 1 ? 'checkbox' : ''}`} />
                          <span className="pm-option-name">{choice.name}</span>
                        </div>
                        {choice.priceAdd > 0 && (
                          <span className="pm-option-price">+{formatPrice(choice.priceAdd)}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Optional extras as compact chips */}
          {product.extras.length > 0 && (
            <>
              <div className="pm-divider" />
              <div className="pm-section">
                <div className="pm-section-header">
                  <span className="pm-section-name">Extras</span>
                  <span className="pm-section-badge optional">Optionnel</span>
                </div>
                <div className="pm-extras-grid">
                  {product.extras.map((extra) => {
                    const isSelected = selectedExtras.has(extra.id);
                    return (
                      <div
                        key={extra.id}
                        className={`pm-extra-chip ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleExtraToggle(extra.id)}
                      >
                        <div className="pm-extra-check" />
                        <div className="pm-extra-info">
                          <div className="pm-extra-name">{extra.name}</div>
                          <div className="pm-extra-price">+{formatPrice(extra.priceAdd)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Special instructions */}
          <div className="pm-divider" />
          <div className="pm-instructions">
            <label htmlFor="pm-instructions-input">Instructions spéciales (optionnel)</label>
            <textarea
              id="pm-instructions-input"
              placeholder="Ex : Sans oignon, bien cuit..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>
        </div>

        {/* Sticky footer */}
        <div className="pm-footer">
          <div className="pm-qty">
            <button
              className="pm-qty-btn"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >−</button>
            <span className="pm-qty-val">{quantity}</span>
            <button
              className="pm-qty-btn"
              onClick={() => setQuantity(quantity + 1)}
            >+</button>
          </div>
          <button
            className="pm-add-btn"
            onClick={handleAddToCart}
            disabled={!isValid}
          >
            Ajouter · {formatPrice(totalPrice)}
          </button>
        </div>
      </div>
    </>
  );
}
