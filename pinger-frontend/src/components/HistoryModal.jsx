import React, { useState, useEffect } from 'react';
import { getTargetHistory } from '../api/targets';

const HistoryModal = ({ isOpen, onClose, targetId, targetName }) => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // This effect runs whenever the modal is opened with a new targetId
    useEffect(() => {
        if (isOpen && targetId) {
            const fetchHistory = async () => {
                setLoading(true);
                setError('');
                try {
                    const response = await getTargetHistory(targetId);
                    setHistory(response.data);
                } catch (err) {
                    console.error('Delete failed:', err); // Error ko console mein log karein

                    setError('Failed to load history.');
                } finally {
                    setLoading(false);
                }
            };
            fetchHistory();
        }
    }, [isOpen, targetId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">History for: <span className="text-blue-400">{targetName}</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                </div>

                <div className="overflow-y-auto">
                    {loading && <p>Loading history...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {!loading && !error && (
                        history.length > 0 ? (
                            <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-gray-700">
                                    <tr>
                                        <th scope="col" className="px-4 py-3">Status</th>
                                        <th scope="col" className="px-4 py-3">Timestamp</th>
                                        <th scope="col" className="px-4 py-3">Response Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.map((ping) => (
                                        <tr key={ping._id} className="border-b border-gray-700">
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ping.status === 'UP' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {ping.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {new Date(ping.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                {ping.responseTime}ms
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-center py-8">No history found for this target.</p>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryModal;