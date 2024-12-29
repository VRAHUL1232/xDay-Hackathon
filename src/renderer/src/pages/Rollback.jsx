/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import WindowsDefender from '../components/WindowsDefender'
import ESET from '../components/ESET'
import HADAP from '../components/HADAP'
import { FaFolder } from 'react-icons/fa';

const Rollback = () => {
  const [showVM1, setShowVM1] = useState(false)
  const [showVM2, setShowVM2] = useState(false)
  const [showVM3, setShowVM3] = useState(false)

  const handleBack = () => {
    setShowVM1(false)
    setShowVM2(false)
    setShowVM3(false)
  }

  return (
    <div className="p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {showVM1 ? (
          <WindowsDefender onBack={handleBack} />
        ) : showVM2 ? (
            <ESET onBack={handleBack} />
        ) : (
            showVM3 ? (
                <HADAP onBack={handleBack} />
            ) : 
          <>
            <h1 className="text-3xl font-semibold text-sky-800 mb-6">VM Backups & Restore</h1>
            <div className="border-b-2"/>
            <div className="grid md:grid-cols-3 gap-2 mt-4">
                <div className="flex flex-col items-center">
                    <FaFolder
                        className="w-20 h-20 text-sky-600 rounded-md hover:text-sky-800 cursor-pointer"
                        onClick={() => setShowVM1(true)}
                    />
                    <span className='text-gray-600 text-medium font-semibold'>Windows Defender</span>
                </div>
                <div className="flex flex-col items-center">
                    <FaFolder
                        className="w-20 h-20 text-sky-600 rounded-md hover:text-sky-800 cursor-pointer"
                        onClick={() => setShowVM2(true)}
                    />
                    <span className='text-gray-600 text-medium font-semibold'>ESET</span>
                </div>
                <div className="flex flex-col items-center">
                    <FaFolder
                        className="w-20 h-20 text-sky-600 rounded-md hover:text-sky-800 cursor-pointer"
                        onClick={() => setShowVM3(true)}
                    />
                    <span className='text-gray-600 text-medium font-semibold'>HADAP</span>
                </div>
            </div>
           </>
        )}
      </div>
    </div>
  )
}

export default Rollback
