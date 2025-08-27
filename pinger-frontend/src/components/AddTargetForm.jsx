import React, { useState, useEffect } from 'react';
import { createTarget } from '../api/targets';

const AddTargetForm = ({ onTargetAdded }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  
  // States for our smart scheduler
  const [scheduleType, setScheduleType] = useState('minutes');
  const [scheduleValue, setScheduleValue] = useState('15');
  const [cronSchedule, setCronSchedule] = useState('*/15 * * * *');
  
  // 1. New state for the human-readable description
  const [scheduleDescription, setScheduleDescription] = useState('Every 15 minutes');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 2. useEffect hook is updated to generate the description
  useEffect(() => {
    let newCron = '';
    let newDescription = ''; // Variable to hold the new description

    if (scheduleType === 'minutes') {
      newCron = `*/${scheduleValue} * * * *`;
      newDescription = `Every ${scheduleValue} minutes`;
    } else if (scheduleType === 'hours') {
      newCron = `0 */${scheduleValue} * * *`;
      newDescription = `Every ${scheduleValue} hour(s)`;
    } else if (scheduleType === 'exact') {
      if (scheduleValue) {
        const date = new Date(scheduleValue);
        const minutes = date.getMinutes();
        const hours = date.getHours();
        const dayOfMonth = date.getDate();
        const month = date.getMonth() + 1;
        newCron = `${minutes} ${hours} ${dayOfMonth} ${month} *`;
        
        // Format the date into a nice string like "At 10:30 PM on 27/08/2025"
        newDescription = `At ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${date.toLocaleDateString()}`;
      }
    }
    setCronSchedule(newCron);
    setScheduleDescription(newDescription); // Set the new description state
  }, [scheduleType, scheduleValue]);

  // Function to get the minimum value for the datetime-local input
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1); // Set to 1 minute in the future
    return now.toISOString().slice(0, 16);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await createTarget({ name, url, cronSchedule });
      onTargetAdded(response.data);
      // Reset form fields
      setName('');
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create target.');
    } finally {
      setLoading(false);
    }
  };

  const renderScheduleInputs = () => {
    switch (scheduleType) {
      case 'minutes':
        return (
          <select id="scheduleValue" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style">
            <option value="5">Every 5 Minutes</option>
            <option value="10">Every 10 Minutes</option>
            <option value="15">Every 15 Minutes</option>
            <option value="30">Every 30 Minutes</option>
            <option value="59">Every 59 Minutes</option>
          </select>
        );
      case 'hours':
        return (
          <select id="scheduleValue" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style">
            {[...Array(24).keys()].map(i => (
              <option key={i + 1} value={i + 1}>Every {i + 1} Hour(s)</option>
            ))}
          </select>
        );
      case 'exact':
        return (
          <input
            type="datetime-local"
            id="scheduleValue"
            value={scheduleValue}
            onChange={(e) => setScheduleValue(e.target.value)}
            min={getMinDateTime()}
            className="input-style"
            required
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Add a New Target</h3>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-style" placeholder="Friendly Name (e.g., My API)" required />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="input-style" placeholder="https://example.com/health" required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <select id="scheduleType" value={scheduleType} onChange={(e) => setScheduleValue('15') || setScheduleType(e.target.value)} className="input-style">
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="exact">Exact Time</option>
          </select>
          {renderScheduleInputs()}
        </div>
        
        {/* 3. Update the JSX to show the new description */}
        <div className="text-xs text-gray-500 mb-4 h-4">
          {scheduleDescription && (
            <span>Schedule: <span className="font-semibold text-gray-400">{scheduleDescription}</span></span>
          )}
        </div>
        
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300 disabled:bg-gray-500" disabled={loading}>
          {loading ? 'Adding...' : 'Add Target'}
        </button>
      </form>
    </div>
  );
};

export default AddTargetForm;