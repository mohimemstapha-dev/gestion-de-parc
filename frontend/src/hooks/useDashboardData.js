import { useState, useEffect } from 'react';
import api from '../api';

const useDashboardData = () => {
    const [data, setData] = useState({
        stats: [],
        chartData: [],
        popularGames: [],
        recentActivity: [],
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/dashboard');
                setData(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load dashboard data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return { data, loading, error };
};

export default useDashboardData;
