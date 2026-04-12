import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

// Card is the main container for the POC content block.
// Adjusting 'bg-white' changes the background color, 'rounded-2xl' changes border radius, 'p-8' changes padding padding, and 'shadow-xl' changes the drop shadow size.
const Card = styled.div.attrs({
  className: 'bg-white shadow-xl rounded-2xl p-8 border border-gray-100 w-full'
})``

/**
 * Dashboard Test POC
 * A new research experiment.
 */
export default function DashboardTestPOC() {
  return (
    <POCLayout 
      title="Dashboard Test" 
      subtitle="A new research experiment into Dashboard Test."
      badge="POC"
      badgeType="POC"
      pocId="dashboard-test"
    >
      <div className="flex flex-col items-center">
        <Card>
          <h2 className="text-2xl font-black text-gray-900 mb-4">Dashboard Test Playground</h2>
          <p className="text-gray-600 mb-6">
            Welcome to the <strong>Dashboard Test</strong> Proof of Concept. 
            Edit <code>src/pages/pocs/DashboardTest.tsx</code> to start building.
          </p>
          
          <div className="p-6 bg-blue-50 rounded-xl border border-blue-100 border-dashed">
            <p className="text-sm text-blue-800 font-medium">
              💡 Tip: Use the <code>POCLayout</code> to maintain consistency with the lab.
            </p>
          </div>
        </Card>
      </div>
    </POCLayout>
  )
}
