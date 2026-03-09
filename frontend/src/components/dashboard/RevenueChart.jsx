import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data }) => {
    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 h-[400px]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Revenue Overview</h3>
                <div className="flex space-x-2">
                    <span className="flex items-center text-xs text-slate-400">
                        <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span> Revenue (MAD)
                    </span>
                </div>
            </div>
            
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
                        <XAxis 
                            dataKey="day" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                            dy={10}
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#94a3b8', fontSize: 12 }} 
                            tickFormatter={(value) => `${value}`}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default RevenueChart;
