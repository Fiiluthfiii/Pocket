'use client';

import Link from 'next/link';
import { ArrowRight, AtSign, ChevronUp, CircleHelp, Network } from 'lucide-react';
import './landing-animations.css';
import { useEffect } from 'react';

const stats = [
  { value: '50K+', label: 'Pengguna Aktif', tone: 'purple' },
  { value: '4.9/5', label: 'Rating App Store', tone: 'green' },
  { value: 'Rp 2T+', label: 'Total Dana Dikelola', tone: 'pink' },
  { value: '12+', label: 'Negara Terjangkau', tone: 'purple' },
];

const testimonials = [
  {
    quote:
      '"Pocket mengubah cara saya melihat uang. UI-nya sangat elegan dan fiturnya jauh melampaui aplikasi perbankan tradisional."',
    name: 'Siska Pratama',
    role: 'Digital Product Designer',
    accent: 'purple',
    avatar: 'SP',
    avatarTone: 'warm',
  },
  {
    quote:
      '"Fitur analitik premium mereka adalah game-changer. Saya bisa melihat persis di mana saya bisa menghemat lebih banyak setiap bulannya."',
    name: 'Andi Wijaya',
    role: 'CEO, Tech Ventures',
    accent: 'green',
    avatar: 'AW',
    avatarTone: 'cool',
  },
];

const footerColumns = [
  { title: 'Produk', links: ['Features', 'Pricing', 'Security', 'API Docs'] },
];

const landingStyles = `
  .pocket-page, .pocket-page * { box-sizing: border-box; }
  .pocket-page {
    min-height: 100vh;
    overflow-x: hidden;
    background: #fbf7ff;
    color: #05050b;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .pocket-shell { width: min(100% - 40px, 1160px); margin: 0 auto; }
  .pocket-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    height: 72px;
    border-bottom: 1px solid #eee8fa;
    background: rgba(251, 247, 255, 0.92);
    backdrop-filter: blur(18px);
  }
  .pocket-nav {
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .pocket-logo-link { display: flex; align-items: center; text-decoration: none; }
  .pocket-logo-link img {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
  .pocket-logo {
    position: relative;
    width: 44px;
    height: 44px;
    flex: 0 0 auto;
    overflow: hidden;
    border-radius: 10px;
    background: #09214b;
    box-shadow: 0 12px 24px rgba(24, 37, 98, 0.22);
  }
  .pocket-logo.is-small { width: 32px; height: 32px; border-radius: 9px; }
  .footer-logo-img {
    width: 44px;
    height: 44px;
    object-fit: contain;
  }
  .pocket-logo-bars {
    position: absolute;
    left: 8px;
    right: 8px;
    top: 7px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 2px;
  }
  .pocket-logo.is-small .pocket-logo-bars { left: 6px; right: 6px; top: 5px; }
  .pocket-logo-bars span { width: 6px; border-radius: 999px; display: block; }
  .pocket-logo-bars span:nth-child(1) { height: 12px; background: #82d8ff; }
  .pocket-logo-bars span:nth-child(2) { height: 16px; background: #f5f8ff; }
  .pocket-logo-bars span:nth-child(3) { height: 20px; background: #59e0bb; }
  .pocket-logo-bars span:nth-child(4) { height: 25px; background: #6b67ff; }
  .pocket-logo.is-small .pocket-logo-bars span { width: 5px; }
  .pocket-logo.is-small .pocket-logo-bars span:nth-child(1) { height: 9px; }
  .pocket-logo.is-small .pocket-logo-bars span:nth-child(2) { height: 12px; }
  .pocket-logo.is-small .pocket-logo-bars span:nth-child(3) { height: 15px; }
  .pocket-logo.is-small .pocket-logo-bars span:nth-child(4) { height: 19px; }
  .pocket-logo-ring {
    position: absolute;
    left: 50%;
    bottom: 6px;
    width: 15px;
    height: 15px;
    transform: translateX(-50%);
    border-radius: 999px;
    background: #142f65;
    border: 2px solid #8da6ff;
  }
  .pocket-logo-ring::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: 6px;
    height: 6px;
    transform: translate(-50%, -50%);
    border-radius: 999px;
    background: white;
  }
  .pocket-menu { display: flex; align-items: center; gap: 36px; }
  .pocket-menu a {
    color: #5d5e6d;
    font-size: 15px;
    font-weight: 800;
    text-decoration: none;
    line-height: 1;
  }
  .pocket-menu a.active { color: #5f56ee; border-bottom: 2px solid #675df2; padding-bottom: 9px; }
  .pocket-actions { display: flex; align-items: center; gap: 18px; }
  .pocket-login { color: #5f56ee; font-size: 15px; font-weight: 900; text-decoration: none; }
  .pocket-signup {
    display: inline-flex;
    min-width: 112px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 20px;
    background: #665ff0;
    color: white;
    font-size: 15px;
    font-weight: 900;
    text-decoration: none;
    box-shadow: 0 8px 18px rgba(90, 79, 229, 0.38);
  }
  .pocket-hero {
    min-height: 600px;
    display: grid;
    grid-template-columns: 0.97fr 1.03fr;
    align-items: center;
    gap: 48px;
    padding-top: 120px;
    padding-bottom: 80px;
  }
  .pocket-badge {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 38px;
    padding: 8px 15px;
    border: 1px solid #e7e0ff;
    border-radius: 999px;
    background: #f4efff;
    color: #6a62f5;
    font-size: 14px;
    font-weight: 900;
  }
  .pocket-badge span { width: 8px; height: 8px; border-radius: 999px; background: #655bf1; }
  .pocket-title {
    max-width: 590px;
    margin: 0;
    color: #000;
    font-size: clamp(48px, 5.5vw, 68px);
    font-weight: 950;
    line-height: 0.98;
    letter-spacing: 0;
  }
  .pocket-copy {
    max-width: 492px;
    margin: 30px 0 0;
    color: #626475;
    font-size: 18px;
    font-weight: 650;
    line-height: 1.6;
  }
  .pocket-hero-actions { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 38px; }
  .pocket-primary, .pocket-secondary {
    display: inline-flex;
    height: 64px;
    align-items: center;
    justify-content: center;
    border-radius: 32px;
    padding: 0 30px;
    font-size: 16px;
    font-weight: 900;
    text-decoration: none;
  }
  .pocket-primary { min-width: 232px; background: #665ff0; color: white; box-shadow: 0 14px 28px rgba(91, 81, 232, 0.22); }
  .pocket-primary svg { margin-left: 9px; }
  .pocket-secondary { min-width: 180px; border: 1px solid #e9e2fb; background: #f7f2ff; color: #5f56ee; }
  .pocket-visual { position: relative; width: 100%; max-width: 540px; height: 520px; margin-left: auto; }
  .visual-board {
    position: absolute;
    right: 54px;
    top: 98px;
    width: 420px;
    height: 320px;
    border-radius: 30px;
    background: rgba(255,255,255,0.78);
    box-shadow: 0 34px 70px rgba(108, 98, 205, 0.08);
  }
  .visual-board .mini-logo { position: absolute; left: 32px; top: 32px; }
  .visual-line { position: absolute; left: 32px; top: 92px; width: 112px; height: 14px; border-radius: 999px; background: #eee8ff; }
  .visual-pill { position: absolute; left: 32px; top: 132px; width: 224px; height: 36px; border-radius: 13px; background: #e8e7fb; }
  .visual-block-left { position: absolute; left: 32px; top: 192px; width: 160px; height: 168px; border-radius: 26px; background: #f1ecff; }
  .visual-block-right { position: absolute; left: 205px; top: 200px; width: 160px; height: 64px; border-radius: 26px; background: #f2edff; }
  .visual-chart { position: absolute; left: 32px; bottom: 0; width: 326px; height: 104px; overflow: hidden; border-radius: 30px 30px 13px 0; background: #eeeaff; }
  .visual-chart::after { content: ''; position: absolute; left: 0; bottom: 0; width: 100%; height: 40px; background: #c6c1f5; }
  .balance-card {
    position: absolute;
    left: 0;
    bottom: 80px;
    width: 170px;
    padding: 23px 22px;
    border-radius: 22px;
    background: white;
    box-shadow: 0 8px 18px rgba(30, 38, 73, 0.18);
  }
  .balance-label, .income-label { margin: 0; color: #77798c; font-size: 13px; font-weight: 900; }
  .balance-value { margin: 10px 0 0; color: #5f64df; font-size: 24px; font-weight: 950; line-height: 1.16; }
  .avatar-row { display: flex; align-items: center; margin-top: 18px; }
  .avatar-dot { width: 24px; height: 24px; margin-right: -6px; border: 2px solid white; border-radius: 999px; }
  .avatar-dot.one { background: #b7b8ff; }
  .avatar-dot.two { background: #f7b8b8; }
  .avatar-dot.three { background: #6cebbf; }
  .avatar-more { display: flex; align-items: center; justify-content: center; background: #f0efff; color: #666280; font-size: 9px; font-weight: 950; }
  .income-card {
    position: absolute;
    right: 0;
    top: 54px;
    width: 190px;
    padding: 20px;
    border-radius: 24px;
    background: white;
    box-shadow: 0 8px 12px rgba(38, 45, 58, 0.2);
  }
  .income-top { display: flex; align-items: center; gap: 12px; }
  .income-icon { display: flex; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 999px; background: #d9fff1; color: #007f66; }
  .income-value { margin: 4px 0 0; color: #07836b; font-size: 25px; font-weight: 950; line-height: 1; }
  .income-track { width: 100%; height: 8px; margin-top: 16px; overflow: hidden; border-radius: 999px; background: #eee9ff; }
  .income-progress { width: 74%; height: 100%; border-radius: 999px; background: #007f66; }
  .visual-dot { position: absolute; right: 64px; top: 176px; width: 32px; height: 32px; border-radius: 999px; background: #eadfff; }
  .visual-glow { position: absolute; right: 48px; bottom: 12px; width: 160px; height: 160px; border-radius: 999px; background: #eee7ff; filter: blur(35px); }
  .pocket-proof { background: #f0effa; padding: 78px 0; }
  .proof-grid { display: grid; grid-template-columns: 0.92fr 1fr; gap: 64px; }
  .stats-grid { align-self: end; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; }
  .stat-card {
    min-height: 105px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 34px;
    background: white;
    padding: 24px 31px;
    box-shadow: 0 18px 34px rgba(98, 93, 145, 0.04);
  }
  .stat-value { margin: 0; font-size: 18px; font-weight: 800; }
  .stat-value.purple { color: #7067f4; }
  .stat-value.green { color: #139b75; }
  .stat-value.pink { color: #e24b7c; }
  .stat-label { margin: 9px 0 0; color: #656779; font-size: 14px; font-weight: 850; }
  .proof-title { margin: 0 0 42px; color: #000; font-size: 34px; font-weight: 950; line-height: 1.16; }
  .testimonial-list { display: grid; gap: 28px; }
  .testimonial {
    position: relative;
    overflow: hidden;
    border-radius: 24px;
    background: white;
    padding: 30px 32px 28px 36px;
    box-shadow: 0 18px 34px rgba(98, 93, 145, 0.04);
  }
  .testimonial::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 4px; border-radius: 999px; }
  .testimonial.purple::before { background: #6257f2; }
  .testimonial.green::before { background: #007f66; }
  .testimonial-quote { margin: 0; color: #4f5060; font-size: 16px; font-style: italic; font-weight: 700; line-height: 1.5; }
  .testimonial-person { display: flex; align-items: center; gap: 14px; margin-top: 20px; }
  .testimonial-avatar { display: flex; width: 40px; height: 40px; align-items: center; justify-content: center; border-radius: 999px; color: white; font-size: 10px; font-weight: 950; }
  .testimonial-avatar.warm { background: linear-gradient(135deg, #f7d8be, #8a5a44); }
  .testimonial-avatar.cool { background: linear-gradient(135deg, #d5edff, #5a6f92); }
  .testimonial-name { margin: 0; color: #15151f; font-size: 15px; font-weight: 950; line-height: 1; }
  .testimonial-role { margin: 6px 0 0; color: #77798c; font-size: 12px; font-weight: 750; }
  .pocket-cta-section { background: #fbf7ff; padding: 72px 0; }
  .pocket-cta {
    border-radius: 42px;
    background: #6659ee;
    padding: 86px 40px;
    text-align: center;
    box-shadow: 0 18px 32px rgba(75, 57, 196, 0.18);
  }
  .pocket-cta h2 { max-width: 710px; margin: 0 auto; color: white; font-size: 39px; font-weight: 950; line-height: 1.18; }
  .pocket-cta p { max-width: 690px; margin: 28px auto 0; color: #dad6ff; font-size: 18px; font-weight: 700; line-height: 1.55; }
  .cta-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 24px; margin-top: 42px; }
  .cta-primary, .cta-secondary {
    display: inline-flex;
    height: 62px;
    align-items: center;
    justify-content: center;
    border-radius: 32px;
    padding: 0 34px;
    font-size: 16px;
    font-weight: 950;
    text-decoration: none;
  }
  .cta-primary { min-width: 260px; background: white; color: #5f56ee; box-shadow: 0 12px 24px rgba(32, 20, 128, 0.13); }
  .cta-secondary { min-width: 210px; border: 1px solid rgba(255,255,255,0.2); color: white; }
  .cta-note { margin-top: 30px !important; color: #c9c4ff !important; font-size: 12px !important; font-weight: 850 !important; }
  .pocket-footer { border-top: 1px solid #e8e1f5; border-radius: 26px 26px 0 0; background: #f4efff; }
  .footer-content { padding-top: 74px; padding-bottom: 46px; }
  .footer-grid { display: grid; grid-template-columns: 1.15fr 1fr 1fr 1fr; gap: 48px; }
  .footer-copy { max-width: 250px; margin: 28px 0 0; color: #686a7a; font-size: 16px; font-weight: 650; line-height: 1.55; }
  .socials { display: flex; align-items: center; gap: 18px; margin-top: 30px; }
  .socials a { display: flex; width: 32px; height: 32px; align-items: center; justify-content: center; border-radius: 999px; background: #ebe5ff; color: #6258f0; text-decoration: none; }
  .footer-col h3 { margin: 0; color: #5f56ee; font-size: 14px; font-weight: 950; }
  .footer-links { display: grid; gap: 18px; margin-top: 24px; }
  .footer-links a { color: #676878; font-size: 16px; font-weight: 650; text-decoration: underline; text-underline-offset: 2px; }
  .copyright { margin-top: 72px; border-top: 1px solid #e9e3f6; padding-top: 36px; text-align: center; color: #77798c; font-size: 14px; font-weight: 900; }
  @media (max-width: 900px) {
    .pocket-shell { width: min(100% - 32px, 720px); }
    .pocket-menu { display: none; }
    .pocket-logo-link img { width: 38px; height: 38px; }
    .pocket-signup { min-width: 96px; padding: 0 20px; height: 42px; }
    .pocket-hero { 
      grid-template-columns: 1fr; 
      padding-top: 100px; 
      padding-bottom: 64px;
      gap: 48px;
    }
    .pocket-title { 
      font-size: clamp(36px, 7vw, 52px); 
      line-height: 1.1;
      max-width: 100%;
    }
    .pocket-copy { 
      font-size: 17px; 
      margin-top: 24px;
      max-width: 100%;
    }
    .pocket-hero-actions { 
      margin-top: 32px;
      flex-direction: column;
      width: 100%;
    }
    .pocket-primary, .pocket-secondary { 
      width: 100%; 
      min-width: 0;
      justify-content: center;
    }
    .pocket-visual { 
      margin: 0 auto; 
      height: 400px; 
      transform: scale(0.85); 
      transform-origin: top center; 
    }
    .proof-grid { 
      grid-template-columns: 1fr; 
      gap: 48px;
    }
    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    .proof-title { 
      font-size: 28px; 
      margin-bottom: 32px;
    }
    .footer-grid { 
      grid-template-columns: 1fr; 
      gap: 40px;
    }
    .footer-copy { max-width: 100%; }
  }
  @media (max-width: 560px) {
    .pocket-shell { width: min(100% - 24px, 480px); }
    .pocket-header, .pocket-nav { height: 60px; }
    .pocket-logo-link img { width: 32px; height: 32px; }
    .pocket-actions { gap: 12px; }
    .pocket-login { font-size: 13px; font-weight: 800; }
    .pocket-signup { 
      height: 38px; 
      min-width: 80px; 
      border-radius: 14px; 
      font-size: 13px;
      padding: 0 16px;
    }
    .pocket-hero { 
      padding-top: 80px; 
      padding-bottom: 48px;
      gap: 32px;
    }
    .pocket-badge { 
      margin-bottom: 24px; 
      font-size: 12px; 
      padding: 6px 12px;
    }
    .pocket-title { 
      font-size: clamp(32px, 9vw, 42px);
      line-height: 1.1;
    }
    .pocket-copy { 
      font-size: 15px;
      line-height: 1.5;
      margin-top: 20px;
    }
    .pocket-hero-actions {
      margin-top: 28px;
    }
    .pocket-primary, .pocket-secondary { 
      width: 100%; 
      min-width: 0;
      height: 56px;
    }
    .pocket-visual { 
      height: 340px; 
      transform: scale(0.68); 
      width: 100%;
      max-width: 540px;
    }
    .balance-card {
      width: 160px;
      padding: 20px;
    }
    .balance-value { font-size: 22px; }
    .income-card {
      width: 170px;
      padding: 18px;
    }
    .income-value { font-size: 22px; }
    .stats-grid { 
      grid-template-columns: 1fr; 
      gap: 16px; 
    }
    .stat-card {
      min-height: 90px;
      padding: 20px 24px;
    }
    .pocket-proof { padding: 48px 0; }
    .proof-title { 
      font-size: 24px;
      margin-bottom: 28px;
    }
    .testimonial { padding: 24px 28px; }
    .testimonial-quote { font-size: 15px; }
    .pocket-cta-section { padding: 48px 0; }
    .pocket-cta { 
      border-radius: 28px; 
      padding: 48px 24px; 
    }
    .pocket-cta h2 { 
      font-size: 26px;
      line-height: 1.25;
    }
    .pocket-cta p { 
      font-size: 15px;
      margin-top: 20px;
    }
    .cta-actions {
      margin-top: 32px;
      flex-direction: column;
      width: 100%;
    }
    .cta-primary, .cta-secondary { 
      width: 100%; 
      min-width: 0;
      height: 56px;
    }
    .cta-note { 
      margin-top: 24px !important;
      font-size: 11px !important;
    }
    .footer-content { 
      padding-top: 56px; 
      padding-bottom: 36px; 
    }
    .footer-grid { gap: 32px; }
    .footer-copy { 
      margin-top: 20px;
      font-size: 15px;
    }
    .socials { margin-top: 24px; }
    .copyright { 
      margin-top: 56px; 
      padding-top: 28px;
      font-size: 13px;
    }
  }
`;

function PocketLogo({ small = false }) {
  return (
    <div className={`pocket-logo${small ? ' is-small' : ''}`} aria-label="Pocket logo">
      <div className="pocket-logo-bars">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="pocket-logo-ring" />
    </div>
  );
}

function HeroIllustration() {
  return (
    <div className="pocket-visual" aria-hidden="true">
      <div className="visual-glow" />
      <div className="visual-board">
        <div className="mini-logo">
          <PocketLogo small />
        </div>
        <div className="visual-line" />
        <div className="visual-pill" />
        <div className="visual-block-left" />
        <div className="visual-block-right" />
        <div className="visual-chart" />
      </div>

      <div className="balance-card">
        <p className="balance-label">Total Balance</p>
        <p className="balance-value">
          Rp
          <br />
          450.250.000
        </p>
        <div className="avatar-row">
          <span className="avatar-dot one" />
          <span className="avatar-dot two" />
          <span className="avatar-dot three" />
          <span className="avatar-dot avatar-more">+5</span>
        </div>
      </div>

      <div className="income-card">
        <div className="income-top">
          <div className="income-icon">
            <ChevronUp size={21} strokeWidth={3} />
          </div>
          <div>
            <p className="income-label">Income</p>
            <p className="income-value">Rp 12.5M</p>
          </div>
        </div>
        <div className="income-track">
          <div className="income-progress" />
        </div>
      </div>

      <div className="visual-dot" />
    </div>
  );
}

function StatCard({ value, label, tone }) {
  return (
    <div className="stat-card">
      <p className={`stat-value ${tone}`}>{value}</p>
      <p className="stat-label">{label}</p>
    </div>
  );
}

function TestimonialCard({ quote, name, role, accent, avatar, avatarTone }) {
  return (
    <article className={`testimonial ${accent}`}>
      <p className="testimonial-quote">{quote}</p>
      <div className="testimonial-person">
        <div className={`testimonial-avatar ${avatarTone}`}>{avatar}</div>
        <div>
          <p className="testimonial-name">{name}</p>
          <p className="testimonial-role">{role}</p>
        </div>
      </div>
    </article>
  );
}

export default function LandingPage() {
  useEffect(() => {
    // Scroll effect for header
    const handleScroll = () => {
      const header = document.querySelector('.pocket-header');
      if (header) {
        if (window.scrollY > 50) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />
      <main className="pocket-page">
        <header className="pocket-header">
          <nav className="pocket-shell pocket-nav">
            <Link href="/" className="pocket-logo-link" aria-label="Pocket home">
              <img 
                src="/logo.png" 
                alt="Pocket Logo" 
                className="pocket-logo-img"
              />
            </Link>

            <div className="pocket-menu">
              <a href="#features" className="active">Features</a>
              <a href="#about">About</a>
              <a href="#pricing">Pricing</a>
            </div>

            <div className="pocket-actions">
              <Link href="/login" className="pocket-login">Login</Link>
              <Link href="/register" className="pocket-signup">Sign Up</Link>
            </div>
          </nav>
        </header>

        <section id="features" className="pocket-shell pocket-hero">
          <div>
            <h1 className="pocket-title">Kelola Keuanganmu, Sesederhana Menyimpannya di Saku</h1>
            <p className="pocket-copy">
              Platform finansial tercanggih untuk melacak pengeluaran, mengatur tabungan, dan mengoptimalkan aset dalam satu genggaman premium.
            </p>
            <div className="pocket-hero-actions">
              <Link href="/register" className="pocket-primary">
                Mulai Gratis
                <ArrowRight size={20} />
              </Link>
              <Link href="#about" className="pocket-secondary">Pelajari Lebih Lanjut</Link>
            </div>
          </div>

          <HeroIllustration />
        </section>

        <section id="about" className="pocket-proof">
          <div className="pocket-shell proof-grid">
            <div className="stats-grid">
              {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
            </div>
            <div>
              <h2 className="proof-title">Apa Kata Mereka Tentang Pocket?</h2>
              <div className="testimonial-list">
                {testimonials.map((testimonial) => <TestimonialCard key={testimonial.name} {...testimonial} />)}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="pocket-cta-section">
          <div className="pocket-shell pocket-cta">
            <h2>Siap Mengambil Kendali Penuh Atas Keuangan Anda?</h2>
            <p>Bergabunglah dengan ribuan pengguna lain yang telah meningkatkan kualitas hidup finansial mereka bersama Pocket.</p>
            <div className="cta-actions">
              <Link href="/register" className="cta-primary">Mulai Sekarang Gratis</Link>
              <Link href="/login" className="cta-secondary">Hubungi Sales</Link>
            </div>
            <p className="cta-note">Tidak perlu kartu kredit. Batalkan kapan saja.</p>
          </div>
        </section>

        <footer className="pocket-footer">
          <div className="pocket-shell footer-content">
            <div className="footer-grid">
              <div>
                <Link href="/" className="pocket-logo-link">
                  <img 
                    src="/logo.png" 
                    alt="Pocket Logo" 
                    className="footer-logo-img"
                  />
                </Link>
                <p className="footer-copy">
                  Platform keuangan premium yang membantu Anda mengelola, menabung, dan menginvestasikan masa depan Anda.
                </p>
                <div className="socials">
                  <a href="#" aria-label="Twitter">
                    <Network size={16} />
                  </a>
                  <a href="#" aria-label="Email">
                    <AtSign size={16} />
                  </a>
                  <a href="#" aria-label="Help">
                    <CircleHelp size={16} />
                  </a>
                </div>
              </div>

              {footerColumns.map((column) => (
                <div className="footer-col" key={column.title}>
                  <h3>{column.title}</h3>
                  <div className="footer-links">
                    {column.links.map((item) => (
                      <a key={item} href="#">{item}</a>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="copyright">&copy; 2026 Pocket Finance. All rights reserved.</div>
          </div>
        </footer>
      </main>
    </>
  );
}
