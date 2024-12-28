/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import { Routes, Route } from 'react-router-dom'
import Scan from './pages/Scan'
import Dashboard from './pages/Dashboard'
import Quarantine from './pages/Quarantine'
import Updates from './pages/Updates'
import Support from './pages/Support'
import LoginPage from './pages/Login'
import LayoutPage from './components/LayoutPage'
import Settings from './pages/Settings'
import Rollback from './pages/Rollback'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<LayoutPage><Dashboard/> </LayoutPage>} />
      <Route path="/Scan" element={<LayoutPage><Scan/> </LayoutPage>} />
      <Route path="/Quarantine" element={<LayoutPage><Quarantine /> </LayoutPage>} />
      <Route path="/Rollback" element={<LayoutPage><Rollback /> </LayoutPage>} />
      <Route path="/Updates" element={<LayoutPage><Updates /></LayoutPage>} />
      <Route path="/support" element={<LayoutPage><Support/> </LayoutPage>} />
      <Route path="/settings" element={<LayoutPage><Settings/> </LayoutPage>} />
    </Routes>
  )
}

export default App