import React, { useState, useEffect } from 'react';
import { updateTarget } from '../api/targets';
import CustomDropdown from './ui/CustomDropdown';
import { isValidCron } from 'cron-validator';
import CustomDateTimePicker from './ui/CustomDateTimePicker';

const EditTargetModal = ({ isOpen, onClose, target, onTargetUpdated }) => {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [scheduleType, setScheduleType] = useState('minutes');
    const [scheduleValue, setScheduleValue] = useState('');
    const [cronSchedule, setCronSchedule] = useState('');
    const [scheduleDescription, setScheduleDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const scheduleOptionsMinutes = [
        { value: "5", label: "Every 5 Minutes" }, { value: "10", label: "Every 10 Minutes" },
        { value: "15", label: "Every 15 Minutes" }, { value: "30", label: "Every 30 Minutes" },
        { value: "59", label: "Every 59 Minutes" },
    ];
    const scheduleOptionsHours = [...Array(24).keys()].map(i => ({ value: (i + 1).toString(), label: `Every ${i + 1} Hour(s)` }));
    const selectRepeatnessType = [
        { value: "minutes", label: "Minutes" }, { value: "hours", label: "Hours" },
        { value: "exact", label: "Exact Time" }, { value: "custom", label: "Custom Cron" }
    ];

    useEffect(() => {
        if (target) {
            setName(target.name);
            setUrl(target.url);
            const cronStr = target.cronSchedule;
            const parts = cronStr.split(' ');
            if (cronStr.startsWith('*/')) {
                setScheduleType('minutes');
                setScheduleValue(cronStr.split(' ')[0].replace('*/', ''));
            } else if (cronStr.startsWith('0 */')) {
                setScheduleType('hours');
                setScheduleValue(cronStr.split(' ')[1].replace('*/', ''));
            } else if (parts.length === 5 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1])) && !isNaN(parseInt(parts[2])) && !isNaN(parseInt(parts[3]))) {
                setScheduleType('exact');
                const [minute, hour, day, month] = parts.map(Number);
                const tempDate = new Date();
                tempDate.setMonth(month - 1, day);
                tempDate.setHours(hour, minute, 0, 0);
                setScheduleValue(tempDate.toISOString().slice(0, 16));
            } else {
                setScheduleType('custom');
                setScheduleValue(cronStr);
            }
        }
    }, [target]);

    useEffect(() => {
        let newCron = '', newDescription = '';
        if (scheduleType === 'minutes') { newCron = `*/${scheduleValue} * * * *`; newDescription = `Every ${scheduleValue} minutes`; }
        else if (scheduleType === 'hours') { newCron = `0 */${scheduleValue} * * *`; newDescription = `Every ${scheduleValue} hour(s)`; }
        else if (scheduleType === 'exact') { if (scheduleValue) { const date = new Date(scheduleValue); newCron = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`; newDescription = `At ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${date.toLocaleDateString()}`; } }
        else if (scheduleType === 'custom') { newCron = scheduleValue; newDescription = `Custom: ${scheduleValue}`; }
        setCronSchedule(newCron); setScheduleDescription(newDescription);
    }, [scheduleType, scheduleValue]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (scheduleType === 'custom' && !isValidCron(cronSchedule)) {
            setError('Invalid Custom Cron format. Please use the standard 5-part syntax (e.g., "* * * * *").');
            return;
        }
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start z-40 p-4 pt-20 overflow-y-auto">
            <div className='border border-purple-500 rounded-2xl w-full max-w-3xl bg-purple-600'>
                <div className='m-0.5 p-10 md:p-16 border border-purple-500 rounded-2xl bg-purple-50'>
                    <h2 className="text-3xl font-semibold text-purple-500 mb-6">Edit Target</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='flex flex-col md:flex-row gap-4 md:gap-10 mt-4'>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Friendly Name" className='placeholder-gray-800 border-purple-500 mt-8 mb-8 focus:border-purple-700 border-2 rounded-lg w-full h-10 pl-2 text-md focus:outline-none' required />
                            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL" className='placeholder-gray-800 border-purple-500 mt-8 mb-8 focus:border-purple-700 border-2 rounded-lg w-full h-10 pl-2 text-md focus:outline-none' required />
                        </div>
                        <div className='flex flex-col md:flex-row gap-4 md:gap-10'>
                            <CustomDropdown
                                options={selectRepeatnessType}
                                defaultValue={scheduleType.charAt(0).toUpperCase() + scheduleType.slice(1)}
                                onChange={(val) => { setScheduleValue(''); setScheduleType(val); }}
                            />
                            <div className="w-full">
                                {scheduleType === 'minutes' && <CustomDropdown options={scheduleOptionsMinutes} defaultValue={`Every ${scheduleValue} Minutes`} onChange={(val) => setScheduleValue(val)} />}
                                {scheduleType === 'hours' && <CustomDropdown options={scheduleOptionsHours} defaultValue={`Every ${scheduleValue} Hour(s)`} onChange={(val) => setScheduleValue(val)} />}
                                {scheduleType === 'exact' && <CustomDateTimePicker value={scheduleValue} onChange={(val) => setScheduleValue(val)} isEditMode={true} layout="horizontal" />}
                                {scheduleType === 'custom' && <input type="text" value={scheduleValue} onChange={(e) => setScheduleValue(e.target.value)} className='border-purple-500 mt-8 focus:border-purple-700 border-2 rounded-lg w-full h-10 px-2 text-md focus:outline-none' placeholder='* * * * *' required />}
                            </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-4 mb-4 h-4">{scheduleDescription && <span>Schedule: <span className="font-semibold text-gray-600">{scheduleDescription}</span></span>}</div>
                        {scheduleType === 'exact' && (
                            <CustomDateTimePicker
                                value={scheduleValue}
                                onChange={(val) => setScheduleValue(val)}
                                isEditMode={true}
                                layout="horizontal" // <-- Make sure this prop is here
                            />
                        )}
                        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                        <div className="flex justify-end gap-4 mt-8">
                            <button type="button" onClick={onClose} className='hover:cursor-pointer h-12 text-lg transition-all duration-200 ease-in-out border-2 border-gray-400 hover:border-gray-500 text-gray-600 hover:text-white font-sans bg-gray-200 hover:bg-gray-500 rounded-lg px-6' style={{ fontWeight: '600' }}>Cancel</button>
                            <button type="submit" className='hover:cursor-pointer h-12 text-lg transition-all duration-200 ease-in-out border-2 border-purple-600 hover:border-purple-300 text-purple-600 hover:text-white font-sans bg-purple-200 hover:bg-purple-600 rounded-lg px-6' style={{ fontWeight: '600' }} disabled={loading}>
                                {loading ? 'Updating...' : 'Update Target'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTargetModal;