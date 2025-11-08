import './App.css'
import { useSelector } from 'react-redux'
import LoginPage from './pages/LoginPage.jsx'
import MapPage from './pages/MapPage.jsx'

function App() {
  const { isLoggedIn } = useSelector((state) => state.user)

  if (!isLoggedIn) {
    return <LoginPage region={'Пермский край'} backendVersion={'v0.1'} />
  }

  return (
    <MapPage
      regionCenter={[58.01, 56.23]}
    />
  )
}

export default App
