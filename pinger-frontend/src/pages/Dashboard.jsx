import React, { useState, useEffect } from "react";
import { useAuth } from "../context/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { getTargets, deleteTarget, getTargetHistory } from "../api/targets";
import AddTargetForm from "../components/AddTargetForm";
import EditTargetModal from "../components/EditTargetModal";
import logo from "../assets/neverNap.png";
import { Card, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { UserCircle } from "lucide-react";

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
        setError("Failed to fetch targets.");
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-black/30 backdrop-blur-lg border-b border-white/20 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="NeverNap Logo" className="h-10 w-10 rounded-lg" />
            <h1 className="text-2xl font-bold tracking-wide">NeverNap</h1>
            <Link to="/pinger" className="ml-10 text-sm text-gray-200 hover:text-white">
              Pinger Page
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-sm">{authUser?.user?.username}</p>
              <p className="text-xs text-gray-300">{authUser?.user?.email}</p>
            </div>
            <UserCircle className="h-8 w-8 text-gray-300" />
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600">
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        {/* Add Target Form */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 p-6 rounded-2xl shadow-xl"
        >
          <AddTargetForm onTargetAdded={handleTargetAdded} />
        </motion.section>

        {/* Targets */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Your Monitored Targets</h2>

          {loading ? (
            <p className="text-gray-200">Loading targets...</p>
          ) : targets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {targets.map((target) => (
                <motion.div
                  key={target._id}
                  whileHover={{ scale: 1.05 }}
                  className={`p-6 rounded-2xl shadow-xl cursor-pointer backdrop-blur-lg bg-white/10 border transition-all duration-300 ${selectedTarget?._id === target._id ? "border-blue-400" : "border-white/20"
                    }`}
                  onClick={() => handleSelectTarget(target)}
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
                  <p className="text-sm text-gray-200 break-all">{target.url}</p>
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
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 backdrop-blur-xl bg-white/10 rounded-2xl shadow-lg">
              <p className="text-lg text-gray-200">
                🚀 You haven't added any targets yet. Use the form above to get started!
              </p>
            </div>
          )}
        </section>

        {/* History */}
        {selectedTarget && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-3xl font-bold mb-6">
              History for: <span className="text-yellow-300">{selectedTarget.name}</span>
            </h2>
            <Card className="bg-white/10 border-white/20 backdrop-blur-lg text-white">
              <CardContent className="p-6">
                {isHistoryLoading ? (
                  <p>Loading history...</p>
                ) : historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historyData}>
                      <XAxis
                        dataKey="createdAt"
                        tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                        stroke="#ccc"
                      />
                      <YAxis stroke="#ccc" />
                      <Tooltip labelFormatter={(l) => new Date(l).toLocaleString()} />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        stroke="#38bdf8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p>No history found for this target.</p>
                )}
              </CardContent>
            </Card>
          </motion.section>
        )}
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
