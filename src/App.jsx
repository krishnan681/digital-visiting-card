import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import CreatePage from "./pages/CreatePage"
import FullPagePreview from "./components/preview/FullPagePreview"
import PublicProfilePage from "./pages/PublicProfilePage"
import { ProfileProvider } from "./context/ProfileContext"

export default function App() {
  return (
    <ProfileProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/create" replace />} />
          <Route path="/create" element={<CreatePage />} />
          <Route path="/preview" element={<FullPagePreview />} />
          <Route path="/:slug" element={<PublicProfilePage />} />
        </Routes>
      </BrowserRouter>
    </ProfileProvider>
  )
}
