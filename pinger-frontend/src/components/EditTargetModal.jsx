import React, { useState, useEffect } from 'react';
import { updateTarget } from '../api/targets';

const EditTargetModal = ({ isOpen, onClose, target, onTargetUpdated }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    // States for our smart scheduler
    const [scheduleType, setScheduleType] = useState('minutes');
    const [scheduleValue, setScheduleValue] = useState('15');
    const [cronSchedule, setCronSchedule] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // EFFECT 1: When the modal opens, parse the existing cron string to set the form state
    useEffect(() => {
        if (target) {
            setName(target.name);
            setUrl(target.url);
            setCronSchedule(target.cronSchedule);

            // Logic to deconstruct the cron string
            const cron = target.cronSchedule;
            if (cron.startsWith('*/')) {
                setScheduleType('minutes');
                setScheduleValue(cron.split(' ')[0].replace('*/', ''));
            } else if (cron.startsWith('0 */')) {
                setScheduleType('hours');
                setScheduleValue(cron.split(' ')[1].replace('*/', ''));
            } else {
                // For 'Exact Time' or custom cron strings, we can't easily make a date object.
                // We'll treat it as a custom input for now.
                setScheduleType('custom');
                setScheduleValue(cron); // The value is the full cron string
            }
        }
    }, [target]);

    // EFFECT 2: Regenerate the final cron string whenever the user changes the inputs
    useEffect(() => {
        if (scheduleType === 'minutes') {
            setCronSchedule(`*/${scheduleValue} * * * *`);
        } else if (scheduleType === 'hours') {
            setCronSchedule(`0 */${scheduleValue} * * *`);
        } else if (scheduleType === 'custom') {
            setCronSchedule(scheduleValue);
        }
    }, [scheduleType, scheduleValue]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await updateTarget(target._id, { name, url, cronSchedule });
            onTargetUpdated(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update target.');
        } finally {
            setLoading(false);
        }
    };

    const renderScheduleInputs = () => {
        // ... (This function is the same as in AddTargetForm)
        switch (scheduleType) {
            case 'minutes':
                return <select value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style">{/* ... options */}<option value="5">Every 5 Minutes</option><option value="10">Every 10 Minutes</option><option value="15">Every 15 Minutes</option><option value="30">Every 30 Minutes</option><option value="59">Every 59 Minutes</option></select>;
            case 'hours':
                return <select value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style">{[...Array(24).keys()].map(i => (<option key={i + 1} value={i + 1}>Every {i + 1} Hour(s)</option>))}</select>;
            case 'custom':
                return <input type="text" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style" required />;
            default: return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Edit Target</h2>
                <form onSubmit={handleSubmit}>
                    {/* Name and URL inputs */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-style" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">URL</label>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="input-style" required />
                    </div>

                    {/* Smart Schedule Inputs */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Schedule</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)} className="input-style">
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="custom">Custom/Exact</option>
                            </select>
                            {renderScheduleInputs()}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Generated Cron: <code className="bg-gray-700 p-1 rounded">{cronSchedule}</code></p>
                    </div>

                    {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

                    <div className="flex justify-end gap-4 mt-6">
                        <button type="button" onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-md">Cancel</button>
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Target'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTargetModal;