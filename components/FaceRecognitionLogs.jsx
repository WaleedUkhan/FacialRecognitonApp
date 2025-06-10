'use client'
import React, { useEffect, useState } from "react";

export default function FaceRecognitionLogs() {
  const [faceData, setFaceData] = useState([]);
  const [message, setMessage] = useState({});
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'rejected'

  useEffect(() => {
    fetchFaceRecognitionLogs();
  }, [filter])
  
  const fetchFaceRecognitionLogs = async () => {
    try {
      // Fetch face recognition logs based on filter
      const url = filter === 'all' 
        ? '/api/admin/confirmations?type=faceRecognition&status=all'
        : `/api/admin/confirmations?type=faceRecognition&status=${filter}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      setFaceData(data.data || []);
    } catch (error) {
      console.error('Error fetching face recognition logs:', error);
      setMessage({ type: 'error', text: 'Failed to fetch face recognition logs' });
    }
  };

  const handleConfirm = async (user_id, date) => {
    try {
      const res = await fetch('/api/admin/confirmations',{
        method : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          user_id,
          status: 'approved',
          type: 'faceRecognition'
        })
      })
      const response = await res.json()
      
      if(res.ok){
        setFaceData(prevData => prevData.filter(item => !((item.user_id == user_id) && (item.date == date))));
        setMessage({ type: 'success', text: 'Attendance Confirmed Successfully.'})

        setTimeout(() => {
          setMessage({})
        }, 2500);
        
        // Refresh the list after action
        fetchFaceRecognitionLogs();
      } else
        throw response.message;

    } catch (error) {
      console.log('Error updating face recognition log:', error)
      setMessage({ type: 'error', text: error})

      setTimeout(() => {
        setMessage({})
      }, 2500);
    }
  };

  const handleReject = async (user_id, date) => {
    try {
      const res = await fetch('/api/admin/confirmations',{
        method : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date,
          user_id,
          status: 'rejected',
          type: 'faceRecognition'
        })
      })
      const response = await res.json()
      
      if(res.ok){
        setFaceData(prevData => prevData.filter(item => !((item.user_id == user_id) && (item.date == date))));
        setMessage({ type: 'success', text: 'Attendance Rejected.'})

        setTimeout(() => {
          setMessage({})
        }, 2500);
        
        // Refresh the list after action
        fetchFaceRecognitionLogs();
      } else
        throw response.message;

    } catch (error) {
      console.log('Error updating face recognition log:', error)
      setMessage({ type: 'error', text: error})

      setTimeout(() => {
        setMessage({})
      }, 2500);
    }
  };

  return (
    <div className="overflow-x-auto p-2">
      {message && message.text && (
        <p className={`mb-4 ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
          {message.text}
        </p>
      )}

      <div className="mb-4">
        <button 
          className={`px-4 py-2 mr-2 ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          onClick={() => setFilter('all')}
        >
          All Logs
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${filter === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          onClick={() => setFilter('pending')}
        >
          Pending
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${filter === 'approved' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`px-4 py-2 ${filter === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200'} rounded`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
        </button>
      </div>

      <table className="min-w-[75vw] bg-white shadow-[0_4px_20px_#080f341a] rounded-lg">
        <thead>
          <tr className="text-left font-semibold text-gray-700">
            <th className="px-6 py-3">Date</th>
            <th className="px-6 py-3">Student Name</th>
            <th className="px-6 py-3">Confidence Score</th>
            <th className="px-6 py-3">Status</th>
            <th className="px-6 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {faceData && faceData.length > 0 ? (
            faceData.map((log, key) => (
              <tr key={key} className="border-t hover:bg-gray-50">
                <td className="px-6 py-2 text-gray-600">{log.date}</td>
                <td className="px-6 py-2 text-gray-800">{log.name}</td>
                <td className="px-6 py-2 text-gray-600">{(log.confidence_score * 100).toFixed(2)}%</td>
                <td className="px-6 py-2 text-gray-600">
                  <span className={`px-2 py-1 rounded ${log.status === 'approved' ? 'bg-green-100 text-green-800' : log.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-2">
                  {log.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleConfirm(log.user_id, log.date)}
                        className="px-4 mr-2 bg-green-500 text-white rounded-lg transition-transform duration-300 hover:bg-green-600 focus:outline-none"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(log.user_id, log.date)}
                        className="px-4 bg-red-500 text-white rounded-lg transition-transform duration-300 hover:bg-red-600 focus:outline-none"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-6 py-4 text-center">
                No face recognition logs available
              </td>
            </tr>
          )}  
        </tbody>
      </table>
    </div>
  );
}