import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LogOut, LayoutDashboard, User, Settings, Bell, Search, Users } from 'lucide-react';

// Sub-components
import StatCard from './dashboard/StatCard';
import RevenueChart from './dashboard/RevenueChart';
import PopularGames from './dashboard/PopularGames';
import ActivityFeed from './dashboard/ActivityFeed';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [data, setData] = useState({ stats: [], chartData: [], popularGames: [], recentActivity: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [userRes, dashRes] = await Promise.all([
                    api.get('/user'),
                    api.get('/dashboard')
                ]);
                setUser(userRes.data);
                setData(dashRes.data);
            } catch (err) {
                console.error(err);
                setError('Failed to load data');
                if (err.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, [navigate]);

    const handleLogout = async () => {
        try { await api.post('/logout'); } catch (err) {}
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;

    const displayName = user ? `${user.prenom} ${user.name}` : 'Admin';

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-800 hidden lg:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">Parc Admin</h1>
                    </div>
                    <nav className="space-y-1">
                        <div className="flex items-center space-x-3 p-3 bg-blue-600/20 text-blue-400 rounded-xl font-medium cursor-pointer">
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Overview</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all cursor-pointer">
                            <Users className="w-5 h-5" />
                            <span>Visitors</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all cursor-pointer">
                            <Settings className="w-5 h-5" />
                            <span>System</span>
                        </div>
                    </nav>
                </div>
                <div className="mt-auto p-6">
                    <button onClick={handleLogout} className="flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/10 rounded-xl w-full transition-all">
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center bg-[#1e293b] px-4 py-2 rounded-xl w-96">
                        <Search className="w-4 h-4 text-slate-500 mr-2" />
                        <input type="text" placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-full text-white" />
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{displayName}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role || 'Manager'}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600">
                            <User className="w-6 h-6 text-slate-400" />
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                            <p className="text-slate-400 mt-1">Real-time park operations data.</p>
                        </div>
                        <div className="text-slate-400 text-sm">
                            Last update: {new Date().toLocaleTimeString()}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {data.stats.map((stat, i) => (
                            <StatCard 
                                key={i}
                                title={stat.title}
                                value={stat.value}
                                change={stat.change}
                                trend={stat.trend}
                                color={stat.color}
                                currency={stat.currency}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart */}
                        <div className="lg:col-span-2">
                            <RevenueChart data={data.chartData} />
                        </div>

                        {/* Popular */}
                        <div>
                            <PopularGames games={data.popularGames} />
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="mt-8">
                        <ActivityFeed activities={data.recentActivity} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
