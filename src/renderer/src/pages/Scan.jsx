/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card'
import {
  setActiveTab,
  setSelectedFile,
  setSelectedUrl,
  setIsLoading,
  setTemp,
  resetState,

} from '../globalState/slices/homeslice'
import { Shield, Cog, LineChart, FileSearch } from 'lucide-react'
import logol from '../assets/file_scan_logo.png'
import logo2 from '../assets/internet_logo.png'

import { FaInternetExplorer } from 'react-icons/fa'
import { GrInternetExplorer } from 'react-icons/gr'

const Scan = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { activeTab, selectedFile, selectedUrl, isLoading, temp } = useSelector((state) => state.home)

  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState({
    progress: 0,
    stage: 'Preparing',
    complete: false,
    error: null
  })

  const handleFileChange = (e) => {
    dispatch(setSelectedFile(e.target.files[0]))
  }

  const handleUrlChange = (e) => {
    dispatch(setSelectedUrl(e.target.value))
    console.log(selectedUrl)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(setIsLoading(true))
    setIsProcessing(true)

    // Reset processing status
    setProcessingStatus({
      progress: 0,
      stage: 'Preparing',
      complete: false,
      error: null
    })

    try {
      const formData = new FormData()

      if (selectedFile) {
        formData.append('files', selectedFile)
      } else if (selectedUrl) {
        formData.append('url', selectedUrl)
      }

      // Update progress for uploading
      setProcessingStatus((prev) => ({
        ...prev,
        stage: 'Uploading Files',
        progress: 50
      }))

      // Upload files and folder path to backend
      setProcessingStatus({
        progress: 100,
        stage: 'Scan Completed',
        complete: true,
        error: null
      })
      dispatch(setTemp(""))
    } catch (error) {
      console.error('Error during submission:', error.message)
      setProcessingStatus({
        progress: 0,
        stage: 'Error',
        complete: false,
        error: error.message
      })
    } finally {
      dispatch(resetState())
      dispatch(setIsLoading(false))
    }
  }

  const closeProcessingPopup = () => {
    setIsProcessing(false)
    setProcessingStatus({
      progress: 0,
      stage: 'Preparing',
      complete: false,
      error: null
    })
  }

  const tabs = ['FILE', 'URL']

  return (
    <div className="max-w-5xl mx-auto p-5 mt-5 space-y-8">
      {/* Upload Section */}
      <div className="bg-white p-8 rounded-lg shadow-sm mb-8">
        {/* Tabs */}
        <div className="flex flex-row justify-center mb-8 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`text-lg px-8 py-2 font-medium transition-all border-b-2 ${
                activeTab === tab
                  ? 'text-sky-600 border-sky-600'
                  : 'text-gray-500 border-transparent hover:text-sky-600'
              }`}
              onClick={() => {
                dispatch(setActiveTab(tab))
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Upload Area */}
        <form onSubmit={handleSubmit} className="text-center">
          <div className="mb-6">
            <div className="mx-auto w-24 h-24 mb-4 flex items-center justify-center">
              <img
                src={activeTab==='FILE'? logol : logo2}
                alt="File Scan Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Error loading logo:', e)
                  e.target.style.display = 'none'
                  const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon')
                  if (fallbackIcon) {
                    fallbackIcon.style.display = 'flex'
                  }
                }}
              />
              {activeTab==='FILE' ? (<div className="fallback-icon hidden absolute inset-0 items-center justify-center text-sky-600">
                <FileSearch size={48} />
              </div>) : (<div className="fallback-icon hidden absolute inset-0 items-center justify-center text-sky-600">
                <FaInternetExplorer/>
              </div>)}
            </div>

            {activeTab === 'FILE' ? (
              <>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="file-upload"
                  className="inline-block px-6 py-3 bg-sky-600 text-white rounded-md cursor-pointer hover:bg-sky-700 transition-colors"
                >
                  <FileSearch size={20} className="mr-2 inline-block" />
                  Choose file
                </label>
                {selectedFile && (
                  <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>
                )}
              </>
            ) : (
              <>
                <label>Enter the URL</label>
                <input
                  type="text"
                  id="url"
                  name="url"
                  className="mx-4 border-2 rounded-sm border-black w-96 h-8"
                  onChange={handleUrlChange}
                />
              </>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-4">
            By submitting data above, you are agreeing to our{' '}
            <a href="#" className="text-sky-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-sky-600 hover:underline">
              Privacy Notice
            </a>
            , and to the{' '}
            <a href="#" className="text-sky-600 hover:underline">
              sharing of your Sample submission with the security community
            </a>
            .
          </p>

          <button
            type="submit"
            disabled={activeTab === 'FILE' ? !selectedFile : !selectedUrl}
            className={`px-6 py-2 rounded-md transition-colors ${
              (activeTab === 'FILE' ? selectedFile !== null : selectedUrl !== null)
                ? 'bg-sky-600 text-white hover:bg-sky-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Submit
          </button>
        </form>
      </div>

      {/* Processing Popup */}
      {isProcessing && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-96">
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${processingStatus.progress}%` }}
                ></div>
              </div>
            </div>
            <div className="text-center mt-4">
              <p className="text-lg font-semibold">
                {processingStatus.error ? 'Scan Failed' : processingStatus.stage}
              </p>
              {processingStatus.error && (
                <p className="text-red-500 mt-2">{processingStatus.error}</p>
              )}
              {!processingStatus.error && (
                <p className="text-sm text-gray-600">{processingStatus.progress}% Complete</p>
              )}
            </div>

            {processingStatus.complete || processingStatus.error ? (
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={closeProcessingPopup}
                  className={`px-6 py-2 rounded-md ${
                    processingStatus.complete
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {processingStatus.complete ? 'OK' : 'Close'}
                </button>
                {processingStatus.complete && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                  >
                    View Results
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          icon={<Shield size={24} />}
          title="See how safe you are online"
          description="Check the strength of your protection with a quick assessment."
        />
        <Card
          icon={<Cog size={24} />}
          title="Fix security weak spots"
          description="Simple instructions make it easy to set up protection and fix gaps."
        />
        <Card
          icon={<LineChart size={24} />}
          title="Improve your security"
          description="Personalized feedback helps you achieve and maintain healthy online protection."
        />
      </div>
    </div>
  )
}

export default Scan
