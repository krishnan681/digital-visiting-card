import { useProfile } from "../../context/ProfileContext"

export default function AddressForm() {
  const { profile, updateField } = useProfile()
  const a = profile.address

  function update(field, value) {
    updateField("address", field, value)
  }

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Address</div>
        <div className="form-section-subtitle">Your business location details</div>
      </div>

      <div className="form-field">
        <label className="form-label">Street Address</label>
        <textarea
          className="form-textarea"
          placeholder="123, Business Park, Main Street"
          value={a.address}
          onChange={(e) => update("address", e.target.value)}
          rows={2}
          style={{ minHeight: 60 }}
        />
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">City</label>
          <input
            className="form-input"
            placeholder="Mumbai"
            value={a.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">State</label>
          <input
            className="form-input"
            placeholder="Maharashtra"
            value={a.state}
            onChange={(e) => update("state", e.target.value)}
          />
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-field">
          <label className="form-label">Country</label>
          <input
            className="form-input"
            placeholder="India"
            value={a.country}
            onChange={(e) => update("country", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Pincode</label>
          <input
            className="form-input"
            placeholder="400001"
            value={a.pincode}
            onChange={(e) => update("pincode", e.target.value)}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">Google Maps URL <span>(optional)</span></label>
        <input
          className="form-input"
          type="url"
          placeholder="https://maps.google.com/..."
          value={a.googleMapsUrl}
          onChange={(e) => update("googleMapsUrl", e.target.value)}
        />
      </div>
    </div>
  )
}
