import React, { useState, useRef, useEffect } from "react";
import "../css/customdatetime.css";

const CustomDateTimePicker = ({ value, onChange, isEditMode = false, layout = 'vertical' }) => {
    // All internal logic and state remains the same
    const initialDate = value ? new Date(value) : new Date(Date.now() + 120000);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(initialDate);
    const [displayMonth, setDisplayMonth] = useState(initialDate.getMonth());
    const [displayYear, setDisplayYear] = useState(initialDate.getFullYear());
    const [useCustomTime, setUseCustomTime] = useState(isEditMode);
    const [customHour, setCustomHour] = useState(initialDate.getHours() % 12 || 12);
    const [customMinute, setCustomMinute] = useState(initialDate.getMinutes());
    const [customAmPm, setCustomAmPm] = useState(initialDate.getHours() >= 12 ? 'PM' : 'AM');
    const pickerRef = useRef(null);

    // All functions (useEffect, handlers) remain the same
    useEffect(() => {
        const newDate = value ? new Date(value) : new Date(Date.now() + 120000);
        setSelectedDate(newDate);
        setDisplayMonth(newDate.getMonth());
        setDisplayYear(newDate.getFullYear());
        setCustomHour(newDate.getHours() % 12 || 12);
        setCustomMinute(newDate.getMinutes());
        setCustomAmPm(newDate.getHours() >= 12 ? 'PM' : 'AM');
    }, [value, isOpen]);
    useEffect(() => {
        const handleClickOutside = (event) => { if (pickerRef.current && !pickerRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const updateParentState = (date) => { if (onChange) { onChange(date.toISOString().slice(0, 16)); } };
    const handleDateSelect = (day) => { const newDate = new Date(selectedDate); newDate.setFullYear(displayYear, displayMonth, day); setSelectedDate(newDate); updateParentState(newDate); };
    const handleTimeSelect = (timeString) => { const [time, period] = timeString.split(' '); let [hours, minutes] = time.split(':').map(Number); if (period === 'PM' && hours < 12) hours += 12; if (period === 'AM' && hours === 12) hours = 0; const newDate = new Date(selectedDate); newDate.setHours(hours, minutes); setSelectedDate(newDate); updateParentState(newDate); setIsOpen(false); };
    const handleSetCustomTime = () => { let newHour24 = customHour; if (customAmPm === 'PM' && newHour24 < 12) newHour24 += 12; if (customAmPm === 'AM' && newHour24 === 12) newHour24 = 0; const newDate = new Date(selectedDate); newDate.setHours(newHour24, customMinute); setSelectedDate(newDate); updateParentState(newDate); setIsOpen(false); };
    const daysInMonth = new Date(displayYear, displayMonth + 1, 0).getDate();
    const startDayOfMonth = new Date(displayYear, displayMonth, 1).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
        <div ref={pickerRef} className="relative w-full">
            <div className="border-2 border-purple-500 rounded-lg h-10 px-3 flex items-center justify-between cursor-pointer text-md text-gray-800 hover:border-purple-700 bg-white" onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedDate.toLocaleString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                <svg className={`w-5 h-5 transform transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>

            {isOpen && (
                <div className="absolute top-12 left-0 w-auto bg-white border-2 border-purple-500 rounded-lg shadow-md z-50 p-4">
                    {/* THIS IS THE MAIN LAYOUT FIX */}
                    <div className={layout === 'horizontal' ? 'flex gap-4' : ''}>

                        {/* Calendar */}
                        <div className="w-64 flex-shrink-0">
                            <div className="flex justify-between items-center mb-2">
                                <button type="button" onClick={() => setDisplayMonth(displayMonth - 1)} className="px-2 py-1 bg-purple-200 rounded text-purple-800">◀</button>
                                <h3 className="text-center font-semibold text-purple-800">{new Date(displayYear, displayMonth).toLocaleString("default", { month: "long" })}, {displayYear}</h3>
                                <button type="button" onClick={() => setDisplayMonth(displayMonth + 1)} className="px-2 py-1 bg-purple-200 rounded text-purple-800">▶</button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-800">
                                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => <div key={d} className="font-medium text-gray-600">{d}</div>)}
                                {Array.from({ length: startDayOfMonth }).map((_, i) => <div key={`e-${i}`}></div>)}
                                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                                    const date = new Date(displayYear, displayMonth, day);
                                    const isPast = date < today;
                                    const isSelected = selectedDate.toDateString() === date.toDateString();
                                    return (<div key={day} onClick={() => !isPast && handleDateSelect(day)} className={`py-1 rounded-md ${isPast ? 'text-gray-400' : isSelected ? 'bg-purple-500 text-white' : 'cursor-pointer hover:bg-purple-100'}`}>{day}</div>);
                                })}
                            </div>
                        </div>

                        {/* Time Selector */}
                        <div className={layout === 'horizontal' ? 'pl-4 border-l border-purple-200' : 'mt-4 pt-3 border-t border-purple-200'}>
                            {!isEditMode && (
                                <>
                                    <div className="flex items-center gap-2 mb-3">
                                        <input type="checkbox" id="customTime" checked={useCustomTime} onChange={() => setUseCustomTime(!useCustomTime)} />
                                        <label htmlFor="customTime" className="font-semibold text-gray-700">Use Custom Time</label>
                                    </div>
                                    {!useCustomTime && (
                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            {["10:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM", "08:00 PM"].map(time => (
                                                <div key={time} onClick={() => handleTimeSelect(time)} className={`cursor-pointer rounded-md py-1 text-xs ${selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) === time ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'}`}>{time}</div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                            {(useCustomTime || isEditMode) && (
                                <div className="mt-2">
                                    <h4 className="text-center font-semibold mb-2 text-gray-700">{isEditMode ? 'Update Time' : 'Choose Custom Time'}</h4>
                                    <div className="flex justify-center gap-2 text-gray-700">
                                        <div className="h-32 overflow-y-auto border rounded p-1 w-20 text-center no-scrollbar">
                                            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (<div key={h} onClick={() => setCustomHour(h)} className={`cursor-pointer py-1 rounded ${customHour === h ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'}`}>{h}</div>))}
                                        </div>
                                        <div className="h-32 overflow-y-auto border rounded p-1 w-20 text-center no-scrollbar">
                                            {Array.from({ length: 60 }, (_, i) => i).map((m) => (<div key={m} onClick={() => setCustomMinute(m)} className={`cursor-pointer py-1 rounded ${customMinute === m ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'}`}>{String(m).padStart(2, '0')}</div>))}
                                        </div>
                                        <div className="h-32 overflow-y-auto border rounded p-1 w-20 text-center no-scrollbar">
                                            {["AM", "PM"].map((ap) => (<div key={ap} onClick={() => setCustomAmPm(ap)} className={`cursor-pointer py-1 rounded ${customAmPm === ap ? 'bg-purple-500 text-white' : 'hover:bg-purple-100'}`}>{ap}</div>))}
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleSetCustomTime} className="mt-3 w-full bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition">
                                        Set Custom Time
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDateTimePicker;