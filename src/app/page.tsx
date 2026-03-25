'use client';

import Link from 'next/link';
import './landing.css';
import { useCartStore } from '@/stores/cartStore';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const cartItemCount = useCartStore((state) => state.getCartCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="landing-wrapper" style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden' }}>
      <div className="wrapper">

<div style={{ padding: "16px 24px 0", position: "sticky", top: "12px", zIndex: 100 }}>
<nav>
  <div className="nav-logo">Hiba<span>Food</span></div>
  <ul className="nav-links">
    <li><a href="#" className="active">Accueil</a></li>
    <li><a href="#">Menu</a></li>
    <li><a href="#">Nos Offres</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
  <div className="nav-icons">
    <button className="nav-icon-btn" title="Mon Compte">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
    </button>
    <button className="nav-icon-btn" title="Favoris">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      <span className="badge">0</span>
    </button>
    <button className="nav-icon-btn" title="Panier">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span className="badge">0</span>
    </button>
    <button className="nav-icon-btn" title="Rechercher">
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </button>
  </div>
</nav>
</div>

<main>
<div className="bento">

  <div className="card-hero glass">
    <div className="hero-bg"></div>
    <div className="hero-content">
      <div className="hero-tag">Livraison Express · Ferrières-en-Gâtinais</div>
      <h1 className="hero-title">
        Une Faim<br />
        <span className="highlight">Irrésistible</span><br />
        Livrée Chez&nbsp;Vous
      </h1>
      <p className="hero-sub">Pizzas, Burgers, Tacos & Sandwiches préparés avec des ingrédients frais. Un clic suffit.</p>
      <div className="hero-actions">
        <a href="#" className="btn-primary">Commander maintenant</a>
        <a href="#" className="btn-ghost">Voir le menu</a>
      </div>
    </div>
  </div>

</div>

<div className="categories-section">
  <div className="section-header-left">
    <div className="card-label">Parcourir</div>
    <h2 className="section-title">Nos <span className="title-highlight">Catégories</span></h2>
  </div>
  <div className="cat-grid">
    <a href="#" className="cat-item">
      <span className="cat-emoji">🍕</span>
      <div className="cat-info">
        <div className="cat-name">Pizza</div>
        <div className="cat-count">33 références</div>
      </div>
    </a>
    <a href="#" className="cat-item">
      <span className="cat-emoji">🍔</span>
      <div className="cat-info">
        <div className="cat-name">Burgers</div>
        <div className="cat-count">7 références</div>
      </div>
    </a>
    <a href="#" className="cat-item">
      <span className="cat-emoji">🌯</span>
      <div className="cat-info">
        <div className="cat-name">Sandwiches</div>
        <div className="cat-count">6 références</div>
      </div>
    </a>
    <a href="#" className="cat-item">
      <span className="cat-emoji">🌮</span>
      <div className="cat-info">
        <div className="cat-name">Tacos</div>
        <div className="cat-count">3 références</div>
      </div>
    </a>
    <a href="#" className="cat-item">
      <span className="cat-emoji">🍟</span>
      <div className="cat-info">
        <div className="cat-name">Croustillants</div>
        <div className="cat-count">5 références</div>
      </div>
    </a>
    <a href="#" className="cat-item">
      <span className="cat-emoji">🥤</span>
      <div className="cat-info">
        <div className="cat-name">Boissons</div>
        <div className="cat-count">17 références</div>
      </div>
    </a>
  </div>
</div>

{/*  ── SPECIAL OFFERS SECTION ──  */}
<div className="offers-section">
  <div className="offers-header">
    <div>
      <div className="card-label">Promotions du Moment</div>
      <h2 className="section-title">Offres <span className="title-highlight">Spéciales</span> <span className="title-emoji">🎉</span></h2>
    </div>
    <a href="#" className="section-link">Tout voir →</a>
  </div>

  <div className="offers-grid">

    {/*  Hero Offer: Offre Spéciale  */}
    <div className="offer-hero">
      <div className="offer-hero-bg"></div>
      <div className="offer-hero-emoji">🍟</div>
      <div className="offer-hero-content">
        <div className="offer-badge">⭐ Offre Spéciale</div>
        <div className="offer-hero-title">Duo Meals —<br />Le Partage en Grand</div>
        <div className="offer-hero-desc">2 burgers + 1 parquet de frites + 1 boisson. La formule gourmande pour deux, livrée en 30 min.</div>
        <div className="offer-price-row">
          <div className="offer-price">19,90 €</div>
          <div className="offer-price-old">24,80 €</div>
          <div className="offer-saving">−20%</div>
        </div>
        <a href="#" className="offer-cta">Commander le Duo →</a>
      </div>
    </div>

    {/*  Small Card: Double Kiff  */}
    <div className="offer-small kiff">
      <div>
        <div className="offer-small-badge">🍕 Double Kiff</div>
        <div className="offer-small-top">
          <div>
            <div className="offer-small-title">Doublez<br />le Plaisir</div>
            <div className="offer-small-desc">1 pizza, 2 fois plus gourmande. Idéale pour les grands appétits qui ne font pas de compromis.</div>
          </div>
          <div className="offer-small-emoji">🍕</div>
        </div>
      </div>
      <div className="offer-small-footer">
        <div className="offer-small-price">14,90 €</div>
        <a href="#" className="offer-arrow">Découvrir →</a>
      </div>
    </div>

    {/*  Small Card: Tex Mex  */}
    <div className="offer-small texmex">
      <div>
        <div className="offer-small-badge">🌮 Tex Mex</div>
        <div className="offer-small-top">
          <div>
            <div className="offer-small-title">Saveurs<br />du Sud-Ouest</div>
            <div className="offer-small-desc">Tacos croustillants, épices tex-mex, sauce pimentée. Un voyage gustatif en quelques bouchées.</div>
          </div>
          <div className="offer-small-emoji">🌮</div>
        </div>
      </div>
      <div className="offer-small-footer">
        <div className="offer-small-price">11,90 €</div>
        <a href="#" className="offer-arrow">Découvrir →</a>
      </div>
    </div>

  </div>
</div>

<div className="bento">

  <div className="section-header">
    <div className="section-header-left">
      <div className="card-label">Les Incontournables</div>
      <h2 className="section-title">Nos <span className="title-highlight">Best-Sellers</span> <span className="title-emoji">🔥</span></h2>
    </div>
    <a href="#" className="section-link">Tout voir →</a>
  </div>

  <div className="card-product glass">
    <div className="product-img">
      <span className="img-emoji">🍔</span>
    </div>
    <div className="product-body">
      <div className="product-name">Cheese Burger</div>
      <div className="product-desc">Buns briochés, steak bœuf, cheddar, sauce burger, salade, tomate, oignon rouge</div>
      <div className="product-footer">
        <div className="product-price">7,90 €</div>
        <button className="btn-add">+</button>
      </div>
    </div>
  </div>

  <div className="card-product glass">
    <div className="product-img">
      <span className="img-emoji">🍗</span>
    </div>
    <div className="product-body">
      <div className="product-name">Chicken Burger</div>
      <div className="product-desc">Buns briochés, filet de poulet, cheddar, sauce chicken, salade, tomate, oignon rouge</div>
      <div className="product-footer">
        <div className="product-price">9,90 €</div>
        <button className="btn-add">+</button>
      </div>
    </div>
  </div>

  <div className="card-product glass">
    <div className="product-img">
      <span className="img-emoji" style={{ fontSize: "60px" }}>🍔🍔</span>
    </div>
    <div className="product-body">
      <div className="product-name">Duo Cheese Royale</div>
      <div className="product-desc">2 Burger Cheese Royale · 1 parquet de frites · 1 boisson</div>
      <div className="product-footer">
        <div className="product-price">13,90 €</div>
        <button className="btn-add">+</button>
      </div>
    </div>
  </div>

  <div className="card-product glass">
    <div className="product-img">
      <span className="img-emoji" style={{ fontSize: "58px" }}>🍗🍔</span>
    </div>
    <div className="product-body">
      <div className="product-name">Duo Chicken Royale</div>
      <div className="product-desc">2 Burger Chicken Royale · 1 parquet de frites · 1 boisson</div>
      <div className="product-footer">
        <div className="product-price">15,90 €</div>
        <button className="btn-add">+</button>
      </div>
    </div>
  </div>

  <div className="section-header">
    <div className="section-header-left">
      <div className="card-label">Pourquoi Nous Choisir</div>
      <h2 className="section-title">Notre <span className="title-highlight">Engagement</span> <span className="title-emoji">🛵</span></h2>
    </div>
  </div>

  <div className="card-delivery glass" style={{ borderRadius: "var(--radius)" }}>
    <div className="delivery-emoji">🛵</div>
    <div className="delivery-title">Livraison Express<br />& Fiable 🚀</div>
    <p className="delivery-sub">Passez votre commande en quelques instants, détendez-vous et laissez-nous livrer des saveurs irrésistibles directement chez vous.</p>
    <div className="delivery-stats">
      <div className="stat">
        <div className="stat-val">~30'</div>
        <div className="stat-label">Délai moyen</div>
      </div>
      <div className="stat">
        <div className="stat-val">7j/7</div>
        <div className="stat-label">Ouvert</div>
      </div>
      <div className="stat">
        <div className="stat-val">100%</div>
        <div className="stat-label">Frais garantis</div>
      </div>
    </div>
  </div>

  <div className="card-feat glass">
    <div className="feat-icon">😊</div>
    <div>
      <div className="feat-title">Équipe Passionnée</div>
      <div className="feat-desc">Un accueil chaleureux pour une expérience inoubliable à chaque commande.</div>
    </div>
  </div>

  <div className="card-feat glass">
    <div className="feat-icon">🍴</div>
    <div>
      <div className="feat-title">Recettes Authentiques</div>
      <div className="feat-desc">Des saveurs uniques concoctées avec des ingrédients frais et locaux.</div>
    </div>
  </div>

  <div className="card-feat glass">
    <div className="feat-icon">🛍</div>
    <div>
      <div className="feat-title">Retrait Rapide</div>
      <div className="feat-desc">Commandez en ligne, retirez sur place en toute simplicité.</div>
    </div>
  </div>

  <div className="card-feat glass">
    <div className="feat-icon">💨</div>
    <div>
      <div className="feat-title">Livraison Express</div>
      <div className="feat-desc">Vos repas favoris livrés en un éclair, chauds et savoureux.</div>
    </div>
  </div>



</div>
</main>

<div className="footer-wrap">

  {/*  Newsletter  */}
  <div className="footer-newsletter">
    <div className="newsletter-inner">
      <div className="newsletter-left">
        <div className="newsletter-eyebrow">Restez Informé</div>
        <div className="newsletter-title">Nos offres,<br />directement chez vous</div>
        <p className="newsletter-sub">Recevez nos promotions exclusives, nouveautés et menus du moment avant tout le monde.</p>
      </div>
      <div className="newsletter-right">
        <div className="newsletter-label">Votre adresse e-mail</div>
        <div className="newsletter-form">
          <input className="newsletter-input" type="email" placeholder="exemple@email.com" />
          <button className="newsletter-btn">S'abonner</button>
        </div>
        <div className="newsletter-legal">En vous inscrivant, vous acceptez notre <a href="#">Politique de confidentialité</a>.</div>
      </div>
    </div>
  </div>

  {/*  Footer grid  */}
  <footer>
    <div className="footer-brand">
      <span className="footer-logo">Hiba<span>Food</span></span>
      <p className="footer-tagline">Pizzas, Burgers, Tacos & Sandwiches livrés chez vous en 30 min. Frais, chauds, irrésistibles.</p>
      <div className="footer-socials">
        <a href="#" className="footer-social-btn" title="Instagram">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></svg>
        </a>
        <a href="#" className="footer-social-btn" title="Facebook">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href="#" className="footer-social-btn" title="TikTok">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/></svg>
        </a>
      </div>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Menu</div>
      <div className="footer-col-links">
        <a href="#">🍕 Pizzas</a>
        <a href="#">🍔 Burgers</a>
        <a href="#">🌯 Sandwiches</a>
        <a href="#">🌮 Tacos</a>
        <a href="#">🍟 Croustillants</a>
        <a href="#">🥤 Boissons</a>
      </div>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Commande</div>
      <div className="footer-col-links">
        <a href="#">Commander en ligne</a>
        <a href="#">Nos Offres Spéciales</a>
        <a href="#">Suivre ma commande</a>
        <a href="#">Livraison Express</a>
      </div>
    </div>

    <div className="footer-col">
      <div className="footer-col-title">Infos</div>
      <div className="footer-col-links">
        <a href="#">À propos</a>
        <a href="#">Contact</a>
        <a href="#">Horaires</a>
        <a href="#">Mentions légales</a>
      </div>
    </div>
  </footer>

  <div className="footer-bottom">
    <div className="footer-copy">© 2026 HibaFood · Ferrières-en-Gâtinais · Tous droits réservés</div>
    <div className="footer-bottom-links">
      <a href="#">Confidentialité</a>
      <a href="#">CGU</a>
      <a href="#">Cookies</a>
    </div>
  </div>

</div>

</div>
    </div>
  );
}
