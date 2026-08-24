import { useState, useEffect } from "react"
import { useProfile } from "../../context/ProfileContext"
import { compressImage } from "../../lib/imageCompressor"
import { searchProfiles } from "../../services/profileService"

const PERSON_PREFIXES = ["Mr.", "Ms.", "Mrs.", "Dr.", "Prof.", "Er.", "Shri", "Smt."]
const BUSINESS_PREFIXES = ["M/s.", "Messrs.", ""]
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]

export default function BusinessForm() {
  const { profile, updateField, loadProfile } = useProfile()
  const b = profile.business || {}
  const c = profile.contact || {}
  const a = profile.address || {}

  // Fetch from Profiles Modal State
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  function updateBusiness(field, value) {
    updateField("business", field, value)
  }

  function updateContact(field, value) {
    updateField("contact", field, value)
  }

  function updateAddress(field, value) {
    updateField("address", field, value)
  }

  function updateRoot(field, value) {
    updateField(field, value)
  }

  async function handleImageUpload(field, e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, {
        maxWidth: field === "banner" ? 1200 : 500,
        maxHeight: field === "banner" ? 500 : 500,
        quality: 0.8,
      })
      updateBusiness(field, compressed)
    } catch (err) {
      console.error("Compression error:", err)
      const reader = new FileReader()
      reader.onload = (ev) => updateBusiness(field, ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  // Live profile search from Supabase profiles table
  useEffect(() => {
    if (!isSearchOpen) return
    let active = true
    setIsSearching(true)
    const timer = setTimeout(async () => {
      try {
        const list = await searchProfiles(searchQuery)
        if (active) setSearchResults(list)
      } catch (err) {
        console.error("Profile search failed:", err)
      } finally {
        if (active) setIsSearching(false)
      }
    }, 250)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [searchQuery, isSearchOpen])

  const handleSelectProfile = (selected) => {
    loadProfile(selected)
    setIsSearchOpen(false)
    const name = selected.business?.businessName || selected.business?.personName || selected.contact?.mobile || "Profile"
    setToastMessage(`✓ Autofilled data for "${name}" from Supabase profiles!`)
    setTimeout(() => setToastMessage(""), 4000)
  }

  return (
    <div className="form-row">
      {/* Screen 1 Header with "Fetch from Profiles" action */}
      <div className="form-section-header-row">
        <div>
          <div className="form-section-title">Business & Contact Info</div>
          <div className="form-section-subtitle">Fill in your identity details or fetch directly from Supabase profiles</div>
        </div>
        <button
          type="button"
          className="btn btn-fetch-profiles"
          onClick={() => {
            setIsSearchOpen(true)
            setSearchQuery("")
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Fetch from Profiles
        </button>
      </div>

      {toastMessage && (
        <div className="form-autofill-toast">
          {toastMessage}
        </div>
      )}

      {/* Profile Search & Fetch Modal */}
      {isSearchOpen && (
        <div className="profile-search-backdrop" onClick={() => setIsSearchOpen(false)}>
          <div className="profile-search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-search-header">
              <div className="profile-search-title-wrap">
                <span className="profile-search-icon">📱</span>
                <div>
                  <h3 className="profile-search-title">Fetch Profile by Mobile Number</h3>
                  <p className="profile-search-sub">Search public.profiles table using mobile number to autofill details</p>
                </div>
              </div>
              <button
                type="button"
                className="profile-search-close"
                onClick={() => setIsSearchOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="profile-search-input-box">
              <span className="search-input-icon">📞</span>
              <input
                type="tel"
                autoFocus
                className="profile-search-input"
                placeholder="Enter Mobile Number (e.g. 9688755530)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setSearchQuery("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="profile-search-list-container">
              {isSearching ? (
                <div className="profile-search-loading">
                  <div className="search-spinner" />
                  <span>Searching mobile numbers in Supabase database...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="profile-search-empty">
                  <div className="empty-icon">📱</div>
                  <p className="empty-title">No profile found for this mobile number</p>
                  <p className="empty-sub">Check the mobile number or enter your details manually in the form</p>
                </div>
              ) : (
                <div className="profile-results-list">
                  {searchResults.map((item, idx) => {
                    const bizName = item.business?.businessName || item.business?.personName || "Unnamed Business"
                    const ownerName = item.business?.personName
                    const phone = item.contact?.mobile || "No mobile"
                    const logo = item.business?.logo
                    const city = item.address?.city
                    const category = item.business?.category

                    return (
                      <div className="profile-result-card" key={item.id || item.slug || idx}>
                        <div className="profile-result-avatar">
                          {logo ? (
                            <img src={logo} alt={bizName} />
                          ) : (
                            <span>{bizName.slice(0, 2).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="profile-result-info">
                          <div className="profile-result-title-line">
                            <h4 className="profile-result-name">{bizName}</h4>
                            {item.business?.verified && (
                              <span className="profile-verified-badge" title="Verified Member">✓ Verified</span>
                            )}
                          </div>
                          <div className="profile-result-meta">
                            {ownerName && <span>👤 {ownerName}</span>}
                            {ownerName && phone && <span>•</span>}
                            <span>📞 {phone}</span>
                            {category && <span>•</span>}
                            {category && <span className="profile-cat-pill">{category}</span>}
                          </div>
                          {city && (
                            <div className="profile-result-location">📍 {city}</div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-select-profile"
                          onClick={() => handleSelectProfile(item)}
                        >
                          Autofill
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* User Type Selector */}
      <div className="form-field">
        <label className="form-label">Profile Type</label>
        <div className="user-type-toggle">
          <button
            type="button"
            className={`type-toggle-btn ${profile.userType === "business" ? "active" : ""}`}
            onClick={() => updateRoot("userType", "business")}
          >
            🏢 Business Profile
          </button>
          <button
            type="button"
            className={`type-toggle-btn ${profile.userType === "person" ? "active" : ""}`}
            onClick={() => updateRoot("userType", "person")}
          >
            👤 Personal Profile
          </button>
        </div>
      </div>

      {/* Logo / Profile Image Field */}
      <div className="form-field">
        <label className="form-label">Profile Image / Logo (profile_image)</label>
        {b.logo ? (
          <div className="image-preview-card">
            <div className="image-preview-thumb-wrap">
              <img src={b.logo} alt="logo" className="uploaded-image-thumb logo-thumb" />
            </div>
            <div className="image-preview-details">
              <span className="image-preview-title">Profile Image / Logo</span>
              <span className="image-preview-subtitle">Visible on card header & directory listings</span>
              <div className="image-preview-actions">
                <label className="btn-action-change">
                  Change
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload("logo", e)} hidden />
                </label>
                <button type="button" className="btn-action-remove" onClick={() => updateBusiness("logo", "")}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-area">
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("logo", e)} />
            <div className="upload-area-icon">🏢</div>
            <div className="upload-area-text">Upload Logo / Profile Image</div>
            <div className="upload-area-sub">PNG, JPG, SVG or WebP</div>
          </div>
        )}
      </div>

      {/* Cover / Banner Image Field */}
      <div className="form-field">
        <label className="form-label">Cover / Banner Image (cover_image) <span>(optional)</span></label>
        {b.banner ? (
          <div className="image-preview-card">
            <div className="image-preview-thumb-wrap banner-wrap">
              <img src={b.banner} alt="banner" className="uploaded-image-thumb banner-thumb" />
            </div>
            <div className="image-preview-details">
              <span className="image-preview-title">Header Cover Image</span>
              <span className="image-preview-subtitle">Displayed at top of visiting card</span>
              <div className="image-preview-actions">
                <label className="btn-action-change">
                  Change
                  <input type="file" accept="image/*" onChange={(e) => handleImageUpload("banner", e)} hidden />
                </label>
                <button type="button" className="btn-action-remove" onClick={() => updateBusiness("banner", "")}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="upload-area">
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload("banner", e)} />
            <div className="upload-area-icon">🖼️</div>
            <div className="upload-area-text">Upload Cover / Banner Image</div>
            <div className="upload-area-sub">Recommended: 1200×400px</div>
          </div>
        )}
      </div>

      {/* Business Name & Prefix */}
      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Business Name (business_name)</label>
          <div className="input-with-prefix">
            <select
              className="prefix-select"
              value={b.businessPrefix || "M/s."}
              onChange={(e) => updateBusiness("businessPrefix", e.target.value)}
            >
              {BUSINESS_PREFIXES.map((bp) => (
                <option key={bp} value={bp}>{bp || "None"}</option>
              ))}
            </select>
            <input
              className="form-input prefixed-input"
              placeholder="e.g. JV Machine Tools And Robotics"
              value={b.businessName || ""}
              onChange={(e) => updateBusiness("businessName", e.target.value)}
            />
          </div>
        </div>

        {/* Person Name & Prefix */}
        <div className="form-field">
          <label className="form-label">Person / Owner Name (person_name)</label>
          <div className="input-with-prefix">
            <select
              className="prefix-select"
              value={b.personPrefix || "Mr."}
              onChange={(e) => updateBusiness("personPrefix", e.target.value)}
            >
              {PERSON_PREFIXES.map((pp) => (
                <option key={pp} value={pp}>{pp}</option>
              ))}
            </select>
            <input
              className="form-input prefixed-input"
              placeholder="e.g. Jaivishnu Selvaraj"
              value={b.personName || ""}
              onChange={(e) => updateBusiness("personName", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Category / Activity & Keywords */}
      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Activity / Category (activity)</label>
          <input
            className="form-input"
            placeholder="e.g. Industry, Manufacturing, Retail..."
            value={b.category || b.activity || ""}
            onChange={(e) => {
              updateBusiness("category", e.target.value)
              updateBusiness("activity", e.target.value)
            }}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Keywords (keywords)</label>
          <input
            className="form-input"
            placeholder="e.g. Industrial Machinery, CNC Machine..."
            value={b.keywords || ""}
            onChange={(e) => updateBusiness("keywords", e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div className="form-field">
        <label className="form-label">Description (description)</label>
        <textarea
          className="form-textarea"
          placeholder="Describe your business and offerings..."
          value={b.description || ""}
          onChange={(e) => updateBusiness("description", e.target.value)}
          rows={3}
        />
      </div>

      {/* Phone (Mobile), WhatsApp Number, Email */}
      <div className="form-row-3">
        <div className="form-field">
          <label className="form-label">Mobile Number (mobile_number)</label>
          <input
            className="form-input"
            type="tel"
            placeholder="9688755530"
            value={c.mobile || ""}
            onChange={(e) => updateContact("mobile", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">WhatsApp (whats_app)</label>
          <input
            className="form-input"
            type="tel"
            placeholder="9688755530"
            value={c.whatsapp || ""}
            onChange={(e) => updateContact("whatsapp", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Email (email)</label>
          <input
            className="form-input"
            type="email"
            placeholder="info@business.com"
            value={c.email || ""}
            onChange={(e) => updateContact("email", e.target.value)}
          />
        </div>
      </div>

      {/* Website & Landline */}
      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Website (web_site)</label>
          <input
            className="form-input"
            placeholder="www.jvmachbots.com"
            value={c.website || ""}
            onChange={(e) => updateContact("website", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Landline (landline)</label>
          <input
            className="form-input"
            placeholder="0422-268888"
            value={c.landline || ""}
            onChange={(e) => updateContact("landline", e.target.value)}
          />
        </div>
      </div>

      {/* Business Address & Personal Address */}
      <div className="form-field">
        <label className="form-label">Business Address (bussiness_address / address)</label>
        <textarea
          className="form-textarea"
          placeholder="Shop / Office / Factory Address..."
          value={a.address || a.businessAddress || ""}
          onChange={(e) => {
            updateAddress("address", e.target.value)
            updateAddress("businessAddress", e.target.value)
          }}
          rows={2}
        />
      </div>

      {/* City, State, Pincode */}
      <div className="form-row-3">
        <div className="form-field">
          <label className="form-label">City (city)</label>
          <input
            className="form-input"
            placeholder="Coimbatore"
            value={a.city || ""}
            onChange={(e) => updateAddress("city", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">State</label>
          <input
            className="form-input"
            placeholder="Tamil Nadu"
            value={a.state || ""}
            onChange={(e) => updateAddress("state", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Pincode (pincode)</label>
          <input
            className="form-input"
            placeholder="641402"
            value={a.pincode || ""}
            onChange={(e) => updateAddress("pincode", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
