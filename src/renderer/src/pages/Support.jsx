/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import HelpCenter from '../components/HelpCenter'

const Support = () => {
  const [showHelpCenter, setShowHelpCenter] = useState(false)

  const handleBack = () => {
    setShowHelpCenter(false)
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {showHelpCenter ? (
          <HelpCenter onBack={handleBack} />
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Support Center</h1>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 border rounded-lg">
                <h2 className="text-xl font-medium text-gray-800 mb-4">Contact Support</h2>
                <p className="text-gray-600 mb-4">Need help? Our support team is available 24/7.</p>
                <button
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  onClick={() => alert('Contact support functionality')}
                >
                  Get in Touch
                </button>
              </div>

              <div className="p-6 border rounded-lg">
                <h2 className="text-xl font-medium text-gray-800 mb-4">FAQs</h2>
                <p className="text-gray-600 mb-4">Find answers to commonly asked questions.</p>
                <button
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700"
                  onClick={() => setShowHelpCenter(true)}
                >
                  View FAQs
                </button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-medium text-gray-800 mb-4">Popular Topics</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Getting Started</h3>
                  <p className="text-gray-600 text-sm">Learn the basics of using our platform</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Account Settings</h3>
                  <p className="text-gray-600 text-sm">Manage your account and preferences</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-800 mb-2">Troubleshooting</h3>
                  <p className="text-gray-600 text-sm">Common issues and their solutions</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Support
