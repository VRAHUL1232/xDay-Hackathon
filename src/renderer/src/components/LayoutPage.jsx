/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */


import Navbar from "./Navbar"
import Sidebar from "./Sidebar"

function LayoutPage({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-52">
        <main className="p-6 bg-gray-50 min-h-screen">
            {children}
        </main>
      </div>
    </div>
  )
}

export default LayoutPage
