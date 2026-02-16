import { BrowserRouter, Routes, Route, useParams } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import { ProgressProvider } from './lib/progress'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { LessonView, ModuleView } from './components/LessonView'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'

function LessonViewWrapper() {
  const { moduleId, lessonSlug, subLessonSlug } = useParams()
  const key = `${moduleId}-${lessonSlug}${subLessonSlug ? `-${subLessonSlug}` : ''}`
  return <LessonView key={key} />
}

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Layout>
              <Home />
              <PWAInstallPrompt />
            </Layout>} />
            <Route path="/module/:moduleId" element={<Layout>
              <ModuleView />
            </Layout>} />
            <Route path="/module/:moduleId/:lessonSlug" element={<Layout>
              <LessonViewWrapper />
            </Layout>} />
            <Route path="/module/:moduleId/:lessonSlug/:subLessonSlug" element={<Layout>
              <LessonViewWrapper />
            </Layout>} />
          </Routes>
        </BrowserRouter>
      </ProgressProvider>
    </AuthProvider>
  )
}

export default App
