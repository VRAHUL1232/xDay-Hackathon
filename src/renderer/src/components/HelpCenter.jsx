/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const HelpCenter = ({ onBack }) => {
  const [activeFaq, setActiveFaq] = useState(null)

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const faqData = [
    {
      question: 'What antivirus engines are used for scanning?',
      answer:
        'Our application utilizes multiple industry-leading antivirus engines (Windows Defender, ESET, Trend Micro) that work in parallel to provide comprehensive protection against various types of malware.'
    },
    {
      question: 'Does the scanner require an internet connection?',
      answer:
        'No, our scanner operates completely offline, making it perfect for secure environments or air-gapped systems. All virus definitions are stored locally.'
    },
    {
      question: 'What happens to infected files?',
      answer:
        'Infected files are automatically moved to a separate quarantine folder to prevent accidental execution. You can review these files and decide whether to delete or restore them.'
    },
    {
      question: 'Can I scan specific file types only?',
      answer:
        'Yes, in the folder section, you will see two buttons: Select Folder and Select File. Click on your preferred option to scan the selected file or folder.'
    },
    {
      question: 'How do I restore a quarantined file?',
      answer:
        "Access the quarantine folder through the application interface, select the file you want to restore, and use the 'Restore' option. Exercise caution when restoring files."
    },
    {
      question: 'Is there a limit to the file size that can be scanned?',
      answer: "While there's no strict limit, larger files may take longer to scan."
    }
  ]

  return (
    <div>
        {/* Header Bar */}
        <div
          className="fixed top-0 left-0 z-50 flex items-center px-4 py-2"
          style={{ width: 'calc(100% - 257px)', marginLeft: '257px' }}
        >
          <button
            onClick={onBack}
            className="ml-auto flex items-center space-x-2 bg-purple-700 text-white px-3 py-2 rounded-md hover:bg-purple-800 shadow-md"
          >
            <span className="text-lg font-bold">&larr;</span>
            <span>Back</span>
          </button>
        </div>

        <div className="container mx-auto p-4 pt-16 relative">
          <header className="text-center bg-white p-8 rounded-md shadow-md mb-8">
            <h1 className="text-3xl font-bold text-purple-700">HADAP AV Scanner Help Center</h1>
            <p className="text-gray-600 mt-2">
              Learn how to use our multi-engine antivirus scanning solution
            </p>
          </header>

          <section className="bg-white p-6 rounded-md shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">How It Works</h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="text-purple-600 font-bold mb-2">Step 1: File Placement</h3>
                <p className="text-gray-700">
                  Place your files in the designated target folder for scanning.
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="text-purple-600 font-bold mb-2">Step 2: Scanning</h3>
                <p className="text-gray-700">
                  Multiple antivirus engines scan the files simultaneously in offline mode.
                </p>
              </div>
              <div className="bg-gray-100 p-4 rounded-md">
                <h3 className="text-purple-600 font-bold mb-2">Step 3: Results</h3>
                <p className="text-gray-700">
                  Infected files are automatically moved to the quarantine folder, while clean files
                  remain in the target folder.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-md shadow-md">
            <h2 className="text-2xl font-semibold text-purple-700 mb-6 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div
                  key={index}
                  className={`border rounded-md overflow-hidden ${
                    activeFaq === index ? 'shadow-lg' : ''
                  }`}
                >
                  <div
                    onClick={() => toggleFaq(index)}
                    className="flex justify-between items-center px-4 py-3 bg-white cursor-pointer hover:bg-gray-50"
                  >
                    <h3 className="text-gray-700 font-medium">{faq.question}</h3>
                    {activeFaq === index ? (
                      <FaChevronUp className="text-purple-700" />
                    ) : (
                      <FaChevronDown className="text-purple-700" />
                    )}
                  </div>
                  <div
                    className="bg-gray-50 transition-all duration-300"
                    style={{
                      maxHeight: activeFaq === index ? '200px' : '0',
                      overflow: 'hidden'
                    }}
                  >
                    <p className="px-4 py-3 text-gray-700">{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
  )
}

export default HelpCenter
