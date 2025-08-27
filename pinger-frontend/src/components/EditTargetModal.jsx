import React, { useState, useEffect } from 'react';
import { updateTarget } from '../api/targets';

const EditTargetModal = ({ isOpen, onClose, target, onTargetUpdated }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    
    const [scheduleType, setScheduleType] = useState('minutes');
    const [scheduleValue, setScheduleValue] = useState('');
    const [cronSchedule, setCronSchedule] = useState('');
    
    const [scheduleDescription, setScheduleDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (target) {
            setName(target.name);
            setUrl(target.url);
            
            const cron = target.cronSchedule;
            if (cron.startsWith('*/')) {
                setScheduleType('minutes');
                setScheduleValue(cron.split(' ')[0].replace('*/', ''));
            } else if (cron.startsWith('0 */')) {
                setScheduleType('hours');
                setScheduleValue(cron.split(' ')[1].replace('*/', ''));
            } else {
                setScheduleType('custom');
                setScheduleValue(cron);
            }
        }
    }, [target]);

    useEffect(() => {
        let newCron = '';
        let newDescription = '';
        
        if (scheduleType === 'minutes') {
            newCron = `*/${scheduleValue} * * * *`;
            newDescription = `Every ${scheduleValue} minutes`;
        } else if (scheduleType === 'hours') {
            newCron = `0 */${scheduleValue} * * *`;
            newDescription = `Every ${scheduleValue} hour(s)`;
        } else if (scheduleType === 'exact') {
            if (scheduleValue) {
                const date = new Date(scheduleValue);
                newCron = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
                newDescription = `At ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${date.toLocaleDateString()}`;
            }
        } else if (scheduleType === 'custom') {
            newCron = scheduleValue;
            newDescription = `Custom: ${scheduleValue}`;
        }
        setCronSchedule(newCron);
        setScheduleDescription(newDescription);
    }, [scheduleType, scheduleValue]);

    const getMinDateTime = () => {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 1);
        return now.toISOString().slice(0, 16);
    };

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
        switch (scheduleType) {
            case 'minutes':
                return <select value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style"><option value="5">Every 5 Minutes</option><option value="10">Every 10 Minutes</option><option value="15">Every 15 Minutes</option><option value="30">Every 30 Minutes</option><option value="59">Every 59 Minutes</option></select>;
            case 'hours':
                return <select value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className="input-style">{[...Array(24).keys()].map(i => (<option key={i + 1} value={i + 1}>Every {i + 1} Hour(s)</option>))}</select>;
            case 'exact':
                return <input type="datetime-local" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} min={getMinDateTime()} className="input-style" required />;
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-style" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">URL</label>
                        <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="input-style" required />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Schedule</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select value={scheduleType} onChange={(e) => { setScheduleValue(''); setScheduleType(e.target.value); }} className="input-style">
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="exact">Exact Time</option>
                                <option value="custom">Custom Cron</option>
                            </select>
                            {renderScheduleInputs()}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 h-4">
                            {scheduleDescription && <span>Schedule: <span className="font-semibold text-gray-400">{scheduleDescription}</span></span>}
                        </div>
                    </div>

                    {/* V V V YAHAN NAYA GUIDE ADD KIYA GAYA HAI V V V */}
                    {scheduleType === 'custom' && (
                        <div className="text-xs text-gray-500 bg-gray-900/50 p-3 rounded-md mb-4 border border-gray-700">
                            <h4 className="font-bold text-gray-400 mb-2">Cron Job Quick Guide</h4>
                            <p className="mb-1">Format: <code className="bg-gray-700 p-1 rounded">Minute Hour Day Month Day-of-Week</code></p>
                            <ul className="list-disc list-inside">
                                <li>Every minute: <code className="bg-gray-700 p-1 rounded">* * * * *</code></li>
                                <li>Every 15 minutes: <code className="bg-gray-700 p-1 rounded">*/15 * * * *</code></li>
                                <li>Every hour: <code className="bg-gray-700 p-1 rounded">0 * * * *</code></li>
                            </ul>
                        </div>
                    )}
                    {/* ^ ^ ^ YAHAN NAYA GUIDE ADD KIYA GAYA HAI ^ ^ ^ */}

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