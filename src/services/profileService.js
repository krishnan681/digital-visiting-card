// Profile Service - Supabase profiles data layer with local fallback
// Primary Table: public.profiles

import { supabaseRest, isSupabaseConfigured } from "../lib/supabase"

const LOCAL_STORAGE_KEY = "dvc_saved_profiles"

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
          image: typeof img === "string" ? img : img.url,
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

  return {
    id: row.id,
    slug: row.dvc_slug || slug,
    userType: row.user_type || "business",
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
      memberNum: row.member_num || "",
      bloodGroup: row.blood_group || "",
      verified: Boolean(row.verified),
      isPrime: Boolean(row.is_prime),
      isAdmin: Boolean(row.is_admin),
      promoCode: row.promo_code || "",
      activity: row.activity || "",
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
    promo_code: b.promoCode || null,
    profile_image: b.logo || null,
    cover_image: b.banner || null,
    activity: b.activity || b.category || null,
    whats_app: c.whatsapp || null,
    web_site: c.website || null,
    address: a.personalAddress || a.address || null,
    bussiness_address: a.businessAddress || a.address || null,
    member_num: b.memberNum || null,
    blood_group: b.bloodGroup || null,
    verified: Boolean(b.verified),
    is_prime: Boolean(b.isPrime),
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
 * Searches profiles from Supabase public.profiles by mobile, business name, person name, or city
 * @param {string} query 
 * @returns {Promise<Array<object>>}
 */
export async function searchProfiles(query = "") {
  const cleanQ = query.trim()
  let results = []

  // 1. Query Supabase public.profiles table
  if (isSupabaseConfigured) {
    try {
      let endpoint = "profiles?select=*&order=created_at.desc&limit=35"
      if (cleanQ) {
        // Search across mobile_number, business_name, person_name, display_name, email, city, keywords
        const filter = `or=(mobile_number.ilike.*${encodeURIComponent(cleanQ)}*,business_name.ilike.*${encodeURIComponent(cleanQ)}*,person_name.ilike.*${encodeURIComponent(cleanQ)}*,display_name.ilike.*${encodeURIComponent(cleanQ)}*,email.ilike.*${encodeURIComponent(cleanQ)}*,city.ilike.*${encodeURIComponent(cleanQ)}*,keywords.ilike.*${encodeURIComponent(cleanQ)}*)`
        endpoint = `profiles?${filter}&select=*&limit=35`
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

  // 2. Fallback: Search local saved profiles
  const localMap = getLocalProfiles()
  const localList = Object.values(localMap)

  for (const item of localList) {
    const qLower = cleanQ.toLowerCase()
    const isMatch = !cleanQ || 
      item?.business?.businessName?.toLowerCase().includes(qLower) ||
      item?.business?.personName?.toLowerCase().includes(qLower) ||
      item?.contact?.mobile?.toLowerCase().includes(qLower) ||
      item?.slug?.toLowerCase().includes(qLower)

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

  if (isSupabaseConfigured) {
    try {
      // 1. First attempt: Direct mobile, exact business_name, or exact person_name
      const filter1 = `or=(mobile_number.eq.${encodeURIComponent(cleanSlug)},business_name.ilike.${encodeURIComponent(cleanSlug)},person_name.ilike.${encodeURIComponent(cleanSlug)},display_name.ilike.${encodeURIComponent(cleanSlug)})`
      const { data: d1, error: e1 } = await supabaseRest(`profiles?${filter1}&select=*&limit=1`)
      if (!e1 && d1 && d1.length > 0) {
        return mapDbRowToProfile(d1[0])
      }

      // 2. Second attempt: Wildcard slug match (e.g. "ashok-r" -> "ashok%r")
      const filter2 = `or=(business_name.ilike.*${encodeURIComponent(wildcardSlug)}*,person_name.ilike.*${encodeURIComponent(wildcardSlug)}*,display_name.ilike.*${encodeURIComponent(wildcardSlug)}*)`
      const { data: d2, error: e2 } = await supabaseRest(`profiles?${filter2}&select=*&limit=1`)
      if (!e2 && d2 && d2.length > 0) {
        return mapDbRowToProfile(d2[0])
      }

      // 3. Third attempt: Broad search across recent profiles
      const searchResults = await searchProfiles(cleanSlug.replace(/[-_]+/g, " "))
      if (searchResults && searchResults.length > 0) {
        return searchResults[0]
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

  // Match by partial key in local storage
  for (const [k, p] of Object.entries(localProfiles)) {
    if (k.toLowerCase() === lowerSlug || p?.slug?.toLowerCase() === lowerSlug) {
      return p
    }
  }

  return null
}

/**
 * Saves or updates a profile
 */
export async function saveProfile(slug, profileData) {
  const cleanSlug = generateSlug(slug || profileData?.business?.businessName || profileData?.contact?.mobile || "")
  
  saveLocalProfile(cleanSlug, profileData)

  if (isSupabaseConfigured) {
    try {
      const dbPayload = mapProfileToDbRow(profileData)
      const { error } = await supabaseRest("profiles", {
        method: "POST",
        headers: {
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify(dbPayload),
      })

      if (error) {
        console.warn("Supabase profiles upsert info:", error.message)
      }
    } catch (err) {
      console.warn("Supabase save network error:", err)
    }
  }

  return { success: true, slug: cleanSlug }
}
