import { useProfile } from "../../context/ProfileContext"

const FIELDS = [
  { key: "mobile", label: "Mobile", placeholder: "+91 98765 43210", icon: "📞", type: "tel" },
  { key: "whatsapp", label: "WhatsApp", placeholder: "+91 98765 43210", icon: "💬", type: "tel" },
  { key: "email", label: "Email", placeholder: "hello@business.com", icon: "✉️", type: "email" },
  { key: "website", label: "Website", placeholder: "https://www.yourbusiness.com", icon: "🌐", type: "url" },
]

export default function ContactForm() {
  const { profile, updateField } = useProfile()
  const c = profile.contact

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Contact Details</div>
        <div className="form-section-subtitle">How customers can reach you</div>
      </div>

      {FIELDS.map(({ key, label, placeholder, icon, type }) => (
        <div className="form-field" key={key}>
          <label className="form-label">
            {icon} {label}
          </label>
          <input
            className="form-input"
            type={type}
            placeholder={placeholder}
            value={c[key]}
            onChange={(e) => updateField("contact", key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
