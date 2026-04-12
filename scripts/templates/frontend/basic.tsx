/**
 * Basic POC Template
 * 
 * A simple starter with a centered card, ideal for UI-only experiments 
 * or simple logic demonstrations.
 */
import styled from 'styled-components'
import POCLayout from '../../components/POCLayout'

// Card is the main container for the POC content block.
// Adjusting 'bg-white' changes the background color, 'rounded-2xl' changes border radius, 'p-8' changes padding padding, and 'shadow-xl' changes the drop shadow size.
const Card = styled.div.attrs({
  className: 'bg-white shadow-xl rounded-2xl p-8 border border-gray-100 w-full'
})``

/**
 * __NAME__ POC
 * A new research experiment.
 */
export default function __COMPONENT_NAME__POC() {
  return (
    <POCLayout 
      title="__NAME__" 
      subtitle="A new research experiment into __NAME__."
      badge="POC"
      badgeType="POC"
      pocId="__ID__"
    >
      <div className="flex flex-col items-center">
        <Card>
          <h2 className="text-2xl font-black text-gray-900 mb-4">__NAME__ Playground</h2>
          <p className="text-gray-600 mb-6">
            Welcome to the <strong>__NAME__</strong> Proof of Concept. 
            Edit <code>src/pages/pocs/__FILE_NAME__</code> to start building.
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
