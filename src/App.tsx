import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Tutorials from './pages/Tutorials'
import { POC_CONFIG } from './config/pocs'

const Loading = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
)

function App() {
  return (
    <Router>
      <Navbar />
      <div className="pt-0">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tutorials" element={<Tutorials />} />
            {POC_CONFIG.map(poc => (
              <Route 
                key={poc.id} 
                path={poc.path} 
                element={<poc.component />} 
              />
            ))}
          </Routes>
        </Suspense>
      </div>
    </Router>
  )
}

export default App
