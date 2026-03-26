'use client';

import Link from 'next/link';
import './landing.css';
import { useCartStore } from '@/stores/cartStore';
import { Product } from '@/types';
import { useState, useEffect, useRef, useCallback } from 'react';

/* ── DATA ── */
const categoriesData = [
  { emoji: '🍕', name: 'Pizza',      count: '33 références', stars: '★ 5.0' },
  { emoji: '🍔', name: 'Burgers',    count: '7 références',  stars: '★ 4.9' },
  { emoji: '🥪', name: 'Sandwichs',  count: '6 références',  stars: '★ 4.8' },
  { emoji: '🌮', name: 'Tacos',      count: '3 références',  stars: '★ 4.7' },
  { emoji: '🍟', name: 'Frites',     count: '5 références',  stars: '★ 4.9' },
  { emoji: '🥤', name: 'Boissons',   count: '17 références', stars: '★ 5.0' },
  { emoji: '🍰', name: 'Desserts',   count: '8 références',  stars: '★ 4.8' },
];

const bestSellers = [
  { id: 'bs1', emoji: '🍔',   name: 'Cheese Burger',       desc: 'Pain brioché, steak bœuf, cheddar, sauce burger.', price: 7.90 },
  { id: 'bs2', emoji: '🍗',   name: 'Chicken Burger',      desc: 'Filet de poulet croustillant, cheddar, sauce chicken.', price: 9.90 },
  { id: 'bs3', emoji: '🍔🍔', name: 'Duo Cheese Royale',   desc: '2 burgers, 1 frites, 1 boisson.', price: 13.90 },
  { id: 'bs4', emoji: '🍗🍔', name: 'Duo Chicken Royale',  desc: '2 Chicken Royale, 1 frites, 1 boisson.', price: 15.90 },
];

const testimonials = [
  { text: '"Franchement, les burgers sont incroyables. Livrés en 25 minutes, encore chauds. Je recommande à 100%!"', avatar: '👩', name: 'Sophie M.', loc: 'Ferrières-en-Gâtinais' },
  { text: '"Le Duo Meals vaut vraiment chaque centime. Les frites sont croustillantes et les burgers sont généreux."', avatar: '👨', name: 'Marc T.', loc: 'Client régulier' },
  { text: '"Application super simple, service top. Les tacos sont une tuerie. Mon adresse de commande préférée!"', avatar: '👩', name: 'Léa B.', loc: 'Commande hebdomadaire' },
];

const marqueeRow1 = [
  { text: '🍕 Pizzas Artisanales', cls: 'highlight', badge: 'new' },
  { text: '🍔 Burgers Signature', cls: '' },
  { text: '🌶️ Le Volcano', cls: 'hot', badge: 'hot' },
  { text: '🥪 Sandwiches Maison', cls: '' },
  { text: '⭐ Noté 4.9/5 par +2 400 Clients', cls: 'highlight' },
  { text: '🍟 Frites Croustillantes', cls: '' },
  { text: '🚀 Livraison Express 30 min', cls: '' },
  { text: '🥤 Boissons Fraîches', cls: '' },
];

const marqueeRow2 = [
  { text: '🌮 Tacos Gourmands', cls: '' },
  { text: '🔥 Menu du Jour', cls: 'hot', badge: 'hot' },
  { text: '7j/7 Ouvert', cls: 'highlight' },
  { text: '🥗 Salades Fraîches', cls: '', badge: 'new' },
  { text: '🫕 Recettes Maison', cls: '' },
  { text: '+2 400 Clients Satisfaits', cls: 'highlight' },
  { text: '🍦 Desserts Gourmands', cls: '' },
  { text: '🛵 Ferrières-en-Gâtinais', cls: '' },
];

export default function LandingPage() {
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.getCartCount());
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCat, setActiveCat] = useState(0);
  const [catOffset, setCatOffset] = useState(0);
  const [addedBtns, setAddedBtns] = useState<Record<string, boolean>>({});

  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Custom Cursor ── */
  useEffect(() => {
    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = mouseX + 'px';
        cursorRef.current.style.top = mouseY + 'px';
      }
    };
    document.addEventListener('mousemove', onMove);
    let rafId: number;
    const animate = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      if (cursorRingRef.current) {
        cursorRingRef.current.style.left = ringX + 'px';
        cursorRingRef.current.style.top = ringY + 'px';
      }
      rafId = requestAnimationFrame(animate);
    };
    animate();
    return () => { document.removeEventListener('mousemove', onMove); cancelAnimationFrame(rafId); };
  }, []);

  /* ── Scroll Reveal ── */
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  /* ── Category slider ── */
  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 640 ? 2 : 4;
  const maxOffset = Math.max(0, categoriesData.length - visibleCount);
  const visibleCats = categoriesData.filter((_, i) => i >= catOffset && i < catOffset + visibleCount);

  /* ── Add to cart ── */
  const handleAddToCart = useCallback((item: typeof bestSellers[0]) => {
    const product: Product = {
      id: item.id, slug: item.name.toLowerCase().replace(/\s+/g, '-'),
      categoryId: 'burger', subcategoryId: null,
      name: item.name, description: item.desc,
      basePrice: item.price, maxPrice: null, imageUrl: null,
      isAvailable: true, isBestSeller: true, note: null,
      variations: [], optionGroups: [], extras: [],
    };
    addItem(product, 1, null, [], [], '');
    setAddedBtns(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedBtns(prev => ({ ...prev, [item.id]: false })), 800);
  }, [addItem]);

  const renderMarqueeItems = (items: typeof marqueeRow1) => (
    <>
      {items.map((item, i) => (
        <span key={i} className={`marquee-item ${item.cls}`}>
          {item.text}
          {item.badge && <span className={`marquee-badge ${item.badge}`}>{item.badge === 'new' ? 'NEW' : 'HOT'}</span>}
          <span className="marquee-dot"></span>
        </span>
      ))}
    </>
  );

  return (
    <div className="landing-wrapper">
      {/* Custom cursor */}
      <div className="cursor" ref={cursorRef}></div>
      <div className="cursor-ring" ref={cursorRingRef}></div>

      {/* ── NAV ── */}
      <nav>
        <Link className="nav-logo" href="/">Hiba<span>Food</span></Link>
        <ul className="nav-links">
          <li><Link href="/">Accueil</Link></li>
          <li><Link href="/store">Menu</Link></li>
          <li><Link href="/store">Nos Offres</Link></li>
          <li><Link href="/store">Contact</Link></li>
        </ul>
        <div className="nav-right">
          <Link className="nav-icon-btn" href="/login" aria-label="Mon compte">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          </Link>
          <Link className="nav-icon-btn" href="/store" aria-label="Favoris">
            <svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/></svg>
          </Link>
          <Link className="nav-icon-btn" href="/cart" aria-label="Panier">
            <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {mounted && cartCount > 0 && <span className="nav-icon-badge">{cartCount}</span>}
          </Link>
          <Link className="nav-icon-btn" href="/store" aria-label="Recherche">
            <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </Link>
          <button className="nav-hamburger" aria-label="Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`mobile-menu${mobileMenuOpen ? ' open' : ''}`}>
        <ul>
          <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>Accueil</Link></li>
          <li><Link href="/store" onClick={() => setMobileMenuOpen(false)}>Menu</Link></li>
          <li><Link href="/store" onClick={() => setMobileMenuOpen(false)}>Nos Offres</Link></li>
          <li><Link href="/store" onClick={() => setMobileMenuOpen(false)}>Contact</Link></li>
        </ul>
        <Link href="/store" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setMobileMenuOpen(false)}>
          Commander →
        </Link>
      </div>

      {/* ── HERO ── */}
      <div className="hero-section">
        <section className="hero">
          <div className="hero-left">
            <div className="hero-badge">🚀 Livraison Express · Ferrières-en-Gâtinais</div>
            <h1 className="hero-title">
              Une Faim<br/>
              <em>Irrésistible</em><br/>
              <span className="line-accent">Livrée Chez Vous</span>
            </h1>
            <p className="hero-sub">Pizzas, Burgers, Tacos & Sandwiches préparés avec des ingrédients frais. Un clic suffit.</p>
            <div className="hero-actions">
              <Link href="/store" className="btn-primary">Commander maintenant <span>→</span></Link>
              <Link href="/store" className="btn-secondary">Voir le menu</Link>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-card big accent">
              <span className="hero-card-emoji">🍔</span>
              <div className="hero-card-desc">Les meilleurs burgers artisanaux de la région</div>
              <div className="hero-rating">
                <span className="stars">★★★★★</span>
                <span className="rating-text">4.9 · +2400 commandes</span>
              </div>
            </div>
            <div className="hero-card">
              <div className="hero-card-num">~30&apos;</div>
              <div className="hero-card-label">Délai moyen de livraison</div>
            </div>
            <div className="hero-card">
              <div className="hero-card-num">7j/7</div>
              <div className="hero-card-label">Ouvert tous les jours</div>
            </div>
          </div>
        </section>
      </div>

      {/* ── MARQUEE STRIP ── */}
      <div className="marquee-strip">
        <div className="marquee-rows">
          <div className="marquee-row marquee-row-1">
            <div className="marquee-track">
              {renderMarqueeItems(marqueeRow1)}
              {renderMarqueeItems(marqueeRow1)}
            </div>
          </div>
          <div className="marquee-row marquee-row-2">
            <div className="marquee-track">
              {renderMarqueeItems(marqueeRow2)}
              {renderMarqueeItems(marqueeRow2)}
            </div>
          </div>
        </div>
      </div>

      {/* ── 01 CATEGORIES ── */}
      <section className="section reveal">
        <div className="categories-header">
          <div>
            <div className="section-num">01 — Notre Menu</div>
            <h2 className="section-title">Explorez Nos <em>Catégories</em></h2>
          </div>
          <Link href="/store" className="see-all-link">Voir tout <span>→</span></Link>
        </div>
        <div className="categories-slider-wrap">
          <div className="categories-scroll">
            {visibleCats.map((cat, i) => (
              <div
                key={cat.name}
                className={`cat-card${activeCat === catOffset + i ? ' active' : ''}`}
                onClick={() => setActiveCat(catOffset + i)}
              >
                <span className="cat-emoji">{cat.emoji}</span>
                <div className="cat-name">{cat.name}</div>
                <div className="cat-count">{cat.count}</div>
                <div className="cat-stars">{cat.stars}</div>
              </div>
            ))}
          </div>
          <div className="cat-slider-arrows">
            <button className="cat-arrow" disabled={catOffset === 0} onClick={() => setCatOffset(o => Math.max(0, o - 1))} aria-label="Précédent">←</button>
            <button className="cat-arrow" disabled={catOffset >= maxOffset} onClick={() => setCatOffset(o => Math.min(maxOffset, o + 1))} aria-label="Suivant">→</button>
          </div>
        </div>
      </section>

      {/* ── 02 SPECIALS ── */}
      <section className="section reveal">
        <div className="section-num">02 — Promotions du Moment</div>
        <h2 className="section-title">Offres <em>Spéciales 🎉</em></h2>
        <div className="specials-grid">
          <div className="special-hero">
            <div className="special-hero-bg">🍔</div>
            <div className="special-tag">⭐ Offre Spéciale</div>
            <div className="special-hero-title">Duo Meals —<br/>Le Partage en Grand</div>
            <p className="special-hero-desc">2 burgers + 1 paquet de frites + 1 boisson. La formule gourmande pour deux, limitée à 30 min.</p>
            <div className="special-price-row">
              <span className="price-main">19,90 €</span>
              <span className="price-old">24,80 €</span>
              <span className="price-badge">−20%</span>
            </div>
            <Link href="/store" className="btn-primary" style={{ width: 'fit-content' }}>Commander le Duo →</Link>
          </div>
          <div className="specials-right">
            <div className="special-item">
              <span className="special-item-emoji">🍕</span>
              <div className="special-item-info">
                <div className="special-item-tag">🔥 Double Kiff</div>
                <div className="special-item-name">Doublez le Plaisir</div>
                <p className="special-item-desc">1 pizza, 2 fois plus gourmande.</p>
              </div>
              <div><div className="special-item-price">14,90 €</div></div>
              <div className="special-item-arrow">→</div>
            </div>
            <div className="special-item">
              <span className="special-item-emoji">🌮</span>
              <div className="special-item-info">
                <div className="special-item-tag">🤠 Tex Mex</div>
                <div className="special-item-name">Saveurs du Sud-Ouest</div>
                <p className="special-item-desc">Tacos incroyables, épices tex-mex.</p>
              </div>
              <div><div className="special-item-price">11,90 €</div></div>
              <div className="special-item-arrow">→</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 03 BEST SELLERS ── */}
      <section className="section reveal">
        <div className="bestsellers-header">
          <div>
            <div className="section-num">03 — Les Incontournables</div>
            <h2 className="section-title">Best-Sellers <em>🔥</em></h2>
          </div>
          <Link href="/store" className="see-all-link">Voir tous →</Link>
        </div>
        <div className="bestsellers-grid">
          {bestSellers.map((item, i) => (
            <div key={item.id} className={`product-card reveal reveal-delay-${i + 1}`}>
              <div className="product-img">
                <span className="product-img-emoji">{item.emoji}</span>
              </div>
              <div className="product-body">
                <div className="product-name">{item.name}</div>
                <p className="product-desc">{item.desc}</p>
                <div className="product-footer">
                  <span className="product-price">{item.price.toFixed(2).replace('.', ',')} €</span>
                  <button
                    className="add-btn"
                    onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                    style={addedBtns[item.id] ? { background: '#4a7c55', transform: 'scale(1.4)' } : {}}
                  >
                    {addedBtns[item.id] ? '✓' : '+'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 04 WHY US ── */}
      <section className="whyus-section reveal">
        <div className="whyus-inner">
          <div className="section-num">04 — Pourquoi Nous Choisir</div>
          <div className="whyus-grid">
            <div className="whyus-left">
              <h2 className="whyus-statement">Nous cuisinons avec <em>passion</em>, nous livrons avec <em>fierté.</em></h2>
              <p className="whyus-text">Chaque commande est préparée à la minute avec des ingrédients locaux et frais. Nous ne comprommettons jamais sur la qualité — parce que vous méritez le meilleur.</p>
              <div className="stats-row">
                <div className="stat-box"><div className="stat-num">~30&apos;</div><div className="stat-label">Délai moyen</div></div>
                <div className="stat-box"><div className="stat-num">7j/7</div><div className="stat-label">Ouvert</div></div>
                <div className="stat-box"><div className="stat-num">100%</div><div className="stat-label">Fraîche Garantie</div></div>
              </div>
            </div>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <div className="feature-name">Livraison Express</div>
                <p className="feature-desc">Vos plats chauds livrés en un éclair, chauds et savoureux.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👨‍🍳</div>
                <div className="feature-name">Équipe Passionnée</div>
                <p className="feature-desc">Des savants artisans concoctent chaque plat avec amour.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">📱</div>
                <div className="feature-name">Retrait Rapide</div>
                <p className="feature-desc">Commandez en ligne, retirez en place totalement simplifié.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌿</div>
                <div className="feature-name">Recettes Authentiques</div>
                <p className="feature-desc">Ingrédients frais et locaux, sélectionnés chaque matin.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 05 TESTIMONIALS ── */}
      <section className="section reveal">
        <div className="section-num">05 — Avis Clients</div>
        <h2 className="section-title">Ils Nous Font <em>Confiance</em></h2>
        <div className="testimonials-wrap">
          {testimonials.map((t, i) => (
            <div key={i} className="testi-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="testi-avatar">{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-loc">{t.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 06 CTA NEWSLETTER ── */}
      <section className="cta-section reveal">
        <div className="cta-inner">
          <div className="cta-tag">📬 Restez Informé</div>
          <h2 className="cta-title">Nos Offres,<br/><em>Directement</em> Chez Vous</h2>
          <p className="cta-sub">Recevez nos promotions exclusives, nouveautés et menus du moment avant tout le monde.</p>
          <div className="newsletter-form">
            <input className="newsletter-input" type="email" placeholder="exemple@email.com" />
            <button className="newsletter-btn">S&apos;abonner</button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--cream-dim)', marginTop: '14px' }}>
            En souscrivant, vous acceptez notre <Link href="/store" style={{ color: 'var(--amber)', textDecoration: 'none' }}>Politique de confidentialité</Link>.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">Hiba<span>Food</span></div>
            <p>Pizzas, Burgers, Tacos & Sandwiches livrés chez vous en 30 min. Frais, chauds, inoubliables.</p>
            <div className="footer-socials">
              <a className="social-btn" href="#">📷</a>
              <a className="social-btn" href="#">📘</a>
              <a className="social-btn" href="#">🐦</a>
            </div>
          </div>
          <div className="footer-col">
            <h4>Menu</h4>
            <ul>
              <li><Link href="/store">🍕 Pizzas</Link></li>
              <li><Link href="/store">🍔 Burgers</Link></li>
              <li><Link href="/store">🥪 Sandwichs</Link></li>
              <li><Link href="/store">🌮 Tacos</Link></li>
              <li><Link href="/store">🍟 Croustillants</Link></li>
              <li><Link href="/store">🥤 Boissons</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Commande</h4>
            <ul>
              <li><Link href="/store">Commander en ligne</Link></li>
              <li><Link href="/store">Nos Offres Spéciales</Link></li>
              <li><Link href="/orders">Suivre ma commande</Link></li>
              <li><Link href="/store">Livraison Express</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Infos</h4>
            <ul>
              <li><Link href="/store">À propos</Link></li>
              <li><Link href="/store">Contact</Link></li>
              <li><Link href="/store">Horaires</Link></li>
              <li><Link href="/store">Mentions légales</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 HibaFood, Ferrières-en-Gâtinais. Tous droits réservés.</p>
          <div className="footer-bottom-links">
            <Link href="/store">Confidentialité</Link>
            <Link href="/store">CGU</Link>
            <Link href="/store">Cookies</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
