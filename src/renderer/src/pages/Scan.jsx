/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import { setActiveTab, setSelectedFile, setSelectedFolder, setIsLoading, resetState } from '../globalState/slices/homeslice';
import { Shield, Cog, LineChart, FileSearch, FolderOpen } from 'lucide-react';
import logol from '../assets/file_scan_logo.png';

const Scan = () => {
  const folderInputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState(null);
  const { activeTab, selectedFile, selectedFolder, folderName, isLoading } = useSelector((state) => state.home);

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState({
    progress: 0,
    stage: 'Preparing',
    complete: false,
    error: null
  });

  const handleFileChange = (e) => {
    dispatch(setSelectedFile(e.target.files[0]));
  };

const handleFolderChange = (e) => {
  const files = Array.from(e.target.files);
  if (files) {
    const folderPath = files[0].webkitRelativePath; // Folder path from the first file
    const folderName = folderPath.split('/')[0]; // Extract folder name
    dispatch(setSelectedFolder({ files, folderName })); // Send folder path along with files
  } else {
    dispatch(setSelectedFolder({ files: null, folderName: null }));
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  dispatch(setIsLoading(true));
  setIsProcessing(true);

  // Reset processing status
  setProcessingStatus({
    progress: 0,
    stage: 'Preparing',
    complete: false,
    error: null
  });

  try {
    const formData = new FormData();
    const filePaths = [];

    if (selectedFile) {
      formData.append('files', selectedFile);
      filePaths.push(selectedFile.webkitRelativePath);
    }

    if (selectedFolder) {
      selectedFolder.forEach((file) => {
        formData.append('files', file);
        filePaths.push(file.webkitRelativePath || file.name);
      });
      // Send the folder path with the files
      formData.append('folderPath', selectedFolder.folderName);
    }

    // Update progress for uploading
    setProcessingStatus(prev => ({
      ...prev,
      stage: 'Uploading Files',
      progress: 25
    }));

    // Upload files and folder path to backend
    const uploadResponse = await fetch('http://192.168.56.1:5002/upload_files', {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('File upload failed');
    }

    const uploadData = await uploadResponse.json()
    console.log('Trigger Scan Response:', uploadData)
    
    // Upload file paths to backend
    const pathsResponse = await fetch('http://192.168.56.1:5002/upload_file_paths', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ filePaths })
    });

    if (!pathsResponse.ok) {
      throw new Error('File paths upload failed');
    }

    const pathsData = await pathsResponse.json();
    console.log('File Paths Upload Response:', pathsData);

    // Further processing after successful upload
    setProcessingStatus(prev => ({
      ...prev,
      stage: 'Analyzing Files',
      progress: 50
    }));

    // Assuming you're sending results here (implement as needed)
    // const resultsResponse = await fetch('http://192.168.56.1:5002/upload_results');

    // if (!resultsResponse.ok) {
    //   throw new Error('Failed to fetch scan results');
    // }

    // // Parse results
    // const resultsData = await resultsResponse.json();
    // console.log('Scan results:', resultsData);

    // Complete progress
    setProcessingStatus({
      progress: 100,
      stage: 'Scan Completed',
      complete: true,
      error: null
    });

  } catch (error) {
    console.error('Error during submission:', error.message);
    setProcessingStatus({
      progress: 0,
      stage: 'Error',
      complete: false,
      error: error.message
    });
  } finally {
    dispatch(resetState());
    dispatch(setIsLoading(false));
  }
};

  const closeProcessingPopup = () => {
    setIsProcessing(false);
    setProcessingStatus({
      progress: 0,
      stage: 'Preparing',
      complete: false,
      error: null
    });
  };
  
  const triggerFolderInput = () => {
    if (folderInputRef.current) {
      folderInputRef.current.click();
    }
  };

  const tabs = ['FILE', 'FOLDER'];

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
                activeTab === tab ? 'text-sky-600 border-sky-600' : 'text-gray-500 border-transparent hover:text-sky-600'
              }`}
              onClick={() => {
                dispatch(setActiveTab(tab));
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
                src={logol}
                alt="File Scan Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  console.error('Error loading logo:', e);
                  e.target.style.display = 'none';
                  const fallbackIcon = e.target.parentNode.querySelector('.fallback-icon');
                  if (fallbackIcon) {
                    fallbackIcon.style.display = 'flex';
                  }
                }}
              />
              <div className="fallback-icon hidden absolute inset-0 items-center justify-center text-sky-600">
                <FileSearch size={48} />
              </div>
            </div>

            {activeTab === 'FILE' ? (
              <>
                <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
                <label htmlFor="file-upload" className="inline-block px-6 py-3 bg-sky-600 text-white rounded-md cursor-pointer hover:bg-sky-700 transition-colors">
                  <FileSearch size={20} className="mr-2 inline-block" />
                  Choose file
                </label>
                {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected: {selectedFile.name}</p>}
              </>
            ) : (
              <>
                <input
                  type="file"
                  ref={folderInputRef}
                  id="folder-upload"
                  className="hidden"
                  webkitdirectory="true"
                  onChange={handleFolderChange}
                />
                <button
                  type="button"
                  onClick={triggerFolderInput}
                  className="inline-block px-6 py-3 bg-sky-600 text-white rounded-md cursor-pointer hover:bg-sky-700 transition-colors"
                >
                  <FolderOpen size={20} className="mr-2 inline-block" />
                  Choose folder
                </button>
                {folderName && <p className="mt-2 text-sm text-gray-600">Selected: {folderName}</p>}
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
            disabled={activeTab === 'FILE' ? !selectedFile : !selectedFolder}
            className={`px-6 py-2 rounded-md transition-colors ${
              (activeTab === 'FILE' ? selectedFile : selectedFolder)
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
                  style={{width: `${processingStatus.progress}%`}}
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
  );
};

export default Scan;