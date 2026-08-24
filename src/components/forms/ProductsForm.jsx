import { useState } from "react"
import { useProfile } from "../../context/ProfileContext"
import { compressImage } from "../../lib/imageCompressor"

const emptyProduct = { name: "", price: "", description: "", image: "" }

export default function ProductsForm() {
  const { profile, setProducts } = useProfile()
  const products = profile.products || []
  const [editingIndex, setEditingIndex] = useState(null)
  const [draft, setDraft] = useState(emptyProduct)

  function addProduct() {
    setDraft(emptyProduct)
    setEditingIndex(products.length)
  }

  function editProduct(i) {
    setDraft({ ...products[i] })
    setEditingIndex(i)
  }

  function deleteProduct(i) {
    setProducts(products.filter((_, idx) => idx !== i))
    if (editingIndex === i) {
      setEditingIndex(null)
      setDraft(emptyProduct)
    }
  }

  function saveProduct() {
    if (!draft.name.trim()) {
      alert("Please enter a product name.")
      return
    }
    const updated = [...products]
    if (editingIndex >= products.length) {
      updated.push(draft)
    } else {
      updated[editingIndex] = draft
    }
    setProducts(updated)
    setEditingIndex(null)
    setDraft(emptyProduct)
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.8 })
      setDraft((d) => ({ ...d, image: compressed }))
    } catch (err) {
      console.error("Product image compression error:", err)
      const reader = new FileReader()
      reader.onload = (ev) => setDraft((d) => ({ ...d, image: ev.target.result }))
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="form-row">
      <div className="form-section-header">
        <div>
          <div className="form-section-title">Products & Services</div>
          <div className="form-section-subtitle">Showcase your products with photos and descriptions</div>
        </div>
        <span className="promo-badge-tag">Screen 2</span>
      </div>

      {/* Existing Products List */}
      <div className="products-grid-list">
        {products.map((p, i) => (
          <div className="product-item-card" key={i}>
            <div className="product-item-left">
              <div className="product-item-thumb">
                {p.image ? (
                  <img src={p.image} alt={p.name} />
                ) : (
                  <span className="product-thumb-placeholder">🛍️</span>
                )}
              </div>
              <div className="product-item-info">
                <div className="product-item-title">{p.name || "Untitled Product"}</div>
                {p.description && (
                  <div className="product-item-desc">{p.description}</div>
                )}
                {p.price && (
                  <div className="product-item-price">₹{p.price}</div>
                )}
              </div>
            </div>
            <div className="product-item-actions">
              <button
                type="button"
                className="btn-item-action edit"
                onClick={() => editProduct(i)}
                title="Edit product"
              >
                ✏️ Edit
              </button>
              <button
                type="button"
                className="btn-item-action delete"
                onClick={() => deleteProduct(i)}
                title="Delete product"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Box */}
      {editingIndex !== null ? (
        <div className="product-editor-box">
          <div className="product-editor-header">
            <h4>{editingIndex >= products.length ? "Add New Product" : "Edit Product"}</h4>
            <span className="product-editor-step">Enter details below</span>
          </div>

          <div className="form-field">
            <label className="form-label">Product Name</label>
            <input
              className="form-input"
              placeholder="e.g. Smart NFC Card / Premium Silk Saree"
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Product Description</label>
            <textarea
              className="form-textarea"
              placeholder="Write a clear description of the product or service..."
              value={draft.description}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="form-field">
            <label className="form-label">Price <span>(₹ optional)</span></label>
            <input
              className="form-input"
              placeholder="e.g. 1499"
              value={draft.price}
              onChange={(e) => setDraft((d) => ({ ...d, price: e.target.value }))}
            />
          </div>

          {/* Product Image */}
          <div className="form-field">
            <label className="form-label">Product Image</label>
            {draft.image ? (
              <div className="image-preview-card">
                <div className="image-preview-thumb-wrap">
                  <img src={draft.image} alt="product" className="uploaded-image-thumb product-thumb" />
                </div>
                <div className="image-preview-details">
                  <span className="image-preview-title">Product Photo</span>
                  <span className="image-preview-subtitle">Ready to display</span>
                  <div className="image-preview-actions">
                    <label className="btn-action-change">
                      Change
                      <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                    </label>
                    <button
                      type="button"
                      className="btn-action-remove"
                      onClick={() => setDraft((d) => ({ ...d, image: "" }))}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="upload-area">
                <input type="file" accept="image/*" onChange={handleImageUpload} />
                <div className="upload-area-icon">📸</div>
                <div className="upload-area-text">Upload Product Image</div>
                <div className="upload-area-sub">JPG, PNG or WebP</div>
              </div>
            )}
          </div>

          <div className="product-editor-buttons">
            <button type="button" className="btn btn-primary" onClick={saveProduct}>
              Save Product
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditingIndex(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="btn-add-product-main" onClick={addProduct}>
          <span className="add-icon">+</span>
          <span>Add More Product</span>
        </button>
      )}
    </div>
  )
}
