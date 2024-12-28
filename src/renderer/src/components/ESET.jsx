/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUndo, FaTrash } from "react-icons/fa";

const ESET = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null); // State to track selected row
  const [hoveredRow, setHoveredRow] = useState(null); // State to track hovered row
  const tableRef = useRef(null); // Ref for the table
  const [vmState, setVMState] = useState("Loading...");
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [pendingRestore, setPendingRestore] = useState(null);
  const Backend_Server = "http://192.168.56.1:5004"; // Assuming the Flask server is running on port 5000

  // Fetch VM state from the backend
  const fetchVMState = async () => {
    try {
      const response = await axios.get(`${Backend_Server}/get_vm_state`, {
        params: { vm_name: "ESET" },
      });
      if (response.data.success) {
        setVMState(response.data.vm_state);
      } else {
        console.error("Failed to fetch VM state:", response.data.error);
      }
    } catch (error) {
      console.error("Error fetching VM state:", error);
    }
  };

  useEffect(() => {
    fetchVMState();
    const interval = setInterval(fetchVMState, 5000);
    return () => clearInterval(interval);
  }, []);

  const getVMStateStyle = () => {
    switch (vmState.toLowerCase()) {
      case "running":
        return { textColor: "text-green-700", indicatorColor: "bg-green-600" };
      case "starting":
        return { textColor: "text-yellow-600", indicatorColor: "bg-yellow-500" };
      case "power off":
        return { textColor: "text-red-600", indicatorColor: "bg-red-500" };
      default:
        return { textColor: "text-gray-500", indicatorColor: "bg-gray-400" };
    }
  };

  const { textColor, indicatorColor } = getVMStateStyle();

  // Fetch snapshots from the backend
  const fetchSnapshots = async () => {
    try {
      const response = await axios.get(`${Backend_Server}/get_snapshots`, {
        params: { vm_name: 'ESET' }, // Pass vm_name as a query parameter
      });
      if (response.data.success) {
        setSnapshots(response.data.snapshots);
      } else {
        alert(`Failed to fetch snapshots: ${response.data.error}`);
      }
    } catch (error) {
      console.error("Error fetching snapshots:", error);
      alert("Failed to fetch snapshots. Check backend logs.");
    }
  };

  // Create a new snapshot for VM1
  const createSnapshot = async () => {
    try {
      setLoading(true);
      console.log("Sending POST request to create snapshot...");

      // Create form data
      const formData = new FormData();
      formData.append('vm_name', 'ESET');

      const response = await axios.post(`${Backend_Server}/create_snapshot`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);

      if (response.data.success) {
        alert(`Snapshot Created: ${response.data.snapshot_name}`);
        fetchSnapshots(); // Refresh the log table after creating a snapshot
      } else {
        alert(`Failed to create snapshot: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error creating snapshot:", error);
      alert("Failed to create snapshot. Check backend logs.");
    } finally {
      setLoading(false);
    }
  };

  const deleteSnapshot = async (snapshotName, vmName) => {
    try {
      const response = await axios.post(`${Backend_Server}/delete_snapshot`, {
        snapshot_name: snapshotName,
        vm_name: vmName,
      });
  
      if (response.data.success) {
        alert(`Snapshot ${snapshotName} deleted successfully.`);
        fetchSnapshots(); // Refresh the table after deletion
      } else {
        alert(`Failed to delete snapshot: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error deleting snapshot:", error);
      alert("Failed to delete snapshot. Check backend logs.");
    }
  };

  const restoreSnapshot = async (snapshotName, vmName, index) => {
    if (vmState.toLowerCase() === "running") {
      setShowModal(true); // Show modal if VM is running
      setPendingRestore({ snapshotName, vmName, index });
    } else {
      proceedRestore(snapshotName, vmName, index);
    }
  };

  const proceedRestore = async (snapshotName, vmName, index) => {
    try {
      const response = await axios.post(`${Backend_Server}/restore_snapshot`, {
        snapshot_name: snapshotName,
        vm_name: vmName,
      });

      if (response.data.success) {
        alert(`Snapshot ${snapshotName} restored successfully.`);
        setSnapshots((prevSnapshots) =>
          prevSnapshots.map((snapshot, idx) =>
            idx === index ? { ...snapshot, restored: true } : snapshot
          )
        );
      } else {
        alert(`Failed to restore snapshot: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error restoring snapshot:", error);
      alert("Failed to restore snapshot. Check backend logs.");
    }
  };

  const powerOffVM = async () => {
    try {
      const response = await axios.post(`${Backend_Server}/power_off_vm`, {
        vm_name: "ESET",
      });
      if (response.data.success) {
        alert("VM powered off successfully.");
        setVMState("power off");
        setShowModal(false); // Close modal
        if (pendingRestore) {
          const { snapshotName, vmName, index } = pendingRestore;
          proceedRestore(snapshotName, vmName, index); // Restore after power off
          setPendingRestore(null);
        }
      } else {
        alert(`Failed to power off VM: ${response.data.message}`);
      }
    } catch (error) {
      console.error("Error powering off VM:", error);
      alert("Failed to power off VM. Check backend logs.");
    }
  };

  // Fetch snapshots on component mount
  useEffect(() => {
    fetchSnapshots();
  }, []);

  // Deselect row when clicking outside the table
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (tableRef.current && !tableRef.current.contains(event.target)) {
        setSelectedRow(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
      <div>
        {/* Header Bar */}
        <div
          className="fixed top-0 left-0 z-50 flex items-center px-4 py-2"
          style={{ width: 'calc(100% - 257px)', marginLeft: '257px' }}
        >
          <button
            onClick={onBack}
            className="ml-auto flex items-center space-x-2 bg-purple-700 text-white px-3 py-2 rounded-md hover:bg-purple-800 shadow-md"
          >
            <span className="text-lg font-bold">&larr;</span>
            <span>Back</span>
          </button>
        </div>

        <h1 className="text-purple-800 text-3xl font-semibold">ESET Client Backup</h1>
        <p className="text-gray-500 text-medium font-semibold mt-2">
          Manage snapshots (backups) for the ESET VM below.
        </p>

        <p className="text-medium font-semibold mt-4 flex items-center">
          <span className={'mr-2 text-purple-800 font-semibold'}>VM State:</span>
          <span className={`flex items-center ${textColor}`}>
            {vmState || "Loading..."}
            <span className={`ml-2 h-3 w-3 rounded-full animate-pulse ${indicatorColor}`}></span>
          </span>
        </p>

        <div className="border-b-2 mt-3" />
        <p className="text-xl font-semibold mt-4">
          Add a new snapshot for the ESET VM.
        </p>
        <button
          onClick={createSnapshot}
          disabled={loading}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 shadow-md"
        >
          {loading ? "Creating Snapshot..." : "+ Create Snapshot"}
        </button>

        {/* Log Table */}
        <div ref={tableRef} className="bg-gray-100 rounded-md mt-4 p-4 shadow-inner" style={{ boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.3)' }}>
          {snapshots.length > 0 ? (
            <table className="w-full text-left">
              {/* <thead>
                <tr>
                  <th className="px-5">VM Name</th>
                  <th className="px-5">Snapshot Name</th>
                  <th className="px-5">Description</th>
                  <th className="px-5">Created At</th>
                  <th className="px-5">Actions</th>
                </tr>
              </thead> */}
              <tbody>
                {snapshots.map((snapshot, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedRow(index)} // Set selected row on click
                    onMouseEnter={() => setHoveredRow(index)} // Track hovered row
                    onMouseLeave={() => setHoveredRow(null)} // Clear hover state
                    className={`cursor-pointer text-center border-gray-200 border-b-2 ${
                      selectedRow === index ? 'bg-blue-200' : 'hover:bg-blue-100'
                    }`}
                  >
                    <td className="text-purple-700 text-lg font-bold px-5 py-3">{snapshot.vm_name}</td>
                    <td className="px-4 py-3">{snapshot.snapshot_name}</td>
                    <td className="px-4 py-3">{snapshot.snapshot_description}</td>
                    <td className="px-4 py-3 flex items-center justify-center">
                      {snapshot.created_at}
                      {snapshot.restored && (
                        <span className="ml-2 text-green-500 font-bold">✔</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(selectedRow === index || hoveredRow === index) && (
                        <div className="flex space-x-2 justify-center">
                          <button
                            className="font-medium text-white text-sm px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700"
                            onClick={() => restoreSnapshot(snapshot.snapshot_name, snapshot.vm_name, index)}
                          >
                            <FaUndo />
                          </button>
                          <button
                            className="font-medium text-white text-sm px-3 py-1 rounded-lg bg-red-500 hover:bg-red-600"
                            onClick={() => deleteSnapshot(snapshot.snapshot_name, snapshot.vm_name)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-red-500 font-semibold">No Snapshots Found</p>
          )}
        </div>

        {/* Modal */}
        {showModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-red-600 font-semibold mb-4">
              Restore can only occur after the power is off.
            </p>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded-md mr-2"
              onClick={powerOffVM}
            >
              Power Off
            </button>
            <button
              className="bg-gray-300 text-black px-4 py-2 rounded-md"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ESET;