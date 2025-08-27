import React from "react";
import { Bell, Phone, MessageSquare, Settings } from "lucide-react";

export default function PingerApp() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center px-6 py-10">

            {/* Header */}
            <h1 className="text-5xl font-extrabold text-white drop-shadow-lg mb-10">
                Pinger App
            </h1>

            {/* Main Container */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">

                {/* Card 1 */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <Bell className="w-8 h-8 text-yellow-400" />
                        <h2 className="text-2xl font-semibold text-white">Smart Alerts</h2>
                    </div>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Get instant notifications with a sleek and modern alerting system.
                    </p>
                </div>

                {/* Card 2 */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <Phone className="w-8 h-8 text-green-400" />
                        <h2 className="text-2xl font-semibold text-white">Quick Calls</h2>
                    </div>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Connect instantly with one tap voice and video calling.
                    </p>
                </div>

                {/* Card 3 */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <MessageSquare className="w-8 h-8 text-pink-400" />
                        <h2 className="text-2xl font-semibold text-white">Seamless Chat</h2>
                    </div>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Enjoy real-time conversations with a smooth chat interface.
                    </p>
                </div>

                {/* Card 4 */}
                <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-xl hover:scale-105 transition-transform duration-300">
                    <div className="flex items-center gap-4 mb-4">
                        <Settings className="w-8 h-8 text-blue-400" />
                        <h2 className="text-2xl font-semibold text-white">Easy Settings</h2>
                    </div>
                    <p className="text-white/80 text-lg leading-relaxed">
                        Customize your Pinger App the way you like with advanced settings.
                    </p>
                </div>
            </div>
        </div>
    );
}
