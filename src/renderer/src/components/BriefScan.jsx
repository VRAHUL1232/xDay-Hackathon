/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useEffect, useState } from 'react'

function BriefScan() {
  const ScanDetails = ({ scanData }) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 p-5 bg-gray-100">
      <div className="bg-white rounded-lg p-5 shadow">
        <h4 className="mb-4 text-gray-700 font-semibold">Detection Results</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left font-semibold text-gray-600">AV</th>
              <th className="p-2 text-left font-semibold text-gray-600">Result</th>
              <th className="p-2 text-left font-semibold text-gray-600">Time (s)</th>
            </tr>
          </thead>
          <tbody>
            {scanData.details.map((avData, index) => {
              // Change the logic here to check for 0 (clean) and 1 (infected)
              const statusClass =
                avData.infected === 0
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              const statusText = avData.infected === 0 ? 'Clean' : 'Infected'
  
              return (
                <tr key={index} className="border-b">
                  <td className="p-2">{avData.vm}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                      {statusText}
                    </span>
                  </td>
                  <td className="p-2">{avData.scan_time}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-lg p-5 shadow">
        <h4 className="mb-4 text-gray-700 font-semibold">Additional Details</h4>
        <div className="space-y-2">
          <p>
            <strong>File Path:</strong> {scanData.file_path}
          </p>
          <p>
            <strong>SHA1:</strong> {scanData.sha1}
          </p>
          <p>
            <strong>SHA256:</strong> {scanData.sha256}
          </p>
        </div>
      </div>
    </div>
  )
  
  const ScanRow = ({ scan, onClick, showDetails }) => {
    // Determine the status based on the scan details
    const status = scan.details.some((avData) => avData.infected === 1) ? 'Infected' : 'Clean'
    const statusClass = status === 'Clean' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  
    // Convert file size from bytes to KB and format to 2 decimal places
    const fileSizeKB = (scan.file_size / 1024).toFixed(2)
  
    // Determine the chevron direction based on showDetails state
    const ChevronIcon = showDetails ? ChevronUp : ChevronDown;
  
    return (
      <>
        <tr className="hover:bg-gray-50 transition-colors">
          <td className="p-5">{scan.file_name}</td>
          <td className="p-5">{scan.file_extension}</td>
          <td className="p-5">{fileSizeKB} KB</td> {/* Display file size in KB */}
          <td className="p-5">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
              {status}
            </span>
          </td>
          <td className="p-5">
            <button onClick={onClick} className="text-black flex items-center">
              {/* Display the correct Chevron icon based on the expanded state */}
              <ChevronIcon />
            </button>
          </td>
        </tr>
        {showDetails && (
          <tr>
            <td colSpan="5">
              <ScanDetails scanData={scan} />
            </td>
          </tr>
        )}
      </>
    )
  }
  

  const [scanResults, setScanResults] = useState([])
  const [expandedRow, setExpandedRow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch scan results data from the backend
  useEffect(() => {
    const fetchScanResults = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:5000/api/grouped_scans') // Flask backend API URL
        if (!response.ok) {
          throw new Error('Failed to fetch scan results')
        }
        const data = await response.json()
        console.log('Data fetched:', data)
        setScanResults(data)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load scan results')
      } finally {
        setLoading(false)
      }
    }

    fetchScanResults()
  }, [])

  const handleDownload = (reportType) => {
    let reportContent = ''

    if (reportType === 'current') {
      reportContent = `Antivirus Current Scan Report\n\n${JSON.stringify(scanResults[0], null, 2)}`
    } else if (reportType === 'full') {
      reportContent = `Antivirus Full Report\n\n${scanResults
        .map((result, index) => `Scan ${index + 1}:\n${JSON.stringify(result, null, 2)}`)
        .join('\n\n')}`
    }

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

  console.log('scanResults:', scanResults)

  // Handle loading and error states
  if (loading) {
    return <div>Loading scan results...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <section>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Table container with vertical scrollbar */}
        <div className="max-h-[550px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-4 text-left font-semibold text-gray-600">File Name</th>
                <th className="p-4 text-left font-semibold text-gray-600">File Extension</th>
                <th className="p-4 text-left font-semibold text-gray-600">File Size</th>
                <th className="p-4 text-left font-semibold text-gray-600">Status</th> {/* New column */}
                <th className="p-4 text-left font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scanResults && scanResults.length > 0 ? (
                scanResults.map((scan, index) => (
                  <ScanRow
                    key={index}
                    scan={scan}
                    onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                    showDetails={expandedRow === index}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center p-5">No scan results available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default BriefScan
