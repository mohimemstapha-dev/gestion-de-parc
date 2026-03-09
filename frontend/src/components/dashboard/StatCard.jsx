import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Ticket, Clock } from 'lucide-react';

const StatCard = ({ title, value, change, trend, color, currency }) => {
    const Icon = () => {
        switch (title) {
            case 'Revenue': return <DollarSign className="w-6 h-6 text-blue-400" />;
            case 'Visitors Today': return <Users className="w-6 h-6 text-teal-400" />;
            case 'Active Tickets': return <Ticket className="w-6 h-6 text-yellow-400" />;
            case 'Avg. Wait Time': return <Clock className="w-6 h-6 text-purple-400" />;
            default: return <DollarSign className="w-6 h-6 text-blue-400" />;
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-700/50 rounded-lg">
                    <Icon />
                </div>
                <div className={`flex items-center space-x-1 text-sm font-medium ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                    <span>{change}</span>
                    {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                </div>
            </div>
            <div>
                <p className="text-slate-400 text-sm font-medium">{title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                    {value} {currency && <span className="text-sm font-normal text-slate-400 ml-1">{currency}</span>}
                </h3>
            </div>
        </div>
    );
};

export default StatCard;
