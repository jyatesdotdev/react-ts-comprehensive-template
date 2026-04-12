import { useState, useEffect } from 'react'
import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

// Card is the main container for the POC content block.
// Adjusting 'bg-white' changes the background color, 'rounded-xl' changes border radius, 'p-8' changes padding padding, and 'shadow-sm' changes the drop shadow size.
const Card = styled.div.attrs({
  className: 'bg-white shadow-sm rounded-xl p-8 border border-gray-100 w-full'
})``

// ResponseBox is used to display JSON output in a code-block style format.
// Adjusting 'bg-gray-900' alters the dark background, 'text-green-400' changes the text color, and 'font-mono' alters the typographic styling.
const ResponseBox = styled.pre.attrs({
  className: 'bg-gray-900 text-green-400 p-6 rounded-xl overflow-x-auto my-4 text-sm font-mono'
})``

export default function __COMPONENT_NAME__POC() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pocs/__ID__')
      if (!response.ok) throw new Error('Failed to fetch from backend')
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <POCLayout 
      title="__NAME__" 
      subtitle="Testing REST API interactions for __NAME__ with the Hono backend server."
      badge="POC"
      badgeType="POC"
      pocId="__ID__"
    >
      <div className="flex flex-col items-center">
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Hono Server Response</h2>
            <button 
              onClick={fetchData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold shadow-md"
            >
              Refresh
            </button>
          </div>

          {loading && (
            <div className="flex items-center gap-3 text-gray-500 animate-pulse py-8">
              <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
              <p>Requesting from localhost:3001 via Vite proxy...</p>
            </div>
          )}
          
          {error && (
            <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-600 font-bold mb-4">
              Error: {error}
            </div>
          )}
          
          {data && (
            <>
              <p className="text-gray-600 mb-4">The following data was fetched from the backend:</p>
              <ResponseBox>{JSON.stringify(data, null, 2)}</ResponseBox>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Endpoint</span>
                  <code className="text-sm text-blue-600 font-mono">GET /api/hello</code>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-[10px] font-black uppercase text-gray-400 block mb-1">Proxy Config</span>
                  <code className="text-sm text-blue-600 font-mono">vite.config.ts</code>
                </div>
              </div>
            </>
          )}
        </Card>
      </div>
    </POCLayout>
  )
}
