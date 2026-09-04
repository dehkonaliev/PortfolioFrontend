import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Starfield from './components/Starfield'
import HomePage from './pages/HomePage'
import ResumePage from './pages/ResumePage'
import ProjectsPage from './pages/ProjectsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SettingsPage from './pages/SettingsPage'
import { NotFoundState } from './components/States'
import { CREATED_BY_LINK } from './lib/constants'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="relative flex min-h-screen flex-col">
            <Starfield />
            <Navbar />
            <main className="relative z-10 flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/:username" element={<ResumePage />} />
                <Route path="/:username/projects" element={<ProjectsPage />} />
                <Route path="*" element={<NotFoundState />} />
              </Routes>
            </main>
            <footer className="border-t border-[var(--border-subtle)] py-5 text-center text-xs text-[var(--text-tertiary)]">
              <span>© {new Date().getFullYear()} YourResume.</span>
              {CREATED_BY_LINK && (
                <>
                  {' '}Created by{' '}
                  <a
                    href={CREATED_BY_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--accent)] transition hover:underline"
                  >
                    Maqsudbek Dehqonaliyev
                  </a>
                </>
              )}
            </footer>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}
