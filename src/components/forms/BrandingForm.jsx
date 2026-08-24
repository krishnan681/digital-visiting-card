import { useProfile } from "../../context/ProfileContext"

const FONTS = ["Inter", "Poppins", "Roboto", "Montserrat", "Playfair Display", "Space Grotesk", "DM Sans"]
const RADIUS_OPTIONS = [
  { label: "None", value: "0" },
  { label: "Small", value: "6" },
  { label: "Medium", value: "12" },
  { label: "Large", value: "20" },
  { label: "Full", value: "999" },
]

function ColorField({ label, value, onChange }) {
  return (
    <div className="form-field">
      <label className="form-label">{label}</label>
      <div className="color-field">
        <div className="color-swatch" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        </div>
        <span className="color-value">{value}</span>
        <input
          className="form-input"
          style={{ border: "none", padding: "0 8px", flex: 1, height: "auto", boxShadow: "none" }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
      </div>
    </div>
  )
}

export default function BrandingForm() {
  const { profile, updateField } = useProfile()
  const b = profile.branding

  function update(field, value) {
    updateField("branding", field, value)
  }

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Branding</div>
        <div className="form-section-subtitle">Customize colors, fonts, and style</div>
      </div>

      <ColorField
        label="Primary Color"
        value={b.primaryColor}
        onChange={(v) => update("primaryColor", v)}
      />
      <ColorField
        label="Secondary Color"
        value={b.secondaryColor}
        onChange={(v) => update("secondaryColor", v)}
      />
      <ColorField
        label="Background Color"
        value={b.background}
        onChange={(v) => update("background", v)}
      />

      <div className="form-field">
        <label className="form-label">Font Family</label>
        <select
          className="form-select"
          value={b.font}
          onChange={(e) => update("font", e.target.value)}
        >
          {FONTS.map((f) => (
            <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label">Border Radius</label>
        <div style={{ display: "flex", gap: 8 }}>
          {RADIUS_OPTIONS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => update("borderRadius", value)}
              className="btn"
              style={{
                flex: 1,
                height: 36,
                fontSize: 11,
                background: b.borderRadius === value ? "var(--primary)" : "var(--muted)",
                color: b.borderRadius === value ? "var(--primary-foreground)" : "var(--muted-foreground)",
                border: "1px solid var(--border)",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        padding: 16,
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        background: b.background,
        display: "flex",
        alignItems: "center",
        gap: 12,
        fontFamily: b.font + ", sans-serif",
      }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: `${b.borderRadius}px`,
          background: b.primaryColor,
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>Preview Text</div>
          <div style={{ fontSize: 11, color: b.primaryColor, fontWeight: 600 }}>Accent Color</div>
        </div>
      </div>
    </div>
  )
}
