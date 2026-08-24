import { useProfile } from "../../context/ProfileContext"
import { CardContent, BottomNav } from "./PhonePreview"

export default function DesktopPreview({ profile: propProfile }) {
  let contextProfile = null
  try {
    const ctx = useProfile()
    contextProfile = ctx?.profile
  } catch (e) {}

  const profile = propProfile || contextProfile || {}
  const template = profile.template || "cyan-ocean"

  return (
    <div className={`browser-mockup bg-tpl-${template}`}>
      <div className="browser-bar">
        <div className="browser-dots">
          <span className="browser-dot red" />
          <span className="browser-dot yellow" />
          <span className="browser-dot green" />
        </div>
        <div className="browser-url">
          <span className="browser-lock">🔒</span>
          <span>yourbusiness.celfon.in</span>
        </div>
        <div className="browser-actions">
          <span className="browser-action">⟳</span>
          <span className="browser-action">⋯</span>
        </div>
      </div>
      <div className="browser-content">
        <div className="browser-card-wrap">
          <CardContent profile={profile} />
          <BottomNav profile={profile} />
        </div>
      </div>
    </div>
  )
}
