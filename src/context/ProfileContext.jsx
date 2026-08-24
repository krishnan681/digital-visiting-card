import { createContext, useContext, useState, useEffect } from "react"

export const defaultProfile = {
  userType: "business",
  business: {
    logo: "",
    banner: "",
    businessPrefix: "M/s.",
    businessName: "",
    personPrefix: "Mr.",
    personName: "",
    designation: "",
    category: "",
    keywords: "",
    description: "",
    memberNum: "",
    bloodGroup: "",
  },
  contact: {
    mobile: "",
    whatsapp: "",
    email: "",
    website: "",
    landline: "",
    landlineCode: "",
    landlineNumber: "",
  },
  address: {
    address: "",
    personalAddress: "",
    businessAddress: "",
    city: "Coimbatore",
    state: "Tamil Nadu",
    country: "India",
    pincode: "",
    googleMapsUrl: "",
  },
  products: [],
  template: "cyan-ocean",
}

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("dvc_profile")
      return saved ? JSON.parse(saved) : defaultProfile
    } catch (e) {
      console.warn("Failed to read draft from localStorage:", e)
      return defaultProfile
    }
  })

  // Safe persist effect
  useEffect(() => {
    try {
      localStorage.setItem("dvc_profile", JSON.stringify(profile))
    } catch (e) {
      console.warn("localStorage quota reached or unavailable:", e.message)
    }
  }, [profile])

  function updateSection(section, data) {
    setProfile((prev) => ({
      ...prev,
      [section]: typeof data === "function" ? data(prev[section] || {}) : { ...prev[section], ...data },
    }))
  }

  function updateField(section, field, value) {
    if (value === undefined && typeof field !== "object") {
      // Root property update e.g. updateField("userType", "person")
      setProfile((prev) => ({
        ...prev,
        [section]: field,
      }))
      return
    }
    setProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  function setUserType(userType) {
    setProfile((prev) => ({ ...prev, userType }))
  }

  function setProducts(products) {
    setProfile((prev) => ({ ...prev, products }))
  }

  function setTemplate(template) {
    setProfile((prev) => ({ ...prev, template }))
  }

  function loadProfile(newProfile) {
    if (!newProfile) return
    setProfile({
      ...defaultProfile,
      ...newProfile,
      userType: newProfile.userType || defaultProfile.userType,
      business: { ...defaultProfile.business, ...(newProfile.business || {}) },
      contact: { ...defaultProfile.contact, ...(newProfile.contact || {}) },
      address: { ...defaultProfile.address, ...(newProfile.address || {}) },
      products: newProfile.products && newProfile.products.length > 0 ? newProfile.products : (defaultProfile.products || []),
      template: newProfile.template || defaultProfile.template,
    })
  }

  function resetProfile() {
    setProfile(defaultProfile)
    try {
      localStorage.removeItem("dvc_profile")
    } catch (e) {
      console.warn("Failed to clear localStorage:", e)
    }
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateSection,
        updateField,
        setUserType,
        setProducts,
        setTemplate,
        loadProfile,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error("useProfile must be used within ProfileProvider")
  return ctx
}
