import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useProfile } from "../context/ProfileContext"
import { saveProfile, generateSlug } from "../services/profileService"
import PhonePreview from "../components/preview/PhonePreview"
import DesktopPreview from "../components/preview/DesktopPreview"
import FullPagePreview from "../components/preview/FullPagePreview"
import PreviewSwitcher from "../components/preview/PreviewSwitcher"
import BusinessForm from "../components/forms/BusinessForm"
import ProductsForm from "../components/forms/ProductsForm"
import TemplateForm from "../components/forms/TemplateForm"
import "../styles/create.css"

const STEPS = [
  { id: 0, icon: "🏢", label: "Business Info", desc: "Profile & Contact" },
  { id: 1, icon: "🛍️", label: "Products", desc: "Items & Services" },
  { id: 2, icon: "🎨", label: "Templates", desc: "Design & Style" },
]

const FORM_COMPONENTS = [
  BusinessForm,
  ProductsForm,
  TemplateForm,
]

export default function CreatePage() {
  const { profile, resetProfile } = useProfile()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(new Set())
  const [device, setDevice] = useState("mobile")
  const [isPublishing, setIsPublishing] = useState(false)
  const [publishedSlug, setPublishedSlug] = useState(null)
  const [customSlugInput, setCustomSlugInput] = useState("")
  const [copied, setCopied] = useState(false)

  const stepsNavRef = useRef(null)
  const StepForm = FORM_COMPONENTS[currentStep] || BusinessForm
  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100)

  // Auto-scroll active step node into view on mobile
  useEffect(() => {
    if (stepsNavRef.current) {
      const activeEl = stepsNavRef.current.querySelector(`.step-node-wrapper.active`)
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" })
      }
    }
  }, [currentStep])

  function goTo(step) {
    setCompleted((prev) => {
      const next = new Set(prev)
      for (let i = 0; i <= currentStep; i++) next.add(i)
      return next
    })
    setCurrentStep(step)
  }

  function goNext() {
    if (currentStep < STEPS.length - 1) {
      goTo(currentStep + 1)
    } else {
      handlePublishClick()
    }
  }

  function goPrev() {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  async function handlePublishClick() {
    const rawName = profile?.business?.businessName || profile?.business?.personName || "my-card"
    const slug = generateSlug(customSlugInput || rawName)
    setIsPublishing(true)
    try {
      const res = await saveProfile(slug, profile)
      setPublishedSlug(res.slug)
    } catch (e) {
      console.error("Publish error:", e)
      setPublishedSlug(slug)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleResetAndNew = () => {
    resetProfile()
    setPublishedSlug(null)
    setCurrentStep(0)
    setCompleted(new Set())
    setCustomSlugInput("")
  }

  const publicUrl = publishedSlug ? `${window.location.origin}/${publishedSlug}` : ""

  const handleCopyLink = () => {
    if (!publicUrl) return
    navigator.clipboard.writeText(publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const template = profile?.template || "cyan-ocean"

  return (
    <div className="create-page">
      {/* Creator Top Navbar */}
      <header className="create-header">
        <div className="create-header-left">
          <div className="create-header-logo">
            <span className="logo-sparkle">✨</span>
          </div>
          <div className="create-header-title">
            <h1 className="create-header-name">Digital Visiting Card</h1>
            <span className="create-header-sub">Light & Modern Business Identity</span>
          </div>
        </div>

        <div className="create-header-right">
          <div className="create-header-progress-wrap">
            <div className="create-header-progress-label">Step {currentStep + 1} of {STEPS.length}</div>
            <div className="create-header-progress-bar">
              <div className="create-header-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <button
            type="button"
            className="btn btn-header-publish"
            onClick={handlePublishClick}
            disabled={isPublishing}
          >
            {isPublishing ? "Publishing..." : "⚡ Publish Card"}
          </button>
        </div>
      </header>

      <div className="create-body">
        {/* Left Interactive Form Panel */}
        <div className="form-panel">
          {/* 3 Connected Navigation Steps */}
          <div className="step-progress-container">
            <nav className="step-progress-bar" ref={stepsNavRef} role="tablist" aria-label="Creation Steps">
              {STEPS.map((step, idx) => {
                const isCompleted = completed.has(step.id) || currentStep > idx
                const isCurrent = currentStep === step.id
                const isUpcoming = !isCompleted && !isCurrent

                return (
                  <div
                    key={step.id}
                    className={`step-node-wrapper ${isCurrent ? "active" : ""} ${isCompleted ? "completed" : ""} ${isUpcoming ? "upcoming" : ""}`}
                  >
                    {idx > 0 && (
                      <div className={`step-connector-line ${isCompleted || isCurrent ? "filled" : ""}`} />
                    )}
                    <button
                      type="button"
                      role="tab"
                      aria-selected={isCurrent}
                      className="step-node-btn"
                      onClick={() => goTo(step.id)}
                      title={`Step ${idx + 1}: ${step.label}`}
                    >
                      <div className="step-node-circle">
                        {isCompleted ? (
                          <span className="step-check-icon">✓</span>
                        ) : (
                          <span className="step-node-icon">{step.icon}</span>
                        )}
                      </div>
                      <div className="step-node-text-col">
                        <span className="step-node-label">{step.label}</span>
                        <span className="step-node-desc">{step.desc}</span>
                      </div>
                    </button>
                  </div>
                )
              })}
            </nav>
          </div>

          {/* Form Screen Content */}
          <div className="form-content">
            <StepForm />
          </div>

          {/* Footer Controls */}
          <footer className="form-footer">
            <div className="form-footer-dots">
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  className={`footer-dot ${i === currentStep ? "active" : ""} ${completed.has(i) || currentStep > i ? "done" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Go to screen ${i + 1}`}
                />
              ))}
            </div>
            <div className="form-footer-actions">
              {currentStep > 0 && (
                <button type="button" className="btn btn-secondary" onClick={goPrev}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Back
                </button>
              )}
              {currentStep < STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  Next Screen
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handlePublishClick}
                  disabled={isPublishing}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                  {isPublishing ? "Publishing..." : "Finish & Publish"}
                </button>
              )}
            </div>
          </footer>
        </div>

        {/* Right Live Preview Panel (Clean neutral backdrop) */}
        <div className={`preview-panel preview-${device}`}>
          <div className="preview-header">
            <div className="preview-label-group">
              <span className="preview-live-badge">● LIVE PREVIEW</span>
            </div>
            <PreviewSwitcher device={device} onChange={setDevice} />
          </div>
          <div className="preview-stage">
            {device === "mobile" && <PhonePreview />}
            {device === "desktop" && <DesktopPreview />}
            {device === "fullpage" && <FullPagePreview />}
          </div>
        </div>
      </div>

      {/* Publish Success Modal */}
      {publishedSlug && (
        <div className="publish-modal-backdrop" onClick={handleResetAndNew}>
          <div className="publish-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="publish-modal-header">
              <div className="publish-success-badge">🎉 Card Published & Live!</div>
              <button
                type="button"
                className="publish-modal-close"
                onClick={handleResetAndNew}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <h3 className="publish-modal-title">
              {profile?.business?.businessName || profile?.business?.personName || "Your Digital Card"} is Ready
            </h3>
            <p className="publish-modal-desc">
              Your public card is active online with a permanent URL. Share it anywhere with 1 tap.
            </p>

            <div className="publish-url-box">
              <span className="publish-url-prefix">🔗</span>
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="publish-url-input"
              />
              <button
                type="button"
                className={`publish-copy-btn ${copied ? "copied" : ""}`}
                onClick={handleCopyLink}
              >
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="publish-modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetAndNew}
                title="Clear all fields and create a new digital card"
              >
                🔄 Create New Card (Reset)
              </button>
              <a
                href={`/${publishedSlug}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary publish-visit-btn"
                onClick={handleResetAndNew}
              >
                Open Live Card ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
