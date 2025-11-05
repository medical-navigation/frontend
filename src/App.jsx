import './App.css'
import { useState } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import MapPage from './pages/MapPage.jsx'

function App() {
  const [auth, setAuth] = useState(null)

  if (!auth) {
    return <LoginPage onLogin={setAuth} region={"Пермский край"} backendVersion={"v0.1"} />
  }

  // Пример данных для карты:
  const hospitals = [
    { id: 'h1', name: 'Городская больница №1' },
    { id: 'h2', name: 'Областная больница' }
  ]
  const ambulances = [
    { id: 'a1', regNumber: 'А123ВС159', gpsNumber: 'GPS-001', hospital: 'Городская больница №1', position: [58.01, 56.23] },
    { id: 'a2', regNumber: 'В456СЕ159', gpsNumber: 'GPS-002', hospital: 'Областная больница', position: [57.99, 56.25] }
  ]

  return (
    <MapPage
      regionCenter={[58.01, 56.23]}
      user={{ login: auth.login, role: 'user', hospitalName: 'Городская больница №1' }}
      hospitals={hospitals}
      ambulances={ambulances}
    />
  )
}

export default App
