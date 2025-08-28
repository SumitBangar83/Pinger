import React, { useState, useRef, useEffect } from "react";

const CustomDropdown = ({ options = [], defaultValue, onChange, width = "100%" }) => {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState(defaultValue || (options.length > 0 ? options[0].label : ""));

    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Update selected state if default value changes
    useEffect(() => {
        setSelected(defaultValue || (options.length > 0 ? options[0].label : ""));
    }, [defaultValue, options]);

    const handleSelect = (opt) => {
        setSelected(opt.label);
        setOpen(false);
        if (onChange) onChange(opt.value);
    };

    return (
        <div ref={dropdownRef} className="relative" style={{ width }}>
            <div
                className="border-2 border-purple-500 rounded-lg h-10 px-3 flex items-center justify-between cursor-pointer text-md text-gray-800 hover:border-purple-700 focus-within:border-purple-700 bg-white"
                onClick={() => setOpen(!open)}
            >
                <span>{selected}</span>
                <svg className={`w-5 h-5 transform transition-transform ${open ? "rotate-180" : "rotate-0"}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            {open && (
                <div className="absolute top-12 left-0 w-full bg-white border-2 border-purple-500 rounded-lg shadow-md z-10">
                    {options.map((opt) => (
                        <div key={opt.value} className="px-3 py-2 cursor-pointer hover:bg-purple-100 rounded-md text-gray-800" onClick={() => handleSelect(opt)}>
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;