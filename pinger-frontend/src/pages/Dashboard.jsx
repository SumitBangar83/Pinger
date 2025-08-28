import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { getTargets, deleteTarget, getTargetHistory, createTarget } from "../api/targets";
import EditTargetModal from "../components/EditTargetModal";
import logo from "../assets/neverNap.png";
import CustomDropdown from "../components/ui/CustomDropdown";
import CustomDateTimePicker from "../components/ui/CustomDateTimePicker";
import '../components/css/Dashboard.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Dot } from 'recharts';
import { Edit, Trash2 } from 'lucide-react';
import '../components/css/Dashboard.css';
const parseCronToString = (cron) => {
  if (!cron) return '';
  const parts = cron.split(' ');
  if (cron.startsWith('*/')) {
    return `Every ${cron.split(' ')[0].replace('*/', '')} minutes`;
  }
  if (cron.startsWith('0 */')) {
    return `Every ${cron.split(' ')[1].replace('*/', '')} hour(s)`;
  }
  if (parts.length === 5 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1])) && !isNaN(parseInt(parts[2])) && !isNaN(parseInt(parts[3]))) {
    const [minute, hour, day, month] = parts.map(Number);
    const tempDate = new Date();
    tempDate.setMonth(month - 1, day);
    tempDate.setHours(hour, minute, 0, 0);
    return `At ${tempDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  return `Custom: ${cron}`;
};

const StatusIndicator = ({ status }) => {
  const statusConfig = {
    UP: { color: 'green', text: 'Up' },
    DOWN: { color: 'red', text: 'Down' },
    PENDING: { color: 'yellow', text: 'Pending' }
  };
  const config = statusConfig[status] || statusConfig.PENDING;
  const colorClass = `bg-${config.color}-500`;
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2.5 h-2.5 rounded-full ${colorClass}`}></div>
      <span className="text-sm font-medium text-gray-600">{config.text}</span>
    </div>
  );
};

const CustomDot = (props) => {
  const { cx, cy, payload } = props;
  if (payload.success === true) {
    return <Dot cx={cx} cy={cy} r={4} fill="#22c55e" stroke="#16a34a" />;
  }
  return <Dot cx={cx} cy={cy} r={4} fill="#ef4444" stroke="#dc2626" />;
};

const Dashboard = () => {
  const { authUser, setAuthUser } = useAuth();
  const navigate = useNavigate();
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentTarget, setCurrentTarget] = useState(null);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [showHistoryChart, setShowHistoryChart] = useState(false);
  const [historyDays, setHistoryDays] = useState('7');
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [scheduleType, setScheduleType] = useState('minutes');
  const [scheduleValue, setScheduleValue] = useState('15');
  const [cronSchedule, setCronSchedule] = useState('*/15 * * * *');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('Every 15 minutes');

  const historyDayOptions = [
    { value: '1', label: 'Last 1 Day' }, { value: '3', label: 'Last 3 Days' },
    { value: '7', label: 'Last 7 Days' }, { value: '15', label: 'Last 15 Days' },
    { value: '30', label: 'Last 30 Days' },
  ];
  const scheduleOptionsMinutes = [
    { value: "5", label: "Every 5 Minutes" }, { value: "10", label: "Every 10 Minutes" },
    { value: "15", label: "Every 15 Minutes" }, { value: "30", label: "Every 30 Minutes" },
    { value: "59", label: "Every 59 Minutes" },
  ];
  const scheduleOptionsHours = [...Array(24).keys()].map(i => ({ value: (i + 1).toString(), label: `Every ${i + 1} Hour(s)` }));
  const selectRepeatnessType = [
    { value: "minutes", label: "Minutes" }, { value: "hours", label: "Hours" },
    { value: "exact", label: "Exact Time" },
  ];

  useEffect(() => {
    const fetchHistoryForTarget = async () => {
      if (selectedTarget) {
        setIsHistoryLoading(true);
        setHistoryData([]);
        try {
          const response = await getTargetHistory(selectedTarget._id, historyDays);
          setHistoryData(response.data);
        } catch (err) { console.error("Failed to fetch history", err); }
        finally { setIsHistoryLoading(false); }
      }
    };
    fetchHistoryForTarget();
  }, [selectedTarget, historyDays]);

  useEffect(() => {
    const fetchTargets = async () => { try { setLoading(true); const response = await getTargets(); setTargets(response.data); } catch (err) { setError('Failed to fetch targets.'); } finally { setLoading(false); } };
    fetchTargets();
  }, []);

  useEffect(() => {
    let newCron = ''; let newDescription = '';
    if (scheduleType === 'minutes') { newCron = `*/${scheduleValue} * * * *`; newDescription = `Every ${scheduleValue} minutes`; }
    else if (scheduleType === 'hours') { newCron = `0 */${scheduleValue} * * *`; newDescription = `Every ${scheduleValue} hour(s)`; }
    else if (scheduleType === 'exact') { if (scheduleValue) { const date = new Date(scheduleValue); newCron = `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`; newDescription = `At ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} on ${date.toLocaleDateString()}`; } }
    setCronSchedule(newCron); setScheduleDescription(newDescription);
  }, [scheduleType, scheduleValue]);

  const handleLogout = () => { setAuthUser(null); localStorage.removeItem('pinger-user'); navigate('/login'); };
  const handleTargetAdded = (newTarget) => { setTargets((prev) => [...prev, newTarget]); };
  const handleDelete = async (targetId) => { if (window.confirm('Are you sure you want to delete this target?')) { try { await deleteTarget(targetId); setTargets((prev) => prev.filter((t) => t._id !== targetId)); if (selectedTarget?._id === targetId) setSelectedTarget(null); } catch (err) { console.error('Delete failed:', err); alert('Failed to delete target.'); } } };
  const openEditModal = (target) => { setCurrentTarget(target); setIsEditModalOpen(true); };
  const handleTargetUpdated = (updatedTarget) => { setTargets((prev) => prev.map((t) => (t._id === updatedTarget._id ? updatedTarget : t))); if (selectedTarget?._id === updatedTarget._id) setSelectedTarget(updatedTarget); };
  const handleSelectTarget = (target) => { setShowHistoryChart(false); setSelectedTarget(target); };
  const handleSubmit = async (e) => {
    e.preventDefault(); setFormLoading(true); setFormError('');
    try {
      const response = await createTarget({ name, url, cronSchedule });
      handleTargetAdded(response.data);
      setName(''); setUrl('');
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create target.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className='bg-[#b792e2] min-h-screen text-gray-800'>
      <div className='Navbar'>
        <div className='portfolio'>
          <img src={logo} alt="NeverNap Logo" className="h-10 w-10 rounded-lg" />
          <div className='flex items-center text-xl font-medium'>
            <Link to="/">NeverNap</Link>
          </div>
        </div>
        <div className='components'>
          <div className='text-right'>
            <h6 className='text-sm font-semibold'>{authUser?.user?.username}</h6>
            <h6 className='text-xs'>{authUser?.user?.email}</h6>
          </div>
          <div>
            <button onClick={handleLogout} className='hover:cursor-pointer h-9 transition-all duration-200 ease-in-out border-2 border-purple-400 hover:border-purple-300 bg-purple-200 text-purple-950 hover:text-white font-sans hover:bg-purple-600 rounded-lg w-24' style={{ fontWeight: '500' }}>Logout</button>
          </div>
        </div>
        <div className='menubar'><i className="fa-solid fa-bars"></i></div>
      </div>

      <div className="p-4 md:p-8">
        <div className='flex justify-center'>
          <div className='border border-purple-500 rounded-2xl w-full max-w-5xl my-10 bg-purple-600'>
            <div className='m-0.5 p-10 md:p-16 border border-purple-500 rounded-2xl bg-purple-50'>
              <h6 className='text-3xl font-semibold text-purple-500'>Add a new Target</h6>
              <form onSubmit={handleSubmit}>
                <div className='flex flex-col md:flex-row gap-4 md:gap-10 mt-4'>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text" placeholder='Friendly Name (e.g., My API)' className='placeholder-gray-800 border-purple-500 mt-8 mb-8 focus:border-purple-700 border-2 rounded-lg w-full h-10 pl-2 text-md focus:outline-none' required />
                  <input value={url} onChange={(e) => setUrl(e.target.value)} type="url" placeholder='https://example.com/health' className='placeholder-gray-800 border-purple-500 mt-8  focus:border-purple-700 border-2 rounded-lg w-full h-10 pl-2 text-md focus:outline-none' required />
                </div>
                <div className='flex flex-col md:flex-row gap-4 md:gap-10'>
                  <CustomDropdown options={selectRepeatnessType} defaultValue="Minutes" onChange={(val) => { setScheduleType(val); setScheduleValue(val === 'minutes' ? '15' : ''); }} />
                  <div className="w-full">
                    {scheduleType === 'minutes' && <CustomDropdown options={scheduleOptionsMinutes} defaultValue="Every 15 Minutes" onChange={(val) => setScheduleValue(val)} />}
                    {scheduleType === 'hours' && <CustomDropdown options={scheduleOptionsHours} defaultValue="Every 1 Hour(s)" onChange={(val) => setScheduleValue(val)} />}
                    {scheduleType === 'exact' && <CustomDateTimePicker onChange={(val) => setScheduleValue(val)} />}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-4 mb-4 h-4">{scheduleDescription && <span>Schedule: <span className="font-semibold text-gray-600">{scheduleDescription}</span></span>}</div>
                <div className='mt-10'>
                  <button type="submit" disabled={formLoading} className='hover:cursor-pointer h-12 text-lg transition-all duration-200 ease-in-out border-2 border-purple-600 hover:border-purple-300 text-purple-600 hover:text-white font-sans bg-purple-200 hover:bg-purple-600 rounded-lg w-full' style={{ fontWeight: '600' }}>
                    {formLoading ? 'Adding...' : 'Add Target'}
                  </button>
                  {formError && <p className="text-red-500 text-sm text-center mt-2">{formError}</p>}
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto text-gray-800 mt-12">
          <section>
            <h2 className="text-3xl font-semibold mb-6 text-purple-900">Your Monitored Targets</h2>
            {!loading && !error && (
              targets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {targets.map((target) => {
                    const ringClass = selectedTarget?._id === target._id ? "ring-2 ring-purple-600" : target.status === "DOWN" ? "ring-2 ring-orange-500" : "ring-1 ring-purple-300";
                    return (
                      <div key={target._id} onClick={() => handleSelectTarget(target)} className={`bg-white/70 backdrop-blur-sm rounded-xl shadow-lg flex flex-col justify-between transition-all duration-300 cursor-pointer hover:shadow-purple-400/50 hover:-translate-y-1 ${ringClass}`}>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-3"><h3 className="text-lg font-bold text-purple-900 pr-2">{target.name}</h3><StatusIndicator status={target.status} /></div>
                          <p className="text-sm text-gray-500 break-all">{target.url}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-purple-200 flex justify-between items-center px-5 pb-4">
                          <p className="text-sm text-gray-600 font-medium">{parseCronToString(target.cronSchedule)}</p>
                          <div className="flex items-center gap-1">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(target); }} className="p-2 text-gray-500 hover:text-purple-700 hover:bg-purple-100 rounded-full transition-colors z-10"><Edit size={16} /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(target._id); }} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors z-10"><Trash2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (<div className="text-center py-12 bg-purple-100/50 rounded-xl shadow-lg"><p className="text-lg text-purple-800 font-semibold">🚀 You haven't added any targets yet.</p><p className="text-sm text-purple-700 mt-2">Use the form above to get started!</p></div>)
            )}
          </section>

          {selectedTarget && (
            <section className="mt-12">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-3xl font-semibold text-purple-900">History for: <span className="text-purple-700">{selectedTarget.name}</span></h2>
                <div className="flex items-center gap-4">
                  <CustomDropdown options={historyDayOptions} defaultValue="Last 7 Days" onChange={(val) => setHistoryDays(val)} width="180px" />
                  <button onClick={() => setShowHistoryChart(!showHistoryChart)} className="hover:cursor-pointer h-10 text-sm transition-all duration-200 ease-in-out border-2 border-purple-500 hover:border-purple-300 text-purple-600 hover:text-white font-sans bg-purple-100 hover:bg-purple-500 rounded-lg px-4">
                    {showHistoryChart ? 'Hide Chart' : 'Show Chart'}
                  </button>
                </div>
              </div>

              {showHistoryChart && (
                <div className="bg-purple-50 rounded-lg shadow-lg mb-6 p-4">
                  {isHistoryLoading ? <p className="text-center p-4">Loading chart...</p> : historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={historyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#c4b5fd" />
                        <XAxis dataKey="createdAt" tickFormatter={(t) => new Date(t).toLocaleTimeString()} stroke="#581c87" />
                        <YAxis stroke="#581c87" />
                        <Tooltip contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #a78bfa', borderRadius: '0.5rem' }} labelFormatter={(l) => new Date(l).toLocaleString()} />
                        <Line type="monotone" dataKey="responseTime" name="Response Time (ms)" stroke="#7c3aed" strokeWidth={2} dot={<CustomDot />} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (<p className="text-center p-4">Not enough data to display chart.</p>)}
                </div>
              )}

              <div className="bg-purple-50 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {isHistoryLoading ? <p className="p-6 text-center">Loading history...</p> : (
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-purple-200 sticky top-0"><tr><th scope="col" className="px-6 py-3">Timestamp</th><th scope="col" className="px-6 py-3">Response Time (ms)</th><th scope="col" className="px-6 py-3">Success</th><th scope="col" className="px-6 py-3">Status</th></tr></thead>
                    <tbody>
                      {historyData.length > 0 ? historyData.map((ping) => (
                        <tr key={ping._id} className="border-b border-purple-200 hover:bg-purple-100">
                          <td className="px-6 py-4">{new Date(ping.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4">{ping.responseTime}</td>
                          <td className="px-6 py-4 font-semibold">{ping.success === true ? (<span className="text-green-600">True</span>) : (<span className="text-red-600">False</span>)}</td>
                          <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${ping.status === 'UP' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{ping.status}</span></td>
                        </tr>
                      )) : <tr><td colSpan="4" className="text-center p-6">No history found for this target.</td></tr>}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </div>
      </div>

      <EditTargetModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} target={currentTarget} onTargetUpdated={handleTargetUpdated} />
    </div>
  );
};

export default Dashboard;