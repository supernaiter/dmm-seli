import { BrowserRouter, Route, Routes } from "react-router-dom"

import { SiteShell } from "./components/SiteShell"
import { HomePage } from "./pages/HomePage"
import { WorkDetailPage } from "./pages/WorkDetailPage"
import { WorksPage } from "./pages/WorksPage"

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route element={<HomePage />} path="/" />
          <Route element={<WorksPage />} path="/works" />
          <Route element={<WorkDetailPage />} path="/works/:workId" />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  )
}
