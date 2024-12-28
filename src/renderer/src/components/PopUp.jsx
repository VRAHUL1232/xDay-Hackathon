/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

export const CustomAntivirusPopup = ({isOpen, close}) => {

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Antivirus Scanner</h2>
        </div>

        <div className="text-center">
          { (
            <div>
              <div className="text-green-600 text-6xl mb-4 flex justify-center">✓</div>
              <p className="text-green-600 mb-4">Scan Complete - No Threats Detected</p>
              <button
                onClick={close}
                className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                OK
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
