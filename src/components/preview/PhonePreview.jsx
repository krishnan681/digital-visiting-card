import { useState } from "react"
import { useProfile } from "../../context/ProfileContext"
import "../../styles/preview.css"

const QUICK_ACTIONS = [
  { icon: "📞", label: "Call", action: "tel:" },
  { icon: "💬", label: "WhatsApp", action: "https://wa.me/" },
  { icon: "✉️", label: "Email", action: "mailto:" },
  { icon: "📍", label: "Location", action: "maps:" },
]

export function BottomNav({ profile: propProfile }) {
  const [activeTab, setActiveTab] = useState("home")

  let contextProfile = null
  try {
    const ctx = useProfile()
    contextProfile = ctx?.profile
  } catch (e) {
    // Outside context
  }
  const profile = propProfile || contextProfile || {}
  const contact = profile.contact || {}

  const scrollTo = (id, tabName) => {
    setActiveTab(tabName)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <nav className="card-bottom-nav">
      <button
        type="button"
        className={`nav-tab-btn ${activeTab === "home" ? "active" : ""}`}
        onClick={() => scrollTo("card-home", "home")}
      >
        <span className="nav-tab-icon">🏠</span>
        <span className="nav-tab-label">Home</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${activeTab === "products" ? "active" : ""}`}
        onClick={() => scrollTo("card-products", "products")}
      >
        <span className="nav-tab-icon">🛍️</span>
        <span className="nav-tab-label">Products</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${activeTab === "celfon" ? "active" : ""}`}
        onClick={() => scrollTo("card-celfon", "celfon")}
      >
        <span className="nav-tab-icon">🌟</span>
        <span className="nav-tab-label">Celfon</span>
      </button>

      <button
        type="button"
        className={`nav-tab-btn ${activeTab === "ev" ? "active" : ""}`}
        onClick={() => scrollTo("card-ev-scooter", "ev")}
      >
        <span className="nav-tab-icon">🛵</span>
        <span className="nav-tab-label">EV Win</span>
      </button>

      <a
        href={contact.mobile ? `tel:${contact.mobile.replace(/\s+/g, '')}` : (contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}` : "#")}
        className="nav-tab-btn nav-tab-contact"
      >
        <span className="nav-tab-icon">📞</span>
        <span className="nav-tab-label">Contact</span>
      </a>
    </nav>
  )
}

export function CardContent({ profile: propProfile, scale = 1 }) {
  let contextProfile = null
  try {
    const ctx = useProfile()
    contextProfile = ctx?.profile
  } catch (e) {
    // Rendered outside provider
  }

  const profile = propProfile || contextProfile || {}
  const business = profile.business || {}
  const contact = profile.contact || {}
  const address = profile.address || {}
  const products = profile.products || []

  const initials = (business.businessName || business.personName || "DC")
    .slice(0, 2)
    .toUpperCase()

  const handleSaveContact = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${business.personName || business.businessName}\nORG:${business.businessName || ""}\nTITLE:${business.designation || ""}\nTEL;TYPE=CELL:${contact.mobile || ""}\nEMAIL:${contact.email || ""}\nADR;TYPE=WORK:;;${address.address || ""};${address.city || ""};${address.state || ""};${address.pincode || ""};India\nEND:VCARD`
    const blob = new Blob([vcard], { type: "text/vcard" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.download = `${business.personName || business.businessName || "contact"}.vcf`
    a.href = url
    a.click()
  }

  const handleShareCard = () => {
    if (navigator.share) {
      navigator.share({
        title: business.businessName || "Digital Visiting Card",
        text: `Check out the Digital Visiting Card for ${business.businessName || "my business"}`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("Visiting card link copied to clipboard!")
    }
  }

  const getHref = (action) => {
    if (action === "tel:") return contact.mobile ? `tel:${contact.mobile.replace(/\s+/g, '')}` : "#"
    if (action === "https://wa.me/") return contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}` : "#"
    if (action === "mailto:") return contact.email ? `mailto:${contact.email}` : "#"
    if (action === "maps:") return address.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(`${address.address || ''} ${address.city || ''} ${address.pincode || ''}`)}`
    return "#"
  }

  const template = profile.template || "cyan-ocean"

  return (
    <div className={`card-screen light-theme-card tpl-${template}`} data-scale={scale}>
      {/* 1. Header Banner & Business Identity */}
      <div className="card-hero-container" id="card-home">
        <div
          className="card-hero-banner"
          style={
            business.banner
              ? {
                  backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.6) 100%), url("${business.banner}")`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : undefined
          }
        >
          <div className="card-live-indicator">
            <span className="live-dot" /> Live Card
          </div>
        </div>

        <div className="card-header-profile">
          <div className="card-logo-avatar">
            {business.logo ? (
              <img src={business.logo} alt={business.businessName || "logo"} />
            ) : (
              <span className="logo-initials-text">{initials}</span>
            )}
          </div>

          <div className="card-profile-text">
            <h2 className="card-biz-title">
              {business.businessPrefix && business.businessPrefix !== "None" ? `${business.businessPrefix} ` : ""}
              {business.businessName || "Your Business Name"}
              {business.verified && <span className="profile-verified-badge" style={{ marginLeft: 6 }}>✓</span>}
            </h2>
            {business.personName && (
              <p className="card-owner-name">
                👤 {business.personPrefix ? `${business.personPrefix} ` : ""}{business.personName}
              </p>
            )}
            {business.designation && (
              <p className="card-designation">{business.designation}</p>
            )}
            {(business.category || business.activity) && (
              <div style={{ marginTop: 4 }}>
                <span className="profile-cat-pill">{business.category || business.activity}</span>
              </div>
            )}
          </div>
        </div>

        {/* Address Badge */}
        {(address.address || address.city) && (
          <div className="card-address-row">
            <span className="card-addr-icon">📍</span>
            <span className="card-addr-text">
              {[address.address, address.city, address.state, address.pincode].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* Quick Contact Action Icons */}
        <div className="card-quick-actions-row">
          {QUICK_ACTIONS.map((action, idx) => (
            <a
              key={idx}
              href={getHref(action.action)}
              target={action.action === "tel:" || action.action === "mailto:" ? "_self" : "_blank"}
              rel="noreferrer"
              className="card-quick-btn"
              title={action.label}
            >
              <span className="quick-btn-icon">{action.icon}</span>
              <span className="quick-btn-label">{action.label}</span>
            </a>
          ))}
        </div>

        {/* Action Buttons: Save VCF & Share */}
        <div className="card-primary-actions">
          <button type="button" className="btn-card-save" onClick={handleSaveContact}>
            <span>💾 Save Contact</span>
          </button>
          <button type="button" className="btn-card-share" onClick={handleShareCard}>
            <span>📤 Share</span>
          </button>
        </div>
      </div>

      {/* 2. Products Section */}
      <section className="card-section" id="card-products">
        <div className="card-section-head">
          <span className="card-section-badge">🛍️ Products & Services</span>
          <h3 className="card-section-title">Our Featured Offerings</h3>
        </div>

        {products.length > 0 ? (
          <div className="card-products-list">
            {products.map((item, i) => (
              <div className="card-product-box" key={i}>
                {item.image && (
                  <div className="card-prod-img-wrap">
                    <img src={item.image} alt={item.name} />
                  </div>
                )}
                <div className="card-prod-body">
                  <div className="card-prod-title-row">
                    <h4 className="card-prod-name">{item.name}</h4>
                    {item.price && <span className="card-prod-price">₹{item.price}</span>}
                  </div>
                  {item.description && (
                    <p className="card-prod-desc">{item.description}</p>
                  )}
                  <a
                    href={contact.whatsapp ? `https://wa.me/${contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I am interested in ${item.name}`)}` : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="card-prod-enquire-btn"
                  >
                    💬 Enquire on WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-products-placeholder">
            <p>Products added in Step 2 will appear here.</p>
          </div>
        )}
      </section>

      {/* 3. Powered by CELFON Card (Default promotional card) */}
      <section className="card-section card-celfon-promo-section" id="card-celfon">
        <div className="card-celfon-box">
          <div className="celfon-box-header">
            <div className="celfon-badge">
              <span className="celfon-dot" />
              <span>Verified Partner</span>
            </div>
            <span className="celfon-sponsor-tag">CELFON</span>
          </div>

          <div className="celfon-box-title-row">
            <span className="celfon-icon">📱</span>
            <div>
              <h4 className="celfon-main-headline">Powered by CELFON BOOK</h4>
              <p className="celfon-sub-headline">
                Smart Digital Business Directory & Networking Platform
              </p>
            </div>
          </div>

          <div className="celfon-perks-list">
            <div className="celfon-perk">
              <span className="perk-icon">✓</span>
              <span>Direct customer reach without middleman</span>
            </div>
            <div className="celfon-perk">
              <span className="perk-icon">✓</span>
              <span>Interactive digital business directory</span>
            </div>
            <div className="celfon-perk">
              <span className="perk-icon">✓</span>
              <span>1-Click tap to call & WhatsApp connect</span>
            </div>
          </div>

          <a
            href="https://celfon.in"
            target="_blank"
            rel="noreferrer"
            className="btn-celfon-visit"
          >
            <span>Explore CELFON Directory ↗</span>
          </a>
        </div>
      </section>

      {/* 4. EV Scooter Referral Contest Card (Default promotional card) */}
      <section className="card-section card-ev-promo-section" id="card-ev-scooter">
        <div className="card-ev-banner">
          <div className="ev-badge-pill-card">🛵 Grand Referral Contest</div>
          <h3 className="ev-card-title">Refer & Win an EV Scooter! 🛵</h3>
          <p className="ev-card-subtitle">Refer Mobile Users & Win Big Rewards 🎉</p>

          <div className="ev-card-highlight">
            <p>
              Invite Friends & Businesses to join <strong>CELFON BOOK</strong><br />
              Every <strong>3 Successful Referrals</strong> earns you <strong>1 Lucky Draw Coupon</strong><br />
              Win a <strong>Brand New EV Scooter!</strong><br />
              <span className="ev-sparkle-text">✨ More Coupons = Higher Chance to Win!</span>
            </p>
          </div>
        </div>

        {/* Grand Prize Box */}
        <div className="ev-card-prize-box">
          <div className="ev-prize-scooter-icon">🛵</div>
          <div className="ev-prize-details">
            <span className="prize-badge-label">Grand Prize</span>
            <h4 className="prize-title-text">Win Brand New EV Scooter</h4>
            <p className="prize-desc-text">
              Invite your friends to register using your referral and increase your chances of winning.
            </p>
          </div>
        </div>

        {/* 3 Step Process */}
        <div className="ev-card-steps-row">
          <div className="ev-card-step">
            <div className="step-circle">1</div>
            <div className="step-txt">Refer 3 Friends</div>
          </div>
          <div className="ev-card-step">
            <div className="step-circle">2</div>
            <div className="step-txt">Earn 1 Coupon</div>
          </div>
          <div className="ev-card-step">
            <div className="step-circle">3</div>
            <div className="step-txt">Lucky Draw Entry</div>
          </div>
        </div>

        <a
          href="https://celfon.in"
          target="_blank"
          rel="noreferrer"
          className="btn-ev-card-refer"
          style={{ textDecoration: "none", display: "block", textAlign: "center" }}
        >
          Refer Now ⚡
        </a>
      </section>

      {/* Card Footer */}
      <footer className="card-preview-footer">
        <p className="card-footer-branding">Digital Visiting Card • Powered by CELFON</p>
      </footer>
    </div>
  )
}

export default function PhonePreview({ profile: propProfile }) {
  let contextProfile = null
  try {
    const ctx = useProfile()
    contextProfile = ctx?.profile
  } catch (e) {}

  const profile = propProfile || contextProfile || {}
  const template = profile?.template || "cyan-ocean"

  return (
    <div className="phone-mockup-wrapper">
      <div className="phone-device-frame">
        <div className="phone-speaker-notch" />
        <div className="phone-scroll-screen">
          <CardContent profile={profile} />
        </div>
        <BottomNav profile={profile} />
        <div className="phone-home-indicator" />
      </div>
    </div>
  )
}
