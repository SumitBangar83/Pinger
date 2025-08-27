import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from 'react-router-dom';
import { getTargets, deleteTarget, getTargetHistory } from "../api/targets";
import AddTargetForm from "../components/AddTargetForm";
import EditTargetModal from "../components/EditTargetModal";
import logo from "../assets/neverNap.png";

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

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        setLoading(true);
        const response = await getTargets();
        setTargets(response.data);
      } catch (err) {
        setError("Failed to fetch targets.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTargets();
  }, []);

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem("pinger-user");
    navigate("/login");
  };

  const handleTargetAdded = (newTarget) => {
    setTargets((prev) => [...prev, newTarget]);
  };

  const handleDelete = async (targetId) => {
    if (window.confirm("Are you sure you want to delete this target?")) {
      try {
        await deleteTarget(targetId);
        setTargets((prev) => prev.filter((t) => t._id !== targetId));
        if (selectedTarget?._id === targetId) setSelectedTarget(null);
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete target.");
      }
    }
  };

  const openEditModal = (target) => {
    setCurrentTarget(target);
    setIsEditModalOpen(true);
  };

  const handleTargetUpdated = (updatedTarget) => {
    setTargets((prev) =>
      prev.map((t) => (t._id === updatedTarget._id ? updatedTarget : t))
    );
    if (selectedTarget?._id === updatedTarget._id)
      setSelectedTarget(updatedTarget);
  };

  const handleSelectTarget = async (target) => {
    setSelectedTarget(target);
    setIsHistoryLoading(true);
    setHistoryData([]);
    try {
      const response = await getTargetHistory(target._id);
      setHistoryData(response.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white font-sans">
      {/* HEADER */}
      <header className="bg-white/10 backdrop-blur-md sticky top-0 z-10 p-4 flex justify-between items-center border-b border-white/20 shadow-lg">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Pinger Logo" className="h-10 w-10 rounded-lg" />
          <h1 className="text-2xl font-bold tracking-wide">Pinger</h1>
          <Link to="/pinger" className="ml-20 hover:underline text-gray-800"><u>Pinger Page</u></Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-sm">{authUser?.user?.username}</p>
            <p className="text-xs text-gray-200">{authUser?.user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-pink-500 to-red-500 hover:opacity-90 text-white font-bold py-2 px-4 rounded-xl transition duration-300 shadow-md"
          >
            Logout
          </button>
        </div>
      </header>

      {/* MAIN */}
      <main className="p-6 md:p-10">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Add Target Form */}
          <section className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl">
            <AddTargetForm onTargetAdded={handleTargetAdded} />
          </section>

          {/* Targets */}
          <section>
            <h2 className="text-3xl font-bold mb-6">Your Monitored Targets</h2>

            {!loading && !error && (
              targets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {targets.map((target) => (
                    <div
                      key={target._id}
                      onClick={() => handleSelectTarget(target)}
                      className={`backdrop-blur-lg bg-white/10 border transition-all duration-300 rounded-2xl p-5 shadow-lg cursor-pointer hover:scale-105 ${selectedTarget?._id === target._id
                        ? "border-blue-400"
                        : "border-white/20"
                        }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold">{target.name}</h3>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${target.status === "UP"
                            ? "bg-green-500/20 text-green-300"
                            : target.status === "DOWN"
                              ? "bg-red-500/20 text-red-300"
                              : "bg-yellow-500/20 text-yellow-300"
                            }`}
                        >
                          {target.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 break-all">
                        {target.url}
                      </p>
                      <div className="mt-4 pt-4 border-t border-white/20 flex justify-between items-center">
                        <p className="text-xs text-gray-300">
                          Schedule: <code>{target.cronSchedule}</code>
                        </p>
                        <div className="flex gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(target);
                            }}
                            className="text-xs text-blue-300 hover:text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(target._id);
                            }}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 backdrop-blur-xl bg-white/10 rounded-2xl shadow-lg">
                  <p className="text-lg text-gray-200">
                    🚀 You haven't added any targets yet. Use the form above to
                    get started!
                  </p>
                </div>
              )
            )}
          </section>

          {/* History */}
          {selectedTarget && (
            <section>
              <h2 className="text-3xl font-bold mb-6">
                History for:{" "}
                <span className="text-yellow-300">{selectedTarget.name}</span>
              </h2>
              <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl shadow-xl max-h-96 overflow-y-auto">
                {isHistoryLoading ? (
                  <p className="p-6 text-center">Loading history...</p>
                ) : (
                  <table className="w-full text-sm text-left text-gray-200">
                    <thead className="text-xs text-gray-300 uppercase bg-white/10 sticky top-0">
                      <tr>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Timestamp</th>
                        <th className="px-6 py-3">Response Time (ms)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.length > 0 ? (
                        historyData.map((ping) => (
                          <tr
                            key={ping._id}
                            className="border-b border-white/10 hover:bg-white/10"
                          >
                            <td className="px-6 py-4">
                              <span
                                className={`px-2 py-1 text-xs font-semibold rounded-full ${ping.status === "UP"
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-red-500/20 text-red-300"
                                  }`}
                              >
                                {ping.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {new Date(ping.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4">{ping.responseTime}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center p-6">
                            No history found for this target.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <EditTargetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        target={currentTarget}
        onTargetUpdated={handleTargetUpdated}
      />
    </div>
  );
};

export default Dashboard;
