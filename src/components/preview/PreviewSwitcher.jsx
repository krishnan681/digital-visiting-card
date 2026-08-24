const DEVICES = [
  {
    id: "mobile",
    label: "Mobile",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
  {
    id: "desktop",
    label: "Desktop",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
  },
  {
    id: "fullpage",
    label: "Full Page ↗",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
      </svg>
    ),
  },
]

export default function PreviewSwitcher({ device, onChange }) {
  const handleClick = (id) => {
    if (id === "fullpage") {
      window.open("/preview", "_blank")
    }
    onChange(id)
  }

  return (
    <div className="preview-switcher" role="tablist" aria-label="Preview device">
      {DEVICES.map((d) => (
        <button
          key={d.id}
          role="tab"
          aria-selected={device === d.id}
          className={`device-btn ${device === d.id ? "active" : ""}`}
          onClick={() => handleClick(d.id)}
          title={d.id === "fullpage" ? "Open Full Live Preview in New Window" : d.label}
        >
          <span className="device-icon">{d.icon}</span>
          <span className="device-label">{d.label}</span>
        </button>
      ))}
    </div>
  )
}
