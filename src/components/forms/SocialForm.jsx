import { useProfile } from "../../context/ProfileContext"

const SOCIALS = [
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/yourpage", icon: "🔵", color: "#1877f2" },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/yourhandle", icon: "📸", color: "#e1306c" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/yourprofile", icon: "💼", color: "#0a66c2" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/yourchannel", icon: "▶️", color: "#ff0000" },
  { key: "x", label: "X (Twitter)", placeholder: "https://x.com/yourhandle", icon: "🐦", color: "#000" },
  { key: "telegram", label: "Telegram", placeholder: "https://t.me/yourusername", icon: "✈️", color: "#229ed9" },
]

export default function SocialForm() {
  const { profile, updateField } = useProfile()
  const s = profile.social

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Social Media</div>
        <div className="form-section-subtitle">Connect your social profiles</div>
      </div>

      {SOCIALS.map(({ key, label, placeholder, icon }) => (
        <div className="form-field" key={key}>
          <label className="form-label">
            {icon} {label}
          </label>
          <input
            className="form-input"
            type="url"
            placeholder={placeholder}
            value={s[key]}
            onChange={(e) => updateField("social", key, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
