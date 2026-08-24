import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { getProfileBySlug } from "../services/profileService"
import { CardContent, BottomNav } from "../components/preview/PhonePreview"
import "../styles/preview.css"

export default function PublicProfilePage() {
  const { slug } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      setNotFound(false)
      try {
        const data = await getProfileBySlug(slug)
        if (!isMounted) return
        if (data) {
          setProfile(data)
          if (data.business?.businessName) {
            document.title = `${data.business.businessName} | Digital Visiting Card`
          }
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
        if (isMounted) setNotFound(true)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    load()

    return () => {
      isMounted = false
    }
  }, [slug])

  // Loading State
  if (loading) {
    return (
      <div className="public-profile-wrapper loading-wrap">
        <div className="profile-loading-card">
          <div className="profile-loading-spinner" />
          <p className="profile-loading-text">Loading Digital Card...</p>
        </div>
      </div>
    )
  }

  // Not Found / 404 State
  if (notFound || !profile) {
    return (
      <div className="public-profile-wrapper notfound-wrap">
        <div className="notfound-card">
          <div className="notfound-icon">🔍</div>
          <h1 className="notfound-title">Profile Not Found</h1>
          <p className="notfound-desc">
            We couldn't find a digital visiting card for <strong className="notfound-slug">"{slug}"</strong>.
            It might have been moved or hasn't been created yet.
          </p>
          <div className="notfound-actions">
            <Link to="/create" className="btn btn-primary notfound-btn">
              Create Your Digital Card 🚀
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Profile Found - Render Public Mini Website
  const template = profile?.template || "cyan-ocean"

  return (
    <div className={`public-profile-wrapper bg-tpl-${template}`}>
      <div className="public-card-container">
        <CardContent profile={profile} />
        <BottomNav profile={profile} />
      </div>
    </div>
  )
}
