import React from 'react';

const PopularGames = ({ games }) => {
    const getColorClass = (color) => {
        switch (color) {
            case 'blue': return 'bg-blue-500';
            case 'teal': return 'bg-teal-500';
            case 'orange': return 'bg-orange-500';
            case 'purple': return 'bg-purple-500';
            case 'red': return 'bg-red-500';
            default: return 'bg-blue-500';
        }
    };

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">Popular Attractions</h3>
            <div className="space-y-6">
                {games.map((game, index) => (
                    <div key={index}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-slate-300">{game.name}</span>
                            <span className="text-sm font-bold text-white">{game.load}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <div 
                                className={`h-2 rounded-full ${getColorClass(game.color)} transition-all duration-500`} 
                                style={{ width: `${game.load}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularGames;
