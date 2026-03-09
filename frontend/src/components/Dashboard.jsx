import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, LayoutDashboard, User, Settings, Bell, Search, TrendingUp, TrendingDown, DollarSign, Users, Ticket, Clock, Utensils, UserPlus, Wrench } from 'lucide-react';

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
                            <p className="text-sm font-bold text-white">{user?.name || 'Admin'}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{user?.role || 'Manager'}</p>
                        </div>
                        <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center border-2 border-slate-600"><User className="w-6 h-6 text-slate-400" /></div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                        <p className="text-slate-400 mt-1">Real-time park operations data.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {data.stats.map((stat, i) => (
                            <div key={i} className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-800 rounded-lg">
                                        {stat.title.includes('Revenue') ? <DollarSign className="w-6 h-6 text-blue-400" /> :
                                         stat.title.includes('Visitors') ? <Users className="w-6 h-6 text-teal-400" /> :
                                         stat.title.includes('Tickets') ? <Ticket className="w-6 h-6 text-yellow-400" /> :
                                         <Clock className="w-6 h-6 text-purple-400" />}
                                    </div>
                                    <div className={`flex items-center space-x-1 text-sm font-medium ${stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                        <span>{stat.change}</span>
                                        {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-white mt-1">{stat.value} <span className="text-sm font-normal text-slate-500">{stat.currency}</span></h3>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Chart */}
                        <div className="lg:col-span-2 bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6">Revenue Trend (Last 7 Days)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.chartData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Popular */}
                        <div className="bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-6">Popular Attractions</h3>
                            <div className="space-y-6">
                                {data.popularGames.map((game, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-2 text-sm">
                                            <span className="text-slate-300">{game.name}</span>
                                            <span className="font-bold text-white">{game.load}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${game.load}%`, backgroundColor: game.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activity */}
                    <div className="mt-8 bg-[#1e293b] rounded-xl p-6 border border-slate-800 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6">Recent Operations</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.recentActivity.map((act, i) => (
                                <div key={i} className="flex space-x-4 p-4 rounded-xl bg-[#0f172a]/50 border border-slate-800">
                                    <div className="p-2 rounded-lg bg-blue-500/10 h-fit">
                                        {act.type.includes('Ticket') ? <Ticket className="w-5 h-5 text-blue-400" /> : <DollarSign className="w-5 h-5 text-green-400" />}
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-start w-full">
                                            <h4 className="text-sm font-bold text-white">{act.title}</h4>
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">{act.description}</p>
                                        <p className="text-[10px] text-slate-500 mt-2">{act.time} • By {act.user}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
