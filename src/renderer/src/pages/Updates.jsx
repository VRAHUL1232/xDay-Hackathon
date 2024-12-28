/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import { BiRefresh, BiDownload } from "react-icons/bi";
import { BsCheckCircleFill } from "react-icons/bs";
import windowsLogo from "../assets/windows-defender.png";
import esetLogo from "../assets/ESET_logo.png";

const updatesData = [
  {
    date: "2024-11-25",
    title: "Version 2.1 Released",
    description: "This update includes several bug fixes and performance improvements.",
    available: true,
    softwareLogo: windowsLogo,
    softwareName: "Windows Defender",
  },
  {
    date: "2024-10-15",
    title: "New Feature: Real-time Scanning",
    description: "We have added real-time scanning to enhance your protection.",
    available: false,
    softwareLogo: esetLogo,
    softwareName: "ESET",
  },
  {
    date: "2024-09-05",
    title: "Security Patch",
    description: "A critical security patch has been applied to address vulnerabilities.",
    available: false,
    softwareLogo: windowsLogo,
    softwareName: "Windows Defender",
  },
];

const Updates = () => {
  const [activeTab, setActiveTab] = useState("available");
  const availableUpdates = updatesData.filter((update) => update.available);
  const pastUpdates = updatesData.filter((update) => !update.available);

  return (
    <div className="p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-sky-800 mb-6">Updates</h1>

        {/* Tabs */}
        <div className="flex mb-6 border-b">
          <button
            className={`px-4 py-2 font-medium transition-all border-b-2 ${
              activeTab === "available"
                ? "text-sky-600 border-sky-600"
                : "text-gray-500 border-transparent hover:text-sky-600"
            }`}
            onClick={() => setActiveTab("available")}
          >
            Available Updates
          </button>
          <button
            className={`px-4 py-2 font-medium transition-all border-b-2 ml-4 ${
              activeTab === "past"
                ? "text-sky-600 border-sky-600"
                : "text-gray-500 border-transparent hover:text-sky-600"
            }`}
            onClick={() => setActiveTab("past")}
          >
            Past Updates
          </button>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {activeTab === "available" && availableUpdates.length > 0 ? (
            availableUpdates.map((update, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md flex items-center relative"
              >
                {/* Vertical Line */}
                <div className="absolute top-0 left-0 h-full w-1 bg-green-500 rounded-l-lg"></div>

                {/* Software Logo Container */}
                <div className="ml-4 flex flex-col items-center">
                  <img
                    src={update.softwareLogo}
                    alt={`${update.softwareName} logo`}
                    className="w-12 h-12 object-contain mb-2"
                  />
                  <span className="text-xs text-gray-600 text-center">
                    {update.softwareName}
                  </span>
                </div>

                <div className="flex-grow ml-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {update.title}
                      </h2>
                      <p className="text-gray-600">{update.date}</p>
                      <p className="text-gray-700 mt-2">{update.description}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="flex items-center text-green-500 mb-2">
                        <BsCheckCircleFill className="w-5 h-5 mr-2" />
                        <span className="text-sm">Ready to Install</span>
                      </div>
                      <button
                        onClick={() => {
                          console.log("Installing update:", update.title);
                        }}
                        className="px-4 py-2 mt-4 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-150 flex items-center"
                      >
                        <BiDownload className="w-4 h-4 mr-2" />
                        Install Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : activeTab === "past" && pastUpdates.length > 0 ? (
            pastUpdates.map((update, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-lg shadow-md flex items-center relative"
              >
                {/* Vertical Line */}
                <div className="absolute top-0 left-0 h-full w-1 bg-blue-500 rounded-l-lg"></div>

                {/* Software Logo Container */}
                <div className="ml-4 flex flex-col items-center">
                  <img
                    src={update.softwareLogo}
                    alt={`${update.softwareName} logo`}
                    className="w-12 h-12 object-contain mb-2"
                  />
                  <span className="text-xs text-gray-600 text-center">
                    {update.softwareName}
                  </span>
                </div>

                <div className="flex-grow ml-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">
                        {update.title}
                      </h2>
                      <p className="text-gray-600">{update.date}</p>
                      <p className="text-gray-700 mt-2">{update.description}</p>
                    </div>
                    <div className="flex items-center text-blue-500">
                      <BsCheckCircleFill className="w-5 h-5 mr-2" />
                      <span className="text-sm">Installed</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No updates available.</p>
          )}
        </div>

        {/* Check for Updates button */}
        {activeTab === "available" && (
          <button
            onClick={() => {
              console.log("Check for updates");
            }}
            className="mt-6 px-6 py-2 bg-sky-600 text-white font-medium rounded-lg shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 text-sm transition duration-150 ease-in-out flex items-center"
          >
            <BiRefresh className="w-5 h-5 mr-2" />
            Check for Updates
          </button>
        )}
      </div>
    </div>
  );
};

export default Updates;
