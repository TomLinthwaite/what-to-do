import { BrowserRouter, Route, Routes } from 'react-router'
import { AppHeader } from './components/AppHeader'
import { OfflineBanner } from './components/OfflineBanner'
import { AuthProvider } from './context/AuthProvider'
import { LibraryProvider } from './context/LibraryProvider'
import { TripProvider } from './context/TripProvider'
import { AccountPage } from './pages/AccountPage'
import { ExplorePage } from './pages/ExplorePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PlannerLayout } from './pages/PlannerLayout'
import { PlacesPage } from './pages/PlacesPage'
import { PlanPage } from './pages/PlanPage'
import { RequireAuth } from './pages/RequireAuth'
import { SharedTripPage } from './pages/SharedTripPage'
import { ShortlistPage } from './pages/ShortlistPage'
import { SignupPage } from './pages/SignupPage'
import { TripsPage } from './pages/TripsPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <LibraryProvider>
            <OfflineBanner />
            <AppHeader />
            <div className="app">
              <Routes>
                <Route element={<PlannerLayout />}>
                  <Route index element={<ExplorePage />} />
                  <Route path="shortlist" element={<ShortlistPage />} />
                  <Route path="plan" element={<PlanPage />} />
                </Route>
                <Route path="login" element={<LoginPage />} />
                <Route path="signup" element={<SignupPage />} />
                <Route path="shared" element={<SharedTripPage />} />
                <Route path="places" element={<PlacesPage />} />
                <Route element={<RequireAuth />}>
                  <Route path="trips" element={<TripsPage />} />
                  <Route path="account" element={<AccountPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </LibraryProvider>
        </TripProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
