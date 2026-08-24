import { useState } from "react"
import { useProfile } from "../../context/ProfileContext"

export default function VideosForm() {
  const { profile, setVideos } = useProfile()
  const videos = profile.videos
  const [input, setInput] = useState("")

  function addVideo() {
    const url = input.trim()
    if (!url) return
    setVideos([...videos, url])
    setInput("")
  }

  function remove(i) {
    setVideos(videos.filter((_, idx) => idx !== i))
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") addVideo()
  }

  return (
    <div className="form-row">
      <div>
        <div className="form-section-title">Videos</div>
        <div className="form-section-subtitle">Add YouTube video links</div>
      </div>

      {videos.map((url, i) => (
        <div className="video-item" key={i}>
          <div className="video-item-icon">▶</div>
          <div className="video-item-url">{url}</div>
          <button className="video-item-remove" onClick={() => remove(i)} title="Remove">✕</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8 }}>
        <input
          className="form-input"
          type="url"
          placeholder="https://youtube.com/watch?v=..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={addVideo} style={{ flexShrink: 0 }}>
          Add
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
        Press Enter or click Add to add a video URL
      </div>
    </div>
  )
}
