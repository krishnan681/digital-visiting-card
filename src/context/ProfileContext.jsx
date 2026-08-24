import { createContext, useContext, useState, useEffect } from "react"

const defaultProfile = {
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
    verified: false,
    isPrime: false,
    isAdmin: false,
    promoCode: "",
    activity: "",
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
  social: {
    facebook: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    x: "",
    telegram: "",
  },
  products: [],
  gallery: [],
  videos: [],
  payments: {
    upi: "",
    bankName: "",
    accountNumber: "",
    ifsc: "",
    accountHolder: "",
    qrImage: "",
  },
  branding: {
    primaryColor: "#2563eb",
    secondaryColor: "#1e40af",
    background: "#ffffff",
    font: "Inter",
    borderRadius: "12",
  },
  template: "pink-angled",
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

  // Safe persist effect to prevent QuotaExceededError crashes
  useEffect(() => {
    try {
      localStorage.setItem("dvc_profile", JSON.stringify(profile))
    } catch (e) {
      console.warn("localStorage quota reached or unavailable. Continuing in-memory without crashing:", e.message)
    }
  }, [profile])

  function updateSection(section, data) {
    setProfile((prev) => ({
      ...prev,
      [section]: typeof data === "function" ? data(prev[section] || {}) : { ...prev[section], ...data },
    }))
  }

  function updateField(section, field, value) {
    setProfile((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }))
  }

  function setProducts(products) {
    setProfile((prev) => ({ ...prev, products }))
  }

  function setGallery(gallery) {
    setProfile((prev) => ({ ...prev, gallery }))
  }

  function setVideos(videos) {
    setProfile((prev) => ({ ...prev, videos }))
  }

  function setTemplate(template) {
    setProfile((prev) => ({ ...prev, template }))
  }

  function loadProfile(newProfile) {
    if (!newProfile) return
    setProfile((prev) => ({
      ...defaultProfile,
      ...newProfile,
      userType: newProfile.userType || defaultProfile.userType,
      business: { ...defaultProfile.business, ...(newProfile.business || {}) },
      contact: { ...defaultProfile.contact, ...(newProfile.contact || {}) },
      address: { ...defaultProfile.address, ...(newProfile.address || {}) },
      products: newProfile.products || prev.products || [],
    }))
  }

  function addReferral(friend) {
    setProfile((prev) => {
      const currentPromo = prev.promoEvScooter || defaultProfile.promoEvScooter
      const updatedList = [
        {
          id: Date.now().toString(),
          name: friend.name,
          mobile: friend.mobile,
          date: new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
          status: "Verified",
        },
        ...(currentPromo.referralsList || []),
      ]
      const newReferralsCount = (currentPromo.referralsCount || 0) + 1
      const newCouponsEarned = Math.floor(newReferralsCount / 3)

      return {
        ...prev,
        promoEvScooter: {
          ...currentPromo,
          referralsCount: newReferralsCount,
          couponsEarned: newCouponsEarned,
          referralsList: updatedList,
        },
      }
    })
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateSection,
        updateField,
        setProducts,
        setGallery,
        setVideos,
        setTemplate,
        loadProfile,
        addReferral,
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

