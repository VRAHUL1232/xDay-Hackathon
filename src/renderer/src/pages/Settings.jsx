/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';

const Settings = () => {
  const [folderPath, setFolderPath] = useState('');
  const [folderName, setFolderName] = useState('');
  const [isSelectButtonEnabled, setIsSelectButtonEnabled] = useState(false);
  const folderInputRef = useRef(null);

  const handleFolderChange = (event) => {
    const files = event.target.files;
  
    if (files.length > 0) {
      // Get the path of the first file
      const firstFile = files[0];
      const fullPath = firstFile.webkitRelativePath;
  
      // Extract the directory name from the file path
      const folderPath = fullPath.substring(0, fullPath.lastIndexOf('/'));
  
      // Construct the full path
      const completeFolderPath = `${firstFile.path.substring(0, firstFile.path.lastIndexOf('\\'))}`;
  
      setFolderPath(completeFolderPath); // Save the complete folder path
      setFolderName(folderPath); // Save the relative folder name
      sendFolderPathToServer(completeFolderPath); // Send the complete folder path to the server
  
      // Disable the "Select Folder Path" button after selection
      setIsSelectButtonEnabled(false);
    }
  };
  

  const sendFolderPathToServer = async (folderPath) => {
    if (!folderPath) {
      console.error('No folder path selected');
      return;
    }

    try {
      const response = await fetch('http://192.168.56.1:5002/set_folder_path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folderPath }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log('Folder path sent successfully:', data);
      } else {
        console.error('Error sending folder path:', data);
      }
    } catch (error) {
      console.error('Error sending folder path:', error);
    }
  };

  const triggerFolderInput = () => {
    folderInputRef.current.click();
  };

  const enableSelectButton = () => {
    setFolderPath(''); // Clear the previously selected folder path
    setFolderName(''); // Clear the previously selected folder name
    setIsSelectButtonEnabled(true);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Settings</h1>
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Target Folder Settings</h3>
          <p className="text-gray-600 mb-4">Manage your Target folder information and monitoring preferences.</p>
          <div className="flex items-center">
            {folderName && <p className="text-gray-600 mt-2">Selected Folder: {folderName}</p>}
            {isSelectButtonEnabled && (
              <button onClick={triggerFolderInput} className='px-2 py-1 text-sm bg-blue-700 text-white rounded-full hover:bg-blue-400 mt-4'>
                Choose Folder
              </button>
            )}
          </div>
          <input
            type="file"
            webkitdirectory="true"
            directory=""
            multiple
            onChange={handleFolderChange}
            ref={folderInputRef}
            style={{ display: 'none' }}
          />
          <button
            className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 mt-4"
            onClick={enableSelectButton}
          >
            Edit Folder
          </button>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Profile Settings</h3>
          <p className="text-gray-600 mb-4">Manage your account information and preferences.</p>
          <button className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
            Edit Profile
          </button>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Notification Settings</h3>
          <p className="text-gray-600 mb-4">Configure your notification preferences.</p>
          <button className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
            Manage Notifications
          </button>
        </div>
        
        <div className="p-4 border rounded-lg">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Security Settings</h3>
          <p className="text-gray-600 mb-4">Update your security preferences and password.</p>
          <button className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
            Security Options
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;