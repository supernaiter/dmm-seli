import { BrowserRouter, Route, Routes } from "react-router-dom"

import { SiteShell } from "./components/SiteShell"
import { TrackerPage } from "./pages/TrackerPage"
import { WorkDetailPage } from "./pages/WorkDetailPage"

export default function App() {
  return (
    <BrowserRouter>
      <SiteShell>
        <Routes>
          <Route element={<TrackerPage />} path="/" />
          <Route element={<TrackerPage />} path="/works" />
          <Route element={<WorkDetailPage />} path="/works/:workId" />
        </Routes>
      </SiteShell>
    </BrowserRouter>
  )
}
