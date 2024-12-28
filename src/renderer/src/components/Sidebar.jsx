/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import logo from '../assets/hadap_logo.png'
import avatar from '../assets/avatar.jpg'
import { MdDashboard } from 'react-icons/md' // Dashboard overview icon
import { MdScanner } from 'react-icons/md' // Dashboard icon
import { FiLogOut, FiSettings } from 'react-icons/fi'
import { BiSupport, BiHistory, BiFolderOpen, BiRefresh } from 'react-icons/bi'
import { BsShieldCheck } from 'react-icons/bs'
import { IoNotificationsOutline } from 'react-icons/io5'



const Sidebar = () => {
  const location = useLocation();
  const [isNotificationOpen, setNotificationOpen] = useState(false);

  const toggleNotifications = () => {
    setNotificationOpen(!isNotificationOpen);
  };

  const notifications = [
    "Scan completed successfully.",
    "New updates are available.",
    "Privacy settings were updated.",
    "Scheduled scan is set for tomorrow.",
  ];

  const menuItems = [
    { path: '/dashboard', icon: MdDashboard, label: 'Dashboard' },
    { path: '/Scan', icon: MdScanner, label: 'Custom Scan' },
    { path: '/Quarantine', icon: BiFolderOpen, label: 'Quarantine' },
    { path: '/Rollback', icon: BiHistory, label: 'Rollback' },
    { path: '/Updates', icon: BiRefresh, label: 'Updates' },
    { path: '/support', icon: BiSupport, label: 'Support' },
    { path: '/settings', icon: FiSettings, label: 'Settings' }
  ]
  const navigate = useNavigate()

  const handleLogout = () => {
    try {
      localStorage.clear()
    } catch (error) {
      console.log(error)
    }
    navigate('/')
  }

  return (
    <div className="w-62 h-full bg-white fixed px-4 py-2 flex flex-col justify-between flex flex-col justify-between">
      <div>
        <div className="my-2 mb-4">
          <img src={logo} alt="Admin Dashboard Logo" className="inline-block w-24 h-15 mr-2 -mt-1" />
        </div>
        <hr className="text-black font-bold" />
        <ul className="mt-1 flex flex-col justify-between text-black">
          {menuItems.map(({ path, icon: Icon, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={`flex items-center mb-3 rounded py-2 px-2 transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-sky-100 text-sky-600 shadow-sm'
                    : 'hover:bg-sky-50 hover:text-sky-600'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="sm:h-16 md:h-30 lg:h-48 xl:45"></div>
      {/* Profile Detail Card */}
      <div className="bg-sky-100 text-sky-600 p-3 rounded-lg shadow-sm relative mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img src={avatar} alt="User Avatar" className="w-10 h-10 rounded-full mr-3" />
            <div className="flex-grow">
              <p className="font-bold text-sm">John Doe</p>
              <p className="text-xs text-sky-500">Admin</p>
            </div>
          </div>
          {/* Icons Section */}
          <div className="flex items-center space-x-2">
            <BsShieldCheck className="text-green-500 w-7 h-7 ml-3" title="Protected" />
            <button className="relative">
              <IoNotificationsOutline
                className="text-gray-600 font-bold w-7 h-7"
                title="Notifications"
              />
            </button>
          </div>
        </div>
        <button 
        onClick={handleLogout}
        className="mt-3 w-full flex items-center justify-center text-sm font-bold py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-all">
          <FiLogOut className="mr-1 font-bold" />
          Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
