'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Category, Product } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import '@/app/store/store.css';

interface StorefrontClientProps {
  categories: Category[];
  products: Product[];
}

function formatPrice(amount: number) {
  return amount.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
}

export default function StorefrontClient({ categories, products }: StorefrontClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favourites, setFavourites] = useState<Set<string>>(new Set());
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [toastMsg, setToastMsg] = useState('');
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const cartStore = useCartStore();
  const cartItems = cartStore.items;

  useEffect(() => {
    // Hide custom cursor on mobile touch
    const mql = window.matchMedia('(hover: none)');
    if (mql.matches) {
      document.body.style.cursor = 'auto';
      return;
    }
    const cursor = document.getElementById('cursor');
    const cursorRing = document.getElementById('cursorRing');
    if (!cursor || !cursorRing) return;

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    };

    let animationFrameId: number;
    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      animationFrameId = requestAnimationFrame(animateRing);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animateRing();

    // Hover effects for cursor
    const interactiveSelectors = 'button, a, .banner-cat, .banner-subcat, .dish-card, .nav-icon-btn, .cart-item-remove, .qty-btn';
    
    const handleMouseEnter = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelectors)) {
        cursor.style.width = '18px'; cursor.style.height = '18px';
        cursorRing.style.width = '48px'; cursorRing.style.height = '48px';
      }
    };
    const handleMouseLeave = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target.closest(interactiveSelectors)) {
        cursor.style.width = '10px'; cursor.style.height = '10px';
        cursorRing.style.width = '32px'; cursorRing.style.height = '32px';
      }
    };

    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 2200);
  };

  const toggleFav = (id: string) => {
    setFavourites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) {
        newFavs.delete(id);
        showToast('Retiré des favoris');
      } else {
        newFavs.add(id);
        showToast('Ajouté aux favoris ❤️');
      }
      return newFavs;
    });
  };

  const handleAddToCart = (product: Product) => {
    cartStore.addItem(product, 1, null, [], [], '');
    showToast(`${product.name} ajouté ! 🎉`);
  };

  // Filter dishes
  const filteredDishes = products.filter(d => {
    const matchCat = activeCategory === 'all' || d.categoryId === activeCategory;
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Determine active category description and subcategories
  const activeCatData = categories.find(c => c.id === activeCategory);
  
  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>
      
      {/* Cart Overlay */}
      <div 
        className={`cart-overlay ${isCartOpen ? 'open' : ''}`} 
        onClick={() => setIsCartOpen(false)}
      ></div>

      <div className="store-wrapper main-layout">
        <div className="content">
          {/* NAV */}
          <nav className="store-nav">
            <Link href="/" className="nav-logo">Hiba<span>Food</span></Link>
            <ul className="nav-links">
              <li><Link href="/" className={pathname === '/' ? 'active' : ''}>Accueil</Link></li>
              <li><Link href="/store" className={pathname === '/store' ? 'active' : ''}>Store</Link></li>
              <li><Link href="/#offres">Nos Offres</Link></li>
              <li><Link href="#footer">Contact</Link></li>
            </ul>
            <div className="nav-right">
              <Link href="/login" className="nav-icon-btn" aria-label="Mon compte">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              </Link>
              <button className="nav-icon-btn" aria-label="Favoris" style={{ color: favourites.size > 0 ? 'var(--red)' : '' }}>
                <svg viewBox="0 0 24 24">
                  <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" style={{ fill: favourites.size > 0 ? 'var(--red)' : 'none' }} />
                </svg>
                {favourites.size > 0 && <span className="nav-icon-badge">{favourites.size}</span>}
              </button>
              <button className="nav-icon-btn" aria-label="Panier" onClick={() => setIsCartOpen(true)}>
                <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                {cartStore.getCartCount() > 0 && <span className="nav-icon-badge">{cartStore.getCartCount()}</span>}
              </button>
              <button className="nav-icon-btn" aria-label="Recherche" onClick={() => document.getElementById('searchInput')?.focus()}>
                <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              <button className="nav-hamburger" aria-label="Menu" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <span></span><span></span><span></span>
              </button>
            </div>
          </nav>

          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <ul>
              <li><Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Accueil</Link></li>
              <li><Link href="/store" onClick={() => setIsMobileMenuOpen(false)}>Store</Link></li>
              <li><Link href="/#offres" onClick={() => setIsMobileMenuOpen(false)}>Nos Offres</Link></li>
              <li><Link href="#footer" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
            </ul>
          </div>

          <div className="scroll-area">
            {/* STORE BANNER */}
            <div className="store-banner">
              <div className="banner-bg"></div>
              <div className="banner-pattern"></div>

              {/* BOTTOM ROW: categories + search */}
              <div className="banner-bottom-row">
                <div className="banner-cats">
                  <div 
                    className={`banner-cat ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                  >
                    <div className="banner-cat-box">🍽️</div>
                    <div className="banner-cat-label">All</div>
                  </div>
                  {categories.map(cat => (
                    <div 
                      key={cat.id}
                      className={`banner-cat ${activeCategory === cat.id ? 'active' : ''}`}
                      onClick={() => setActiveCategory(cat.id)}
                    >
                      <div className="banner-cat-box">{cat.emoji || '🍽️'}</div>
                      <div className="banner-cat-label">{cat.name}</div>
                    </div>
                  ))}
                </div>

                <div className="banner-search-wrap">
                  <span className="banner-search-icon">🔍</span>
                  <input 
                    id="searchInput"
                    className="banner-search-input" 
                    type="text" 
                    placeholder="Search dishes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* SECOND ROW: category description */}
              <div className={`banner-desc-row ${(activeCatData && activeCatData.description) ? 'visible' : ''}`}>
                <div className="banner-subcats" style={{ display: activeCatData?.subcategories?.length ? 'flex' : 'none' }}>
                  {activeCatData?.subcategories?.map((sub, i) => (
                    <div key={sub.id} className={`banner-subcat ${i === 0 ? 'active' : ''}`}>
                      <div className="banner-subcat-box">{sub.name}</div>
                    </div>
                  ))}
                </div>
                
                <div className="desc-divider" style={{ display: activeCatData?.subcategories?.length ? 'block' : 'none' }}></div>
                
                <p className="banner-desc-text">
                  {activeCatData?.description}
                </p>
              </div>
            </div>

            {/* DISHES GRID */}
            <div className="dishes-grid">
              {filteredDishes.length === 0 ? (
                <div style={{ padding: '40px', gridColumn: '1 / -1', textAlign: 'center', color: 'var(--cream-dim)' }}>
                  Aucun produit trouvé.
                </div>
              ) : (
                filteredDishes.map(dish => (
                  <div key={dish.id} className="dish-card">
                    <div className="dish-price-badge">{formatPrice(dish.basePrice)}</div>
                    
                    <div className="dish-quick-actions">
                      <button 
                        className={`dish-quick-btn fav ${favourites.has(dish.id) ? 'active' : ''}`} 
                        title="Favoris"
                        onClick={(e) => { e.stopPropagation(); toggleFav(dish.id); }}
                      >
                        <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>
                      </button>
                    </div>

                    <div className="dish-img-area">
                      {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0', display: 'block' }} />
                      ) : (
                        categories.find(c => c.id === dish.categoryId)?.emoji || '🍽️'
                      )}
                    </div>

                    <div className="dish-body">
                      <div className="dish-name">{dish.name}</div>
                      <div className="dish-meta">{dish.description || ''}</div>
                      
                      <div className="dish-btn-row">
                        <button 
                          className="commander-btn"
                          onClick={(e) => { e.stopPropagation(); showToast('Commande lancée ! 🍽️'); }}
                        >
                          Commander
                        </button>
                        <button 
                          className="panier-btn"
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(dish); }}
                        >
                          Ajouter au panier
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* CART PANEL */}
        <div className={`cart-panel ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-header">
            <div className="cart-title">My Cart</div>
            <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
          </div>

          <div className="cart-items">
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <div className="cart-empty-text">Your cart is empty.<br/>Add some delicious dishes!</div>
              </div>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-img">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      categories.find(c => c.id === item.product.categoryId)?.emoji || '🍽️'
                    )}
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-qty-row">
                      <button className="qty-btn" onClick={() => cartStore.updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                      <div className="qty-val">{item.quantity}</div>
                      <button className="qty-btn" onClick={() => cartStore.updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                  <div className="cart-item-price">{formatPrice(item.itemTotal)}</div>
                  <button className="cart-item-remove" title="Remove" onClick={() => cartStore.removeItem(item.id)}>✕</button>
                </div>
              ))
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="promo-row">
                <input className="promo-input" type="text" placeholder="Promo code..." />
                <button className="promo-btn">Apply</button>
              </div>

              <div className="price-rows">
                <div className="price-row">
                  <span className="price-label">Subtotal</span>
                  <span className="price-val">{formatPrice(cartStore.subtotal)}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Delivery fee</span>
                  <span className="price-val">{formatPrice(1.50)}</span>
                </div>
                <div className="price-row">
                  <span className="price-label">Discount</span>
                  <span className="price-val discount">-{formatPrice(cartStore.subtotal * 0.10)}</span>
                </div>
              </div>

              <div className="price-divider"></div>

              <div className="price-total-row">
                <span className="total-label">Total</span>
                <span className="total-val">{formatPrice(cartStore.subtotal + 1.50 - (cartStore.subtotal * 0.10))}</span>
              </div>

              <div className="cart-btns-row">
                <Link href="/cart" className="view-cart-btn">🛒 View Cart</Link>
                <Link href="/checkout" className="checkout-btn"><span>Checkout</span><span>→</span></Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`toast ${toastMsg ? 'show' : ''}`}>
        <span className="toast-icon">✓</span>
        <span>{toastMsg}</span>
      </div>
    </>
  );
}
