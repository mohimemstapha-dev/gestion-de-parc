import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogOut, LayoutDashboard, User, Settings, Bell, Search, TrendingUp, TrendingDown, DollarSign, Users, Ticket, Clock } from 'lucide-react';

const MAX_FIELD_LENGTH = 20;

const Dashboard = () => {
    const [data, setData] = useState({ stats: [], chartData: [], popularGames: [], recentActivity: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get('/api/dashboard');
                setData(res.data);
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
            <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-100 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-[#1e293b] border-r border-slate-800 hidden lg:flex flex-col">
                <div className="p-6">
                    <div className="flex items-center space-x-3 mb-10">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white uppercase tracking-tight">Parc Admin</h1>
                    </div>
                    <nav className="space-y-1">
                        <div className="flex items-center space-x-3 p-3 bg-blue-600/20 text-blue-400 rounded-xl font-medium">
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Overview</span>
                        </div>
                        <div className="flex items-center space-x-3 p-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all cursor-pointer">
                            <Users className="w-5 h-5" />
                            <span>Visitors</span>
                        </div>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="h-20 bg-[#0f172a]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center bg-[#1e293b] px-4 py-2 rounded-xl w-96 border border-slate-700/50 shadow-inner">
                        <Search className="w-4 h-4 text-slate-500 mr-2" />
                        <input type="text" maxLength={MAX_FIELD_LENGTH} placeholder="Search..." className="bg-transparent border-none focus:outline-none text-sm w-full text-white placeholder-slate-500" />
                    </div>
                    <div className="flex items-center space-x-6">
                        <Bell className="w-5 h-5 text-slate-400 cursor-pointer" />
                        <div className="flex items-center space-x-3 pl-6 border-l border-slate-800">
                            <div className="w-10 h-10 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full flex items-center justify-center border border-slate-600 shadow-lg">
                                <User className="w-6 h-6 text-slate-300" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h2>
                        <p className="text-slate-400 mt-2 font-medium">Monitoring real-time park performance and transactions.</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                        {data.stats.map((stat, i) => (
                            <div key={i} className="bg-[#1e293b] rounded-2xl p-6 border border-slate-800/50 shadow-xl transition-transform hover:scale-[1.02]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                                        {stat.title.includes('Revenue') ? <DollarSign className="w-6 h-6 text-blue-400" /> :
                                         stat.title.includes('Visitors') ? <Users className="w-6 h-6 text-teal-400" /> :
                                         <Ticket className="w-6 h-6 text-yellow-400" />}
                                    </div>
                                    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${stat.trend === 'up' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                        <span>{stat.change}</span>
                                        {stat.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm font-semibold tracking-wide uppercase">{stat.title}</p>
                                <h3 className="text-2xl font-black text-white mt-2 tabular-nums">
                                    {stat.value} <span className="text-xs font-medium text-slate-500 ml-1">{stat.currency}</span>
                                </h3>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
                        {/* Revenue Chart */}
                        <div className="lg:col-span-2 bg-[#1e293b] rounded-2xl p-8 border border-slate-800 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-lg font-bold text-white">Revenue Analytics</h3>
                                <div className="flex space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-slate-400">Past 7 Days</span>
                                </div>
                            </div>
                            <div className="h-[320px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={data.chartData}>
                                        <defs>
                                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} dy={10} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                        <Tooltip 
                                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px', color: '#fff' }}
                                            itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Popular List */}
                        <div className="bg-[#1e293b] rounded-2xl p-8 border border-slate-800 shadow-2xl">
                            <h3 className="text-lg font-bold text-white mb-8">Top Attractions</h3>
                            <div className="space-y-8">
                                {data.popularGames.map((game, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-slate-300 font-medium text-sm">{game.name}</span>
                                            <span className="font-bold text-white text-sm">{game.load}%</span>
                                        </div>
                                        <div className="w-full bg-slate-800/50 rounded-full h-2.5 overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${game.load}%`, backgroundColor: game.color }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Operations Log */}
                    <div className="bg-[#1e293b] rounded-2xl p-8 border border-slate-800 shadow-2xl">
                        <h3 className="text-lg font-bold text-white mb-8 text-center uppercase tracking-widest">Live Operations Log</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {data.recentActivity.map((act, i) => (
                                <div key={i} className="flex items-center space-x-4 p-5 rounded-2xl bg-[#0f172a]/40 border border-slate-700/30 hover:bg-[#0f172a]/60 transition-colors">
                                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <Ticket className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-bold text-white truncate">{act.title}</h4>
                                        <p className="text-xs text-slate-500 mt-1 font-medium">{act.time}</p>
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
