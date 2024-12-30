/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import BriefScan from '../components/BriefScan'
import PastScan from '../components/PastScan'
import Overview from '../components/Overview'

const Dashboard = () => {
  const [scanResults, setScanResults] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const tabs = ['Overview', 'Brief Details']
  const [activeTab, setActiveTab] = useState('Overview')

  useEffect(() => {
    // Fetch data from the Flask API
    fetch('http://localhost:5000/api/scans')
      .then((response) => response.json())
      .then((data) => setScanResults(data))
      .catch((error) => console.error('Error fetching data:', error))
  }, [])

  const handleDownload = (reportType) => {
    let reportContent = 'Anti Virus Full Report \n\n File Name \t\t File Size \t\t File Extension \t\t Status \n malware_file \t\t 30KB \t\t\t .txt \t\t\t Infected \t\t'


    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}_report.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <div className="rounded-lg md:flex-row justify-between items-start md:items-center">
          <div className="flex justify-between md:mt-0">
            <h1 className="text-3xl font-semibold text-sky-800">Dashboard</h1>
            <button
              key={'full'}
              onClick={() => handleDownload('full')}
              className="px-4 py-2 bg-sky-700 hover:bg-sky-900 text-white rounded-lg md:px-2 font-sm"
            >
              Download Full Report
            </button>
          </div>
          <div className="rounded-lg shadow-sm">
            <div className="flex shadow-md justify-around bg-gray-100 border-b my-3 rounded-lg">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={`text-xl px-8 py-2 font-medium transition-all border-b-2 ${
                    activeTab === tab
                      ? 'text-sky-900 border-sky-900'
                      : 'text-sky-900 border-transparent hover:text-sky-900'
                  }`}
                  onClick={() => {
                    setActiveTab(tab)
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            {activeTab == 'Overview' ? (
              <Overview />
            ) :  (
              <BriefScan />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
