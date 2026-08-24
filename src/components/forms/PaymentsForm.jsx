import { useProfile } from "../../context/ProfileContext"
import { compressImage } from "../../lib/imageCompressor"

export default function PaymentsForm() {
  const { profile, updateField } = useProfile()
  const p = profile.payments

  function update(field, value) {
    updateField("payments", field, value)
  }

  async function handleQRUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    try {
      const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.8 })
      update("qrImage", compressed)
    } catch (err) {
      console.error("QR image compression error:", err)
      const reader = new FileReader()
      reader.onload = (ev) => update("qrImage", ev.target.result)
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Payment Details</div>
        <div className="form-section-subtitle">Let customers pay you easily</div>
      </div>

      <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 12 }}>
          UPI Payment
        </div>
        <div className="form-field">
          <label className="form-label">UPI ID</label>
          <input
            className="form-input"
            placeholder="yourname@upi"
            value={p.upi}
            onChange={(e) => update("upi", e.target.value)}
          />
        </div>
        <div className="form-field" style={{ marginTop: 12 }}>
          <label className="form-label">QR Code Image <span>(optional)</span></label>
          {p.qrImage ? (
            <div className="image-preview-card">
              <div className="image-preview-thumb-wrap">
                <img src={p.qrImage} alt="QR" className="uploaded-image-thumb" />
              </div>
              <div className="image-preview-details">
                <span className="image-preview-title">UPI QR Code</span>
                <span className="image-preview-subtitle">Ready for instant scanning</span>
                <div className="image-preview-actions">
                  <label className="btn-action-change">
                    Change
                    <input type="file" accept="image/*" onChange={handleQRUpload} hidden />
                  </label>
                  <button type="button" className="btn-action-remove" onClick={() => update("qrImage", "")}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="upload-area">
              <input type="file" accept="image/*" onChange={handleQRUpload} />
              <div className="upload-area-icon">📲</div>
              <div className="upload-area-text">Upload QR Code</div>
              <div className="upload-area-sub">PNG, JPG up to 5MB</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: "12px 14px", border: "1px solid var(--border)", borderRadius: "var(--radius)", background: "var(--card)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted-foreground)", marginBottom: 12 }}>
          Bank Transfer
        </div>

        <div className="form-field">
          <label className="form-label">Account Holder Name</label>
          <input
            className="form-input"
            placeholder="John Doe"
            value={p.accountHolder}
            onChange={(e) => update("accountHolder", e.target.value)}
          />
        </div>

        <div className="form-row-2" style={{ marginTop: 12 }}>
          <div className="form-field">
            <label className="form-label">Bank Name</label>
            <input
              className="form-input"
              placeholder="HDFC Bank"
              value={p.bankName}
              onChange={(e) => update("bankName", e.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">IFSC Code</label>
            <input
              className="form-input"
              placeholder="HDFC0001234"
              value={p.ifsc}
              onChange={(e) => update("ifsc", e.target.value)}
            />
          </div>
        </div>

        <div className="form-field" style={{ marginTop: 12 }}>
          <label className="form-label">Account Number</label>
          <input
            className="form-input"
            placeholder="1234567890"
            value={p.accountNumber}
            onChange={(e) => update("accountNumber", e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
