import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
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
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
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
            <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-400 dark:border-gray-700 dark:text-gray-500">
              <span>© {new Date().getFullYear()} YourResume.</span>
              {CREATED_BY_LINK && (
                <>
                  {' '}Created by{' '}
                  <a
                    href={CREATED_BY_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 transition hover:underline dark:text-indigo-400"
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