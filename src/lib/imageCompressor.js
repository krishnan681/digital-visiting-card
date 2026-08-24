/**
 * Client-side image compressor using HTML5 Canvas.
 * Downscales images to max dimensions and optimizes quality to prevent QuotaExceededError.
 * 
 * @param {File} file - The file object from input[type="file"]
 * @param {Object} options - Max dimensions and quality
 * @returns {Promise<string>} - Resolves to optimized base64 DataURL
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.75,
    mimeType = "image/jpeg"
  } = options

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error("No file provided"))
    }

    // If file is SVG, don't re-compress on canvas, read as dataURL directly
    if (file.type === "image/svg+xml") {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.onerror = (e) => reject(e)
      reader.readAsDataURL(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        let width = img.width
        let height = img.height

        // Calculate aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          } else {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext("2d")
        if (!ctx) {
          // Fallback to original if context not available
          return resolve(e.target.result)
        }

        // Fill white background for transparent images converted to jpeg
        if (mimeType === "image/jpeg") {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, width, height)
        }

        ctx.drawImage(img, 0, 0, width, height)
        const compressedDataUrl = canvas.toDataURL(mimeType, quality)
        resolve(compressedDataUrl)
      }

      img.onerror = () => {
        // Fallback to raw data url if image failed to load into Image element
        resolve(e.target.result)
      }

      img.src = e.target.result
    }

    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}
