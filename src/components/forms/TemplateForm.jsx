import { useProfile } from "../../context/ProfileContext"

const TEMPLATES = [
  {
    id: "cyan-ocean",
    name: "Ocean Breeze & Cyan",
    tagline: "Modern · Tech · Dynamic",
    description: "Vibrant ocean cyan-to-azure wave with clean white identity, blue pill icons, and high contrast typography.",
    accent: "#0284c7",
    badge: "Popular",
    bg: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
    preview: {
      headerBg: "linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)",
      bodyBg: "#ffffff",
      accentColor: "#0284c7",
    },
  },
  {
    id: "gold-luxury",
    name: "Royal Obsidian & Gold",
    tagline: "Prestige · VIP · Luxury",
    description: "Deep obsidian charcoal header with 24K gold foil trim, amber badges, and luxury executive styling.",
    accent: "#d97706",
    badge: "VIP Luxury",
    bg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    preview: {
      headerBg: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
      bodyBg: "#fafafa",
      accentColor: "#d97706",
    },
  },
  {
    id: "emerald-mesh",
    name: "Mint Emerald & Fresh",
    tagline: "Organic · Sustainable · Clean",
    description: "Refreshing botanical emerald mesh with mint badge highlights, eco icons, and modern slate typography.",
    accent: "#059669",
    badge: "Eco Modern",
    bg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    preview: {
      headerBg: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      bodyBg: "#fcfdfd",
      accentColor: "#059669",
    },
  },
  {
    id: "pink-angled",
    name: "Rose Gold & Magenta",
    tagline: "Bold · Sharp · Vibrant",
    description: "Geometric angled banner with vivid magenta & rose gold tones, dynamic cuts, and stylish action pills.",
    accent: "#db2777",
    badge: "Trending",
    bg: "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)",
    preview: {
      headerBg: "linear-gradient(135deg, #db2777 0%, #f43f5e 100%)",
      bodyBg: "#ffffff",
      accentColor: "#db2777",
    },
  },
  {
    id: "purple-indigo",
    name: "Neo Violet & Indigo",
    tagline: "Creative · Digital · Neo",
    description: "Futuristic purple-indigo mesh banner with luminous accents, modern glass feel, and tech badging.",
    accent: "#6366f1",
    badge: "Creative",
    bg: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)",
    preview: {
      headerBg: "linear-gradient(135deg, #4f46e5 0%, #8b5cf6 100%)",
      bodyBg: "#ffffff",
      accentColor: "#6366f1",
    },
  },
  {
    id: "sunset-amber",
    name: "Sunset Coral & Amber",
    tagline: "Warm · Energetic · Sunset",
    description: "Radiant coral-orange to golden amber sunset gradient with warm copper buttons and friendly aesthetics.",
    accent: "#ea580c",
    badge: "Warm",
    bg: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
    preview: {
      headerBg: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
      bodyBg: "#ffffff",
      accentColor: "#ea580c",
    },
  },
]

function TemplateMockup({ tpl }) {
  return (
    <div
      className={`template-mockup-frame bg-tpl-${tpl.id}`}
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "absolute",
        inset: 0,
      }}
    >
      {/* Header bar with pattern & gradient */}
      <div
        className={`tpl-${tpl.id}`}
        style={{
          height: 48,
          display: "flex",
          alignItems: "flex-end",
          padding: "6px 12px",
          gap: 8,
          flexShrink: 0,
          position: "relative",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <div className="card-hero-banner" style={{ position: "absolute", inset: 0, height: "100%", padding: 0 }} />
        <div style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          background: "#ffffff",
          border: "2px solid #ffffff",
          boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
          flexShrink: 0,
          zIndex: 2,
        }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, paddingBottom: 2, zIndex: 2 }}>
          <div style={{ width: "65%", height: 5, borderRadius: 2, background: "#ffffff" }} />
          <div style={{ width: "40%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.8)" }} />
        </div>
      </div>

      {/* Quick actions row */}
      <div style={{ display: "flex", gap: 6, padding: "8px 10px", justifyContent: "center" }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            width: 22, height: 22, borderRadius: 6,
            background: `${tpl.accent}15`,
            border: `1px solid ${tpl.accent}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }} />
        ))}
      </div>

      {/* Content lines */}
      <div style={{ padding: "0 12px", display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ height: 5, width: "85%", borderRadius: 2, background: "rgba(15,23,42,0.12)" }} />
        <div style={{ height: 5, width: "55%", borderRadius: 2, background: "rgba(15,23,42,0.08)" }} />
        <div style={{ height: 16, width: "100%", borderRadius: 6, background: `${tpl.accent}12`, border: `1px dashed ${tpl.accent}40`, marginTop: 4 }} />
      </div>

      {/* Bottom nav mockup */}
      <div style={{
        marginTop: "auto",
        height: 22,
        background: "rgba(255,255,255,0.95)",
        borderTop: `1px solid #e2e8f0`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 10px",
        flexShrink: 0,
      }}>
        {[0, 1, 2, 3, 4].map((_, i) => (
          <div key={i} style={{
            width: 14, height: 4, borderRadius: 2,
            background: i === 0 ? tpl.accent : "rgba(15,23,42,0.15)",
          }} />
        ))}
      </div>
    </div>
  )
}

export default function TemplateForm() {
  const { profile, setTemplate } = useProfile()
  const selected = profile.template || "cyan-ocean"

  return (
    <div className="form-row">
      <div className="form-section-header">
        <div>
          <div className="form-section-title">Choose Card Template</div>
          <div className="form-section-subtitle">Select a unique design and visual theme for your digital card</div>
        </div>
        <span className="promo-badge-tag">Step 3</span>
      </div>

      <div className="template-grid">
        {TEMPLATES.map((t) => (
          <div
            key={t.id}
            className={`template-card ${selected === t.id ? "selected" : ""}`}
            onClick={() => setTemplate(t.id)}
            role="radio"
            aria-checked={selected === t.id}
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && setTemplate(t.id)}
          >
            <div className="template-preview" style={{ position: "relative", overflow: "hidden" }}>
              <TemplateMockup tpl={t} />
              {selected === t.id && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(79,70,229,0.12)",
                  zIndex: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#fff", fontSize: 16, fontWeight: 800,
                    boxShadow: "0 4px 12px rgba(79,70,229,0.4)",
                  }}>✓</div>
                </div>
              )}
              <div style={{
                position: "absolute",
                top: 8, right: 8,
                zIndex: 4,
              }}>
                <span className="template-badge-pill" style={{ background: t.accent }}>
                  {t.badge}
                </span>
              </div>
            </div>

            <div className="template-info">
              <div>
                <div className="template-name">{t.name}</div>
                <div className="template-tagline" style={{ color: t.accent }}>{t.tagline}</div>
              </div>
              <div className="template-check">
                {selected === t.id ? "✓" : ""}
              </div>
            </div>
            <div className="template-description">{t.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
