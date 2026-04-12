import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

// Card is the main container for the POC content block.
// Adjusting 'bg-white' changes the background color, 'rounded-xl' changes border radius, 'p-8' changes padding padding, and 'shadow-sm' changes the drop shadow size.
const Card = styled.div.attrs({
  className: 'bg-white shadow-sm rounded-xl p-8 border border-gray-100 w-full'
})``

/**
 * POC Page Template
 * 
 * To add a new POC:
 * 1. Copy this file to a new name in src/pages/pocs/
 * 2. Update the component name and content
 * 3. Register it in src/config/pocs.ts
 */
export default function TemplatePOC() {
  return (
    <POCLayout 
      title="New Feature Template" 
      subtitle="A clean starting point for your next Proof of Concept."
      badge="Template"
      badgeType="STABLE"
    >
      <div className="flex flex-col items-center">
        <Card>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Start Building Here</h2>
          <p className="text-gray-600 mb-6">
            This page uses <code>POCLayout</code> to maintain consistency across all research experiments.
            You can use Tailwind CSS classes directly or via Styled Components.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-1 text-sm">Consistent UI</h3>
              <p className="text-xs text-blue-800/70">Automatic navbar integration and layout structure.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <h3 className="font-bold text-purple-900 mb-1 text-sm">Backend Ready</h3>
              <p className="text-xs text-purple-800/70">Connect to the Hono server via <code>/api</code> or <code>/ws</code>.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg border border-green-100">
              <h3 className="font-bold text-green-900 mb-1 text-sm">Vite Powered</h3>
              <p className="text-xs text-green-800/70">Fast HMR and modern build pipeline.</p>
            </div>
          </div>
        </Card>
      </div>
    </POCLayout>
  )
}
