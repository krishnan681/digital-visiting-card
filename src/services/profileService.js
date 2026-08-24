// Profile Service - Supabase profiles data layer with local fallback
// Primary Table: public.profiles

import { supabaseRest, isSupabaseConfigured } from "../lib/supabase"

const LOCAL_STORAGE_KEY = "dvc_saved_profiles"
const TEMPLATES = ["cyan-ocean", "gold-luxury", "emerald-mesh", "pink-angled", "purple-indigo", "sunset-amber"]

/**
 * Deterministically assigns a unique template based on profile seed
 */
function getDeterministicTemplate(seed, fallback = "cyan-ocean") {
  if (!seed) return fallback
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const idx = Math.abs(hash) % TEMPLATES.length
  return TEMPLATES[idx]
}

/**
 * Normalizes business name into a URL-friendly slug
 */
export function generateSlug(text) {
  if (!text) return `card-${Math.random().toString(36).substring(2, 8)}`
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/**
 * Converts Supabase public.profiles database row into frontend profile object
 */
export function mapDbRowToProfile(row) {
  if (!row) return null

  // Parse product images if available
  let productsList = []
  if (row.product_images) {
    try {
      if (typeof row.product_images === "string" && row.product_images.startsWith("[")) {
        productsList = JSON.parse(row.product_images).map((img, i) => ({
          name: `Product ${i + 1}`,
          image: typeof img === "string" ? img : (img.url || img.image),
          description: img.description || "",
          price: img.price || "",
        }))
      } else if (typeof row.product_images === "string") {
        productsList = row.product_images.split(",").filter(Boolean).map((imgUrl, i) => ({
          name: `Product ${i + 1}`,
          image: imgUrl.trim(),
          description: "",
          price: "",
        }))
      }
    } catch (e) {
      console.warn("Could not parse product_images:", e)
    }
  }

  // Generate fallback slug
  const slug = generateSlug(row.business_name || row.person_name || row.mobile_number || row.id)
  
  // Resolve template: use stored template or compute unique deterministic pattern
  const rowTemplate = row.promo_code && TEMPLATES.includes(row.promo_code)
    ? row.promo_code
    : (row.dvc_template || getDeterministicTemplate(row.id || row.mobile_number || row.business_name || slug))

  return {
    id: row.id,
    slug: row.dvc_slug || slug,
    userType: row.user_type || "business",
    template: rowTemplate,
    business: {
      businessName: row.business_name || row.dvc_business_name || "",
      businessPrefix: row.business_prefix || "M/s.",
      personName: row.person_name || row.dvc_person_name || "",
      personPrefix: row.person_prefix || "Mr.",
      designation: row.post_of_member || row.dvc_designation || "",
      category: row.activity || row.keywords || row.dvc_category || "",
      keywords: row.keywords || "",
      description: row.description || row.dvc_description || "",
      logo: row.profile_image || row.dvc_logo || "",
      banner: row.cover_image || row.dvc_banner || "",
    },
    contact: {
      mobile: row.mobile_number || row.dvc_contact?.mobile || "",
      whatsapp: row.whats_app || row.mobile_number || row.dvc_contact?.whatsapp || "",
      email: row.email || row.dvc_contact?.email || "",
      website: row.web_site || row.dvc_contact?.website || "",
      landline: row.landline || (row.landline_code ? `${row.landline_code}-${row.landline_number || ''}` : row.landline_number) || "",
      landlineCode: row.landline_code || "",
      landlineNumber: row.landline_number || "",
    },
    address: {
      address: row.bussiness_address || row.address || row.dvc_address?.address || "",
      personalAddress: row.address || "",
      businessAddress: row.bussiness_address || "",
      city: row.city || row.dvc_address?.city || "Coimbatore",
      state: row.state || row.dvc_address?.state || "Tamil Nadu",
      country: row.country || "India",
      pincode: row.pincode || row.dvc_address?.pincode || "",
      googleMapsUrl: row.google_maps_url || row.dvc_address?.googleMapsUrl || "",
    },
    products: productsList.length > 0 ? productsList : (row.dvc_products || []),
    viewsCount: row.views || row.dvc_views_count || 0,
    createdAt: row.created_at || row.dvc_created_at,
    updatedAt: row.updated_at || row.dvc_updated_at,
  }
}

/**
 * Converts frontend profile object into Supabase profiles database row
 */
export function mapProfileToDbRow(profileData) {
  const b = profileData?.business || {}
  const c = profileData?.contact || {}
  const a = profileData?.address || {}

  // Serialize product images if available
  let serializedProducts = null
  if (profileData?.products && profileData.products.length > 0) {
    try {
      serializedProducts = JSON.stringify(profileData.products)
    } catch (e) {}
  }

  return {
    user_type: profileData?.userType || (b.businessName ? "business" : "person"),
    mobile_number: c.mobile || null,
    person_name: b.personName || null,
    person_prefix: b.personPrefix || null,
    business_name: b.businessName || null,
    business_prefix: b.businessPrefix || "M/s.",
    keywords: b.keywords || b.category || null,
    description: b.description || null,
    city: a.city || "Coimbatore",
    pincode: a.pincode || null,
    email: c.email || null,
    landline: c.landline || null,
    landline_code: c.landlineCode || null,
    landline_number: c.landlineNumber || null,
    promo_code: profileData?.template || null, // Store template in promo_code
    profile_image: b.logo || null,
    cover_image: b.banner || null,
    activity: b.category || null,
    whats_app: c.whatsapp || null,
    web_site: c.website || null,
    address: a.personalAddress || a.address || null,
    bussiness_address: a.businessAddress || a.address || null,
    product_images: serializedProducts,
  }
}

/**
 * Retrieves all locally saved profiles safely from localStorage
 */
function getLocalProfiles() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    return {}
  }
}

/**
 * Saves a profile to local storage safely
 */
function saveLocalProfile(slug, profileData) {
  try {
    const profiles = getLocalProfiles()
    profiles[slug] = {
      ...profileData,
      slug,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles))
    return true
  } catch (e) {
    console.warn("Could not save profile to localStorage:", e.message)
    return false
  }
}

/**
 * Searches profiles from Supabase public.profiles ONLY using Mobile Number
 * @param {string} mobileQuery 
 * @returns {Promise<Array<object>>}
 */
export async function searchProfiles(mobileQuery = "") {
  const cleanDigits = mobileQuery.replace(/[^\d+]/g, "").trim()
  let results = []

  // 1. Query Supabase public.profiles table by mobile_number
  if (isSupabaseConfigured) {
    try {
      let endpoint = "profiles?select=*&order=created_at.desc&limit=30"
      if (cleanDigits) {
        endpoint = `profiles?mobile_number=ilike.*${encodeURIComponent(cleanDigits)}*&select=*&limit=30`
      }
      const { data, error } = await supabaseRest(endpoint)
      if (!error && Array.isArray(data) && data.length > 0) {
        results = data.map(mapDbRowToProfile)
      } else if (error) {
        console.warn("Supabase profiles query error:", error.message)
      }
    } catch (err) {
      console.warn("Supabase search error, falling back to local storage:", err)
    }
  }

  // 2. Fallback: Search local saved profiles by mobile
  const localMap = getLocalProfiles()
  const localList = Object.values(localMap)

  for (const item of localList) {
    const phone = (item?.contact?.mobile || "").replace(/[^\d+]/g, "")
    const isMatch = !cleanDigits || phone.includes(cleanDigits)

    if (isMatch && !results.some(r => r.slug === item.slug || (r.contact?.mobile && r.contact.mobile === item.contact?.mobile))) {
      results.push(item)
    }
  }

  return results
}

/**
 * Fetches profile by slug, mobile, business name, or person name from Supabase profiles table
 */
export async function getProfileBySlug(slug) {
  if (!slug) return null
  const cleanSlug = slug.trim()
  const wildcardSlug = cleanSlug.replace(/[-_]+/g, "%")
  const textSlug = cleanSlug.replace(/[-_]+/g, " ")

  if (isSupabaseConfigured) {
    try {
      // 1. Check exact mobile_number, exact business_name, or exact person_name
      const filter1 = `or=(mobile_number.eq.${encodeURIComponent(cleanSlug)},business_name.ilike.${encodeURIComponent(cleanSlug)},person_name.ilike.${encodeURIComponent(cleanSlug)},display_name.ilike.${encodeURIComponent(cleanSlug)})`
      const { data: d1, error: e1 } = await supabaseRest(`profiles?${filter1}&select=*&limit=1`)
      if (!e1 && d1 && d1.length > 0) {
        return mapDbRowToProfile(d1[0])
      }

      // 2. Wildcard slug match (e.g. "dharan-womens-care" -> "dharan%womens%care")
      const filter2 = `or=(business_name.ilike.*${encodeURIComponent(wildcardSlug)}*,person_name.ilike.*${encodeURIComponent(wildcardSlug)}*,display_name.ilike.*${encodeURIComponent(wildcardSlug)}*)`
      const { data: d2, error: e2 } = await supabaseRest(`profiles?${filter2}&select=*&limit=1`)
      if (!e2 && d2 && d2.length > 0) {
        return mapDbRowToProfile(d2[0])
      }

      // 3. Fallback search by words
      const filter3 = `or=(business_name.ilike.*${encodeURIComponent(textSlug)}*,person_name.ilike.*${encodeURIComponent(textSlug)}*)`
      const { data: d3, error: e3 } = await supabaseRest(`profiles?${filter3}&select=*&limit=1`)
      if (!e3 && d3 && d3.length > 0) {
        return mapDbRowToProfile(d3[0])
      }
    } catch (err) {
      console.warn("Supabase fetch error:", err)
    }
  }

  // Fallback: Check local published profiles
  const localProfiles = getLocalProfiles()
  const lowerSlug = cleanSlug.toLowerCase()
  if (localProfiles[lowerSlug]) {
    return localProfiles[lowerSlug]
  }

  // Match by partial key or slug in local storage
  for (const [k, p] of Object.entries(localProfiles)) {
    if (k.toLowerCase() === lowerSlug || p?.slug?.toLowerCase() === lowerSlug || p?.contact?.mobile === cleanSlug) {
      return p
    }
  }

  return null
}

/**
 * Saves or updates a profile in Supabase profiles table and local cache
 */
export async function saveProfile(slug, profileData) {
  const cleanSlug = generateSlug(slug || profileData?.business?.businessName || profileData?.contact?.mobile || "")
  
  saveLocalProfile(cleanSlug, profileData)

  if (isSupabaseConfigured) {
    try {
      const dbPayload = mapProfileToDbRow(profileData)
      const mobile = profileData?.contact?.mobile

      // If mobile number exists, check if row exists to update, otherwise insert
      if (mobile) {
        const { data: existing } = await supabaseRest(`profiles?mobile_number=eq.${encodeURIComponent(mobile)}&select=id&limit=1`)
        if (existing && existing.length > 0) {
          // Update existing row
          await supabaseRest(`profiles?mobile_number=eq.${encodeURIComponent(mobile)}`, {
            method: "PATCH",
            body: JSON.stringify(dbPayload),
          })
          return { success: true, slug: cleanSlug }
        }
      }

      // Insert new profile
      const { error } = await supabaseRest("profiles", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(dbPayload),
      })

      if (error) {
        console.warn("Supabase profiles save info:", error.message)
      }
    } catch (err) {
      console.warn("Supabase save network error:", err)
    }
  }

  return { success: true, slug: cleanSlug }
}
