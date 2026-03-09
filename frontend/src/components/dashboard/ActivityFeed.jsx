import React from 'react';
import { Ticket, Utensils, UserPlus, Wrench } from 'lucide-react';

const ActivityFeed = ({ activities }) => {
    const getIcon = (type) => {
        switch (type) {
            case 'Ticket': return <Ticket className="w-5 h-5 text-blue-400" />;
            case 'Restaurant': return <Utensils className="w-5 h-5 text-orange-400" />;
            case 'Member': return <UserPlus className="w-5 h-5 text-teal-400" />;
            case 'Maintenance': return <Wrench className="w-5 h-5 text-red-400" />;
            default: return <Ticket className="w-5 h-5 text-blue-400" />;
        }
    };

    const getIconBg = (type) => {
        switch (type) {
            case 'Ticket': return 'bg-blue-500/10';
            case 'Restaurant': return 'bg-orange-500/10';
            case 'Member': return 'bg-teal-500/10';
            case 'Maintenance': return 'bg-red-500/10';
            default: return 'bg-blue-500/10';
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex space-x-4">
                        <div className={`p-2 rounded-lg h-fit ${getIconBg(activity.type)}`}>
                            {getIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="text-sm font-bold text-white">{activity.title}</h4>
                                <span className="text-xs text-slate-500">{activity.time}</span>
                            </div>
                            <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">By: {activity.user}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors border-t border-slate-700">
                View All Activity
            </button>
        </div>
    );
};

export default ActivityFeed;
