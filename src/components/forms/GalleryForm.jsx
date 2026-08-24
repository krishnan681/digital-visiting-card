import { useProfile } from "../../context/ProfileContext"
import { compressImage } from "../../lib/imageCompressor"

export default function GalleryForm() {
  const { profile, setGallery } = useProfile()
  const gallery = profile.gallery

  async function handleUpload(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    const compressedImages = await Promise.all(
      files.map(async (file) => {
        try {
          return await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.75 })
        } catch (err) {
          console.error("Gallery compression error:", err)
          return new Promise((resolve) => {
            const reader = new FileReader()
            reader.onload = (ev) => resolve(ev.target.result)
            reader.readAsDataURL(file)
          })
        }
      })
    )

    setGallery((prev) => [...prev, ...compressedImages])
  }

  function remove(index) {
    setGallery(gallery.filter((_, i) => i !== index))
  }

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Gallery</div>
        <div className="form-section-subtitle">Upload photos to showcase your work</div>
      </div>

      {gallery.length > 0 && (
        <div className="gallery-grid">
          {gallery.map((img, i) => (
            <div className="gallery-item" key={i}>
              <img src={img} alt="" />
              <button
                className="gallery-item-remove"
                onClick={() => remove(i)}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="upload-area" style={{ minHeight: 100 }}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
        />
        <div className="upload-area-icon">🖼️</div>
        <div className="upload-area-text">Upload Images</div>
        <div className="upload-area-sub">Select multiple images at once</div>
      </div>

      {gallery.length > 0 && (
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {gallery.length} image{gallery.length !== 1 ? "s" : ""} uploaded
        </div>
      )}
    </div>
  )
}
