/* eslint-disable prettier/prettier */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'; // Import small modular icons

const PastScan = () => {
    const [scans, setScans] = useState([]);
    const [sortOrder, setSortOrder] = useState('desc'); // Default sort order is descending (recent scans at top)
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchScans();
    }, [sortOrder]);

    const fetchScans = async () => {
        setLoading(true);
        setError(null); // Reset error state before fetching
        try {
            // Use 'sortByTime' parameter instead of 'sortByFinishTime'
            const response = await axios.get(`http://localhost:5000/api/past_scans?sortByTime=${sortOrder}`);
            if (Array.isArray(response.data)) {
                setScans(response.data);
            } else {
                console.error('Unexpected response data:', response.data);
                setScans([]);
            }
        } catch (error) {
            console.error('Error fetching scans:', error);
            setError('Failed to fetch scan data. Please try again later.');
            setScans([]);
        } finally {
            setLoading(false);
        }
    };

    const toggleSortOrder = () => {
        setSortOrder((prevOrder) => (prevOrder === 'desc' ? 'asc' : 'desc'));
    };

    return (
        <div>
            {loading ? (
                <div className="text-center text-gray-500 text-xs">Loading...</div>
            ) : error ? (
                <div className="text-center text-red-500 text-xs">{error}</div>
            ) : scans.length === 0 ? (
                <div className="text-center text-gray-500 text-xs">No scans available.</div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-auto" style={{ maxHeight: '70vh' }}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="p-4 text-left font-semibold text-gray-600">File Name</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                                    <th className="p-4 text-left font-semibold text-gray-600">Scan Time</th>
                                    <th
                                        className="p-4 text-left font-semibold text-gray-600 cursor-pointer flex items-center"
                                        onClick={toggleSortOrder}
                                    >
                                        Finish Time
                                        {sortOrder === 'desc' ? (
                                            <FaArrowDown className="ml-2 text-xs" />
                                        ) : (
                                            <FaArrowUp className="ml-2 text-xs" />
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {scans.map((scan) => (
                                    <tr key={scan.id}>
                                        <td className="p-4">{scan.file_name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-2xl ${scan.infected ? 'text-red-800 bg-red-100' : 'text-green-800 bg-green-100'}`}>
                                                {scan.infected ? 'Infected' : 'Clean'}
                                            </span>
                                        </td>
                                        <td className="p-4">{scan.scan_time}</td>
                                        <td className="p-4">{scan.finish_time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PastScan;
