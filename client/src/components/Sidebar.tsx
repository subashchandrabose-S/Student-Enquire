import React, { useState, useEffect } from 'react';
import { UserPlus, Users, Settings, LogOut } from 'lucide-react';
import { studentApi } from '../api/studentApi';

interface SidebarProps {
    activeTab: 'form' | 'list';
    setActiveTab: (tab: 'form' | 'list') => void;
    onLogout: () => void;
    isAuthenticated: boolean;
    userType: 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onLogout, isAuthenticated, userType }) => {
    return (
        <div className="fixed left-0 top-0 h-full w-20 md:w-64 bg-slate-900 flex flex-col shadow-2xl z-50 transition-all duration-300 border-r border-slate-800">

            {/* Logo Area */}
            <div className="p-8 flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 rotate-3">
                    <span className="-rotate-3">U</span>
                </div>
                <div className="hidden md:block">
                    <h1 className="font-black text-xl tracking-tight text-white leading-none">Student Enquire</h1>
                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">Admission</p>
                </div>
            </div>

            {/* Nav Items */}
            <div className="flex-1 w-full px-4 space-y-2 mt-4">
                <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 hidden md:block">Main Navigation</p>

                <button
                    onClick={() => setActiveTab('form')}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${activeTab === 'form' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <UserPlus size={22} className={activeTab === 'form' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                    <span className="hidden md:block font-bold text-sm">Registration</span>
                </button>

                <button
                    onClick={() => setActiveTab('list')}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${activeTab === 'list' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                >
                    <Users size={22} className={activeTab === 'list' ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                    <span className="hidden md:block font-bold text-sm">Students List</span>
                </button>

                <div className="pt-4">
                    <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 hidden md:block">System</p>
                    <button className="w-full flex items-center gap-4 p-4 rounded-2xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 group">
                        <Settings size={22} className="text-slate-500 group-hover:text-white" />
                        <span className="hidden md:block font-bold text-sm">Settings</span>
                    </button>
                </div>
            </div>

            {/* Connection Status */}
            <div className="px-6 py-6 border-t border-slate-800 mx-2">
                <ConnectionStatus />
            </div>

            {/* User Info with Logout */}
            {isAuthenticated && (
                <div className="p-4 mt-auto border-t border-slate-800 mx-2 mb-4">
                    <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/10">
                            A
                        </div>
                        <div className="hidden md:block flex-1 overflow-hidden">
                            <p className="text-xs font-black text-white truncate">Administrator</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{userType}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const ConnectionStatus: React.FC = () => {
    const [status, setStatus] = useState<{ connected: boolean; url: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const check = async () => {
        setLoading(true);
        try {
            const res = await studentApi.checkConnection();
            setStatus(res);
        } catch (e) {
            setStatus({ connected: false, url: 'Unknown' });
        }
        setLoading(false);
    };

    useEffect(() => {
        check();
        const interval = setInterval(check, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading && !status) return <div className="text-[10px] font-bold text-slate-600 px-4">Syncing...</div>;

    return (
        <div className="flex flex-col gap-2 px-2">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${status?.connected ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'}`}></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {status?.connected ? 'Systems Online' : 'Link Offline'}
                </span>
            </div>
            <p className="text-[8px] font-bold text-slate-600 truncate opacity-50">{status?.url}</p>
        </div>
    );
};
