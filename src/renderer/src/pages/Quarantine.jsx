/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import { BiError, BiUpArrowAlt, BiShield, BiHistory, BiTransfer } from 'react-icons/bi';
import malware from '../assets/malware_icon.png';
import rollback from '../assets/rollback.png';
import isolation from '../assets/isolation_icon.png';
import * as echarts from 'echarts';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import io from "socket.io-client";

const Quarantine = () => {
  const [quarantinedFiles, setQuarantinedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeLine, setTimeLine] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [threatTab, setThreatTab] = useState('critical');
  const [resourceTab, setResourceTab] = useState('Overall');
  const [totalMemoryUsed, setTotalMemoryUsed] = useState(0);
  const [cpuData, setCpuData] = useState([]);
  const [memoryData, setMemoryData] = useState([]);
  const [diskData, setDiskData] = useState([]);

  const topFiles = {
    critical: [
      { filename: 'file1.exe', filetype: 'EXE', threatLevel: '98' },
      { filename: 'file2.exe', filetype: 'EXE', threatLevel: '86' },
      { filename: 'file3.exe', filetype: 'EXE', threatLevel: '94' },
    ],
    suspicious: [
      { filename: 'file4.docx', filetype: 'DOCX', threatLevel: '59' },
      { filename: 'file5.docx', filetype: 'DOCX', threatLevel: '69' },
      { filename: 'file6.docx', filetype: 'DOCX', threatLevel: '74' },
    ],
    stable: [
      { filename: 'file7.pdf', filetype: 'PDF', threatLevel: '23' },
      { filename: 'file8.pdf', filetype: 'PDF', threatLevel: '46' },
      { filename: 'file9.pdf', filetype: 'PDF', threatLevel: '12' },
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/quarantine');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        console.log(data);
        setQuarantinedFiles(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') {
      if (!quarantinedFiles.length) return;
      const allFileTypes = ['.zip', '.exe', '.pdf', '.docx', '.txt', 'Others'];
      const fileTypesMemory = quarantinedFiles.reduce((acc, file) => {
        const fileType = file.file_extension || 'Others';
        const fileSize = file.file_size || 0;
        const fileSizeInMB = fileSize / 1024000; // Convert bytes to MB
        acc[fileType] = acc[fileType] ? acc[fileType] + fileSizeInMB : fileSizeInMB;
        return acc;
      }, {});
    
      // Ensure all file types are included in the data, even if they are 0
      const chartData = allFileTypes.reduce((acc, fileType) => {
        acc.categories.push(fileType);
        acc.data.push(fileTypesMemory[fileType] || 0); // If no data for the file type, set it to 0
        return acc;
      }, { categories: [], data: [] });
    
      const totalMemory = chartData.data.reduce((acc, value) => acc + value, 0);
      setTotalMemoryUsed(totalMemory.toFixed(2));

      const chart = echarts.init(document.getElementById('storageChart'));
      chart.setOption({
        toolbox: {
          left: 'right',
          top: 'center',
          orient: 'vertical',
          feature: {
            dataView: { readOnly: true },
            magicType: {
            type: ['line', 'bar', 'stack']
            },
            restore: {},
            saveAsImage: {},
          }
        },
        tooltip: {
          trigger: 'item',
        },
        xAxis: {
          type: 'category',
          data: chartData.categories,
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} MB',
          },
        },
        legend: {
          data: chartData.categories
        },
        series: [
          {
            name: 'File Types',
            type: 'bar',
            data: chartData.data,
            itemStyle: {
              color: '#6A4CFF',
            },
            emphasis: {
              itemStyle: {
                color: '#9B72FF',
              },
            },
          },
        ],
      });
    }
  }, [activeTab, quarantinedFiles]);

  useEffect(() => {
    if (activeTab === 'overview') {
      // Initialize the chart
      const chartDom = document.getElementById('threatLevelChart');
      const myChart = echarts.init(chartDom);

      // Chart configuration
      const option = {
        toolbox: {
          left: 'right',
          top: 'center',
          orient: 'vertical',
          feature: {
            restore: {},
            saveAsImage: {},
          }
        },
        legend: {
          top: '5%',

          left: 'center'
        },
        series: [
          {
            name: 'Threat Level',
            type: 'pie',
            radius: '70%',
            label: {
              show: true,
              position: 'outside', 
              formatter: '{b}: {d}%',
              fontSize: 13,
              fontWeight: 'bold'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '16',
                fontWeight: 'bold'
              }
            },
            data: [
              { value: 35, name: 'Critical' },
              { value: 25, name: 'Suspicious' },
              { value: 40, name: 'Stable' }
            ]
          }
        ]
      };

      // Render the chart
      myChart.setOption(option);

      return () => {
        myChart.dispose();
      };
    }
  }, [activeTab]);

  const handleTimelineChange = (event) => {
    setTimeLine(event.target.value);
  };

  useEffect(() => {
    const socket = io("http://192.168.56.1:5003");

    socket.on("update_resource", (data) => {
      const time = new Date().toLocaleTimeString();

      setCpuData((prev) => [
        ...prev.slice(-19), // Keep the last 20 entries
        { time, value: data.cpu_usage },
      ]);
      setMemoryData((prev) => [
        ...prev.slice(-19),
        { time, value: data.memory_usage },
      ]);
      setDiskData((prev) => [
        ...prev.slice(-19),
        { time, value: data.disk_usage },
      ]);
    });

    return () => socket.disconnect(); // Clean up on unmount
  }, []);

  // Data Calculations
  const totalThreatFiles = quarantinedFiles.length;
  const isolationPercentage = totalThreatFiles > 0 ? ((totalThreatFiles / 10) * 100).toFixed(2) : 0;
  const systemRollbackStatus = 'Operational';
  const lastCleaned = '2024-12-30 08:55';

  // Function to dynamically style Threat Level
  const getThreatStyle = (level) => {
    if (level <= 50) {
      return 'bg-yellow-100 text-yellow-600 rounded-full px-4 py-1';
    } else if (level > 50 && level <= 80) {
      return 'bg-orange-200 text-orange-600 rounded-full px-4 py-1';
    } else {
      return 'bg-red-200 text-red-600 rounded-full px-4 py-1';
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return ''; // If text is undefined or null, return an empty string.
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };
  
  const renderFiles = (files) => (
    files.map((file, index) => (
      <div key={index} className="flex items-center justify-between mt-2">
        <p className="text-gray-600">{file.filename}</p>
        <p className="text-gray-600">{file.filetype}</p>
        <span className={getThreatStyle(file.threatLevel)}>{file.threatLevel}</span>
      </div>
    ))
  );

  return (
    <div className="p-6 min-h-screen">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-semibold text-sky-800 mb-6">Quarantine Folder Information</h1>

        {/* Tabs Section */}
        <div className="mb-6">
          <div className="flex space-x-8 border-b-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 text-lg font-semibold ${activeTab === 'overview' ? 'text-sky-600 border-b-2 border-sky-600' : 'text-gray-500 hover:text-sky-700'}`}
            >
              Overview
            </button>
            {/* <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 text-lg font-semibold ${activeTab === 'logs' ? 'text-sky-700 border-b-2 border-sky-700' : 'text-gray-500 hover:text-sky-700'}`}
            >
              Logs
            </button> */}
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeTab === 'overview' && (
          <>
            <div className="flex flex-col space-y-2">
              <select
                id="timeLine"
                value={timeLine}
                onChange={handleTimelineChange}
                className="block w-44 md:w-56 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm px-3 py-2 bg-white"
              >
                <option value="">Today</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
                <option value="Year">Year</option>
              </select>
            </div>
            
            {/* Cards Section */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Threat Files Card */}
              <div className="bg-sky-100 rounded-lg p-4 relative transition-all hover:shadow-md">
                <div className="flex items-center space-x-2">
                  <BiError className="text-sky-800 w-6 h-6"/>
                  <h6 className="text-sky-800 font-semibold text-lg">Total Threat Files</h6>
                </div>
                <div className="flex items-end space-x-2 mt-3">
                  <h3 className="text-red-500 text-4xl font-bold">{10}</h3>
                  <div className="bg-green-100 text-green-600 px-1 py-1/2 items-center rounded-md font-medium text-sm flex mb-1">
                    <BiUpArrowAlt className="w-4 h-4 text-green-600" />
                    <p>13.5%</p>
                  </div>
                </div>
                <p className="text-gray-500 font-medium text-sm">Compared to last {timeLine || 'Today'}</p>
                <img src={malware} className="w-20 h-20 absolute top-1/2 right-1 transform -translate-y-4"/>
              </div>

              {/* Isolation Percentage Card */}
              <div className="bg-sky-100 rounded-lg p-4 relative transition-all hover:shadow-md">
                <div className="flex items-center space-x-2">
                  <BiShield className="text-sky-800 w-6 h-6"/>
                  <h6 className="text-sky-800 font-semibold text-lg">Isolation Percentage</h6>
                </div>
                <div className="flex items-end space-x-2 mt-3">
                  <h3 className="text-yellow-500 text-3xl font-bold">{`${30}%`}</h3>
                  <div className="bg-green-100 text-green-600 px-1 py-1/2 items-center rounded-md font-medium text-sm flex mb-1">
                    <BiUpArrowAlt className="w-3 h-3 text-green-600" />
                    <p>13.5%</p>
                  </div>
                </div>
                <p className="text-gray-500 font-medium text-sm">Compared to last {timeLine || 'Today'}</p>
                <img src={isolation} className="w-20 h-20 absolute top-1/2 right-1 transform -translate-y-4"/>
              </div>

              {/* Last Cleaned Card */}
              <div className="bg-sky-100 rounded-lg p-4 relative transition-all hover:shadow-md">
                <div className="flex items-center space-x-2">
                  <BiHistory className="text-sky-800 w-6 h-6"/>
                  <h6 className="text-sky-800 font-semibold text-lg">Last Cleaned</h6>
                </div>
                <div className="mt-3">
                  <h3 className="text-blue-500 text-2xl font-bold">{lastCleaned}</h3>
                  <p className="text-gray-500 font-medium text-sm">The System was last cleaned on</p>
                </div>
              </div>

              {/* System Rollback Status Card */}
              <div className="bg-sky-100 rounded-lg p-4 relative transition-all hover:shadow-md">
                <div className="flex items-center space-x-2">
                  <BiTransfer className="text-sky-800 w-6 h-6" />
                  <h6 className="text-sky-800 font-semibold text-lg">System Rollback Status</h6>
                </div>
                <div className="mt-3">
                  <h3 className="text-green-500 text-2xl font-bold">{systemRollbackStatus}</h3>
                </div>
                <p className="text-gray-500 font-medium text-sm">Checkpoint at 2024-11-20 14:30</p>
                <img
                  src={rollback}
                  className="w-14 h-14 absolute top-1/2 right-2 transform -translate-y-1"
                  alt="Rollback Status"
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-3">
              {/* Storage Analysis Chart */}
              {/* <div className="bg-sky-100 rounded-lg p-4 flex-1 transition-all hover:shadow-md">
                <h6 className="text-sky-800 font-semibold text-xl">Storage Analysis</h6>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 font-medium text-sm">Memory utilised by Files</p>
                  <div className="text-gray-600 text-lg font-bold">Overall Storage: {totalMemoryUsed} MB</div>
                </div>
                <div id="storageChart" style={{ height: 400 }}></div>
              </div> */}

              {/* Threat Level chart */}
              <div className="bg-sky-100 rounded-lg p-4 flex-1 transition-all hover:shadow-md">
                <h6 className="text-sky-800 font-semibold text-xl">Threat Level Analysis</h6>
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 font-medium text-sm">Threat level of quarantined files</p>
                  <div className="text-gray-600 text-lg font-bold">Overall Threat: Critical</div>
                </div>
                <div id="threatLevelChart" style={{ height: 400 }}></div>
              </div>
            </div>

            <div className="flex space-x-4 mt-3">
              {/* Top Threat Files Section */}
              {/* <div className="bg-sky-100 rounded-lg p-4 w-[35%] transition-all hover:shadow-md">
                <h6 className="text-sky-800 font-semibold text-xl">Top Threat Files</h6>
                <p className="text-gray-500 font-medium text-sm">Top 3 level of quarantined files based on threat level</p>
                <div className="flex mt-5 border-b-2 border-gray-300 space-x-3">
                  <button
                    className={`px-2 py-1 ${threatTab === 'critical' ? 'bg-sky-500 text-white rounded-md font-bold' : 'bg-sky-100'}`}
                    onClick={() => setThreatTab('critical')}
                  >
                    Critical
                  </button>
                  <button
                    className={`px-2 py-1 ${threatTab === 'suspicious' ? 'bg-sky-500 text-white rounded-md font-bold' : 'bg-sky-100'}`}
                    onClick={() => setThreatTab('suspicious')}
                  >
                    Suspicious
                  </button>
                  <button
                    className={`px-2 py-1 ${threatTab === 'stable' ? 'bg-sky-500 text-white rounded-md font-bold' : 'bg-sky-100'}`}
                    onClick={() => setThreatTab('stable')}
                  >
                    Stable
                  </button>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-gray-700 font-medium">Filename</p>
                  <p className="text-gray-700 font-medium">File Type</p>
                  <p className="text-gray-700 font-medium">Threat Level</p>
                </div>
                <div className="mt-4">
                  {threatTab === 'critical' && renderFiles(topFiles.critical)}
                  {threatTab === 'suspicious' && renderFiles(topFiles.suspicious)}
                  {threatTab === 'stable' && renderFiles(topFiles.stable)}
                </div>
              </div> */}

          {/* Resource Monitor Chart */}
          {/* <div className="bg-sky-100 rounded-lg p-4 w-[65%] transition-all hover:shadow-md">
            <h6 className="text-sky-800 font-semibold text-xl">Resource Monitor</h6>
            <p className="text-gray-500 font-medium text-sm">Resource usage of the VM</p>
            <div className="flex space-x-4 border-b-2 border-gray-300 mt-4">
              <button
                className={`px-2 py-1 ${
                  resourceTab === "Overall" ? "bg-sky-500 text-white rounded-md font-bold" : "bg-sky-100"
                }`}
                onClick={() => setResourceTab("Overall")}
              >
                Overall
              </button>
              <button
                className={`px-2 py-1 ${
                  resourceTab === "cpu" ? "bg-sky-500 text-white rounded-md font-bold" : "bg-sky-100"
                }`}
                onClick={() => setResourceTab("cpu")}
              >
                CPU
              </button>
              <button
                className={`px-2 py-1 ${
                  resourceTab === "memory" ? "bg-sky-500 text-white rounded-md font-bold" : "bg-sky-100"
                }`}
                onClick={() => setResourceTab("memory")}
              >
                Memory
              </button>
              <button
                className={`px-2 py-1 ${
                  resourceTab === "disk" ? "bg-sky-500 text-white rounded-md font-bold" : "bg-sky-100"
                }`}
                onClick={() => setResourceTab("disk")}
              >
                Disk
              </button>
            </div>
            <div className="mt-4">
              {resourceTab === "Overall" && (
                <table className="min-w-full border-collapse bg-white rounded-lg">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        CPU
                      </th>
                      <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Memory
                      </th>
                      <th className="px-5 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">
                        Disk
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cpuData.slice(-3).map((data, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-5 py-2 text-sm text-gray-700">{data.time}</td>
                        <td className="px-5 py-2 text-sm text-gray-700">{data.value.toFixed(2)}%</td>
                        <td className="px-5 py-2 text-sm text-gray-700">
                          {memoryData[index]?.value.toFixed(2)}%
                        </td>
                        <td className="px-5 py-2 text-sm text-gray-700">
                          {diskData[index]?.value.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {resourceTab === "cpu" && (
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={cpuData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {resourceTab === "memory" && (
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={memoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#82ca9d" fill="#82ca9d" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
              {resourceTab === "disk" && (
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={diskData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div> */}
          </div>
          </>
        )}

        {/* Logs Tab Content */}
        {activeTab === 'logs' && (
          <>
            {/* Filter and Download Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 space-y-6 md:space-y-0 md:space-x-6">
              {/* Filter Options */}
              <div className="flex flex-wrap gap-6">
                {/* File Type Filter */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="fileType" className="text-md font-semibold text-sky-800">
                    File Type
                  </label>
                  <select
                    id="fileType"
                    className="block w-44 md:w-56 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm px-3 py-2 bg-white"
                  >
                    <option value="">All</option>
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX</option>
                    <option value="exe">EXE</option>
                    <option value="txt">TXT</option>
                  </select>
                </div>

                {/* Threat Level Filter */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="threatLevel" className="text-md font-semibold text-sky-800">
                    Threat Level
                  </label>
                  <select
                    id="threatLevel"
                    className="block w-44 md:w-56 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm px-3 py-2 bg-white"
                  >
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="very_high">Very High</option>
                  </select>
                </div>

                {/* Date Range Filter */}
                <div className="flex flex-col space-y-2">
                  <label htmlFor="dateRange" className="text-md font-semibold text-sky-800">
                    Date Range
                  </label>
                  <select
                    id="dateRange"
                    className="block w-44 md:w-56 border border-gray-300 rounded-lg shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm px-3 py-2 bg-white"
                  >
                    <option value="">All</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_year">Last Year</option>
                  </select>
                </div>
              </div>

              {/* Download Report Button */}
              <button
                onClick={() => {
                  // Add your logic for downloading a report here
                  console.log('Download Report');
                }}
                className="px-6 py-2 bg-sky-600 text-white font-medium rounded-lg shadow hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 text-sm transition duration-150 ease-in-out"
              >
                Download Report
              </button>
            </div>

            {/* Table Section */}
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : error ? (
              <p className="text-center text-red-500">{error}</p>
            ) : quarantinedFiles.length === 0 ? (
              <p className="text-center text-gray-500">No quarantined files found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse bg-white shadow-md rounded-lg">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Filename</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">File Path</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">File Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider">Threat Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quarantinedFiles.map((file, index) => (
                      <tr key={index} className="border-b">
                        <td className="px-6 py-4 text-sm text-gray-700">{file.finish_time}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{truncateText(file.file_name, 20)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{truncateText(file.file_path, 20)}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{file.file_extension}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <span className={getThreatStyle(file.threat_level)}>{file.threat_level}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Quarantine;
