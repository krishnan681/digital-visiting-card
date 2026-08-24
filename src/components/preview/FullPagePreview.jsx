import { useProfile } from "../../context/ProfileContext"
import { CardContent, BottomNav } from "./PhonePreview"
import "../../styles/preview.css"

export default function FullPagePreview({ profile: propProfile }) {
  let contextProfile = null
  try {
    const ctx = useProfile()
    contextProfile = ctx?.profile
  } catch (e) {}

  const profile = propProfile || contextProfile || {}
  const template = profile.template || "cyan-ocean"

  return (
    <div className={`fullpage-preview bg-tpl-${template}`}>
      <div className="fullpage-card-container">
        <CardContent profile={profile} />
        <BottomNav profile={profile} />
      </div>
    </div>
  )
}
