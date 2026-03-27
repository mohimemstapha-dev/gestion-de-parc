import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FerrisWheel,
    LayoutDashboard,
    LogOut,
    ReceiptText,
    Search,
    ShieldCheck,
    Ticket,
    User,
    Users,
} from 'lucide-react';
import api from '../api';
import StatCard from './dashboard/StatCard';
import RevenueChart from './dashboard/RevenueChart';
import PopularGames from './dashboard/PopularGames';
import ActivityFeed from './dashboard/ActivityFeed';
import ResourceManager from './dashboard/ResourceManager';

const MAX_FIELD_LENGTH = 20;

const NAV_ITEMS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'visitors', label: 'Visitors', icon: Users },
    { id: 'attractions', label: 'Attractions', icon: FerrisWheel },
    { id: 'tickets', label: 'Tickets', icon: Ticket },
    { id: 'billets', label: 'Billets', icon: ReceiptText },
    { id: 'users', label: 'Users', icon: User },
    { id: 'staff', label: 'Staff', icon: ShieldCheck },
];

const ROLE_NAV_ACCESS = {
    admin: ['overview', 'visitors', 'attractions', 'tickets', 'billets', 'users', 'staff'],
    staff: ['overview', 'visitors', 'billets', 'attractions'],
    client: ['overview'],
};

const RESOURCE_CONFIG = {
    visitors: {
        title: 'Visitors',
        singularTitle: 'Visitor',
        description: 'Register new visitors, update their profile data, and keep the entrance records clean.',
        endpoint: 'visiteurs',
        emptyMessage: 'No visitors found yet.',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'prenom', label: 'First name' },
            { key: 'nom', label: 'Last name' },
            {
                key: 'created_at',
                label: 'Created',
                render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
            },
        ],
        fields: [
            { name: 'prenom', label: 'First name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Amine' },
            { name: 'nom', label: 'Last name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'El Idrissi' },
        ],
    },
    attractions: {
        title: 'Attractions',
        singularTitle: 'Attraction',
        description: 'Manage rides and park experiences, including pricing and operating status.',
        endpoint: 'attractions',
        emptyMessage: 'No attractions found yet.',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'nom', label: 'Name' },
            {
                key: 'prix',
                label: 'Price',
                render: (value) => `${Number(value || 0).toFixed(2)} MAD`,
            },
            {
                key: 'status',
                label: 'Status',
                render: (value) => {
                    const statusClasses = {
                        active: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                        inactive: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
                        maintenance: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    };

                    return (
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${statusClasses[value] || statusClasses.inactive}`}>
                            {value || 'inactive'}
                        </span>
                    );
                },
            },
        ],
        fields: [
            { name: 'nom', label: 'Attraction name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Grande Roue' },
            { name: 'prix', label: 'Price', type: 'number', requiredOnCreate: true, requiredOnEdit: true, min: 0, step: '0.01', placeholder: '120' },
            {
                name: 'status',
                label: 'Status',
                type: 'select',
                requiredOnCreate: true,
                requiredOnEdit: true,
                defaultValue: 'active',
                options: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                    { value: 'maintenance', label: 'Maintenance' },
                ],
            },
        ],
    },
    tickets: {
        title: 'Tickets',
        singularTitle: 'Ticket',
        description: 'Configure ticket categories and keep the customer-facing descriptions up to date.',
        endpoint: 'tickets',
        emptyMessage: 'No tickets found yet.',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'type', label: 'Type' },
            {
                key: 'description',
                label: 'Description',
                render: (value) => <span className="line-clamp-2 text-slate-300">{value}</span>,
            },
        ],
        fields: [
            { name: 'type', label: 'Ticket type', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'VIP Day Pass' },
            { name: 'description', label: 'Description', type: 'textarea', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Unlimited access for one day.' },
        ],
    },
    billets: {
        title: 'Billets',
        singularTitle: 'Billet',
        description: 'Create sold tickets, assign them to visitors, and attach the selected attractions.',
        endpoint: 'billets',
        emptyMessage: 'No billets found yet.',
        dataSources: [
            { key: 'visitors', endpoint: 'visiteurs' },
            { key: 'tickets', endpoint: 'tickets' },
            { key: 'attractions', endpoint: 'attractions' },
        ],
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'numero_billet', label: 'Billet number' },
            {
                key: 'visiteur',
                label: 'Visitor',
                render: (value) => (value ? `${value.prenom} ${value.nom}` : '-'),
            },
            {
                key: 'ticket',
                label: 'Ticket type',
                render: (value) => value?.type || '-',
            },
            {
                key: 'attractions',
                label: 'Attractions',
                render: (value) =>
                    value?.length ? (
                        <div className="flex flex-wrap gap-2">
                            {value.map((attraction) => (
                                <span
                                    key={attraction.id}
                                    className="inline-flex rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-xs text-sky-200"
                                >
                                    {attraction.nom}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <span className="text-slate-500">No attractions</span>
                    ),
            },
        ],
        fields: [
            {
                name: 'id_visiteur',
                label: 'Visitor',
                type: 'select',
                requiredOnCreate: true,
                requiredOnEdit: true,
                defaultValue: '',
                options: (relatedData) => [
                    { value: '', label: 'Select a visitor' },
                    ...((relatedData.visitors || []).map((visitor) => ({
                        value: String(visitor.id),
                        label: `${visitor.prenom} ${visitor.nom}`,
                    }))),
                ],
                transformSubmit: (value) => Number(value),
                valueFromItem: (item) => String(item.id_visiteur ?? item.visiteur?.id ?? ''),
            },
            {
                name: 'id_ticket',
                label: 'Ticket',
                type: 'select',
                requiredOnCreate: true,
                requiredOnEdit: true,
                defaultValue: '',
                options: (relatedData) => [
                    { value: '', label: 'Select a ticket' },
                    ...((relatedData.tickets || []).map((ticketOption) => ({
                        value: String(ticketOption.id),
                        label: ticketOption.type,
                    }))),
                ],
                transformSubmit: (value) => Number(value),
                valueFromItem: (item) => String(item.id_ticket ?? item.ticket?.id ?? ''),
            },
            {
                name: 'attractions',
                label: 'Attractions',
                type: 'multiselect',
                requiredOnCreate: false,
                requiredOnEdit: false,
                defaultValue: [],
                options: (relatedData) =>
                    (relatedData.attractions || []).map((attraction) => ({
                        value: String(attraction.id),
                        label: `${attraction.nom} (${Number(attraction.prix || 0).toFixed(2)} MAD)`,
                    })),
                transformSubmit: (value) => value.map((entry) => Number(entry)),
                valueFromItem: (item) => (item.attractions || []).map((attraction) => String(attraction.id)),
            },
        ],
    },
    users: {
        title: 'Users',
        singularTitle: 'User',
        description: 'Manage all platform accounts, their access roles, and contact details.',
        endpoint: 'users',
        emptyMessage: 'No users found yet.',
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'prenom', label: 'First name' },
            { key: 'name', label: 'Last name' },
            { key: 'email', label: 'Email' },
            {
                key: 'role',
                label: 'Role',
                render: (value) => <span className="capitalize">{value}</span>,
            },
        ],
        fields: [
            { name: 'prenom', label: 'First name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Sara' },
            { name: 'name', label: 'Last name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Bennani' },
            { name: 'email', label: 'Email', type: 'email', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'sara@parc.com' },
            { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true, requiredOnEdit: false, placeholder: 'Leave blank to keep current password' },
            {
                name: 'role',
                label: 'Role',
                type: 'select',
                requiredOnCreate: true,
                requiredOnEdit: true,
                defaultValue: 'client',
                options: [
                    { value: 'admin', label: 'Admin' },
                    { value: 'staff', label: 'Staff' },
                    { value: 'client', label: 'Client' },
                ],
            },
        ],
    },
    staff: {
        title: 'Staff',
        singularTitle: 'Staff member',
        description: 'Create and maintain staff accounts without mixing them into the wider customer user list.',
        endpoint: 'users',
        emptyMessage: 'No staff members found yet.',
        filterItems: (items) => items.filter((item) => item.role === 'staff'),
        formDefaults: () => ({ role: 'staff' }),
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'prenom', label: 'First name' },
            { key: 'name', label: 'Last name' },
            { key: 'email', label: 'Email' },
            {
                key: 'created_at',
                label: 'Added',
                render: (value) => (value ? new Date(value).toLocaleDateString() : '-'),
            },
        ],
        fields: [
            { name: 'prenom', label: 'First name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Youssef' },
            { name: 'name', label: 'Last name', type: 'text', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'Alaoui' },
            { name: 'email', label: 'Email', type: 'email', requiredOnCreate: true, requiredOnEdit: true, placeholder: 'staff@parc.com' },
            { name: 'password', label: 'Password', type: 'password', requiredOnCreate: true, requiredOnEdit: false, placeholder: 'Leave blank to keep current password' },
            { name: 'role', label: 'Role', type: 'hidden', defaultValue: 'staff', requiredOnCreate: true, requiredOnEdit: true },
        ],
    },
};

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [data, setData] = useState({ stats: [], chartData: [], popularGames: [], recentActivity: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('overview');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                const [userRes, dashRes] = await Promise.all([api.get('/user'), api.get('/dashboard')]);
                setUser(userRes.data);
                setData(dashRes.data);
                setError(null);
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
        try {
            await api.post('/logout');
        } catch (err) {
            console.error(err);
        }
        localStorage.removeItem('token');
        navigate('/login');
    };

    const displayName = user ? `${user.prenom} ${user.name}` : 'Admin';
    // We only trust roles that are explicitly configured in the access map.
    // This prevents real roles like "client" from being accidentally grouped with another role.
    const currentRole = ROLE_NAV_ACCESS[user?.role] ? user.role : 'client';
    // This derives the allowed navigation from the authenticated user's role.
    // Derived state keeps the permission logic in one place and avoids repeating role checks everywhere.
    const allowedNavIds = ROLE_NAV_ACCESS[currentRole] || ROLE_NAV_ACCESS.client;
    // We filter the shared navigation config instead of creating two separate dashboards.
    // That keeps the structure reusable while still giving each role a tailored view.
    const visibleNavItems = useMemo(
        () => NAV_ITEMS.filter((item) => allowedNavIds.includes(item.id)),
        [allowedNavIds]
    );
    // This picks a safe first tab for the current role if the current tab becomes invalid.
    // It protects us when roles change or when someone refreshes on a tab they should not access.
    const defaultView = allowedNavIds[0] || 'overview';
    const activeConfig = useMemo(() => RESOURCE_CONFIG[activeView], [activeView]);

    useEffect(() => {
        // If a role does not have access to the current tab, we immediately move them
        // to the first allowed tab so the UI never renders an unauthorized section.
        if (!allowedNavIds.includes(activeView)) {
            setActiveView(defaultView);
        }
    }, [activeView, allowedNavIds, defaultView]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0f172a]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-[#0f172a] text-slate-100">
            <aside className="hidden w-64 flex-col border-r border-slate-800 bg-[#1e293b] lg:flex">
                <div className="p-6">
                    <div className="mb-10 flex items-center space-x-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                            <LayoutDashboard className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Parc Admin</h1>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveView(item.id)}
                                    className={`flex w-full items-center space-x-3 rounded-xl p-3 text-left font-medium transition-all ${
                                        isActive
                                            ? 'bg-blue-600/20 text-blue-400'
                                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-6">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center space-x-3 rounded-xl p-3 text-red-400 transition-all hover:bg-red-500/10"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <header className="sticky top-0 z-10 flex flex-col gap-4 border-b border-slate-800 bg-[#0f172a]/80 px-5 py-4 backdrop-blur-md md:px-8 lg:h-20 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center rounded-xl bg-[#1e293b] px-4 py-2 lg:w-96">
                        <Search className="mr-2 h-4 w-4 text-slate-500" />
                        <input
                            type="text"
                            value=""
                            readOnly
                            maxLength={MAX_FIELD_LENGTH}
                            placeholder="Search..."
                            className="w-full border-none bg-transparent text-sm text-white focus:outline-none"
                        />
                    </div>

                    <div className="flex items-center space-x-4 self-start lg:self-auto">
                        <div className="text-right">
                            <p className="text-sm font-bold text-white">{displayName}</p>
                            <p className="text-xs uppercase tracking-wider text-slate-500">{user?.role || 'Manager'}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-600 bg-slate-700">
                            <User className="h-6 w-6 text-slate-400" />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-3 overflow-x-auto pb-1 lg:hidden">
                        {visibleNavItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeView === item.id;

                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveView(item.id)}
                                    className={`inline-flex items-center rounded-2xl border px-4 py-2 text-sm font-medium whitespace-nowrap transition ${
                                        isActive
                                            ? 'border-sky-500/40 bg-sky-500/15 text-sky-300'
                                            : 'border-slate-700 bg-slate-900/80 text-slate-300'
                                    }`}
                                >
                                    <Icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>
                </header>

                <div className="p-5 md:p-8">
                        {error ? (
                            <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                                {error}
                            </div>
                        ) : null}

                    {activeView === 'overview' ? (
                        <>
                            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">Dashboard Overview</h2>
                                    <p className="mt-1 text-slate-400">Real-time park operations data.</p>
                                </div>
                                <div className="text-sm text-slate-400">
                                    Last update: {new Date().toLocaleTimeString()}
                                </div>
                            </div>

                            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {data.stats.map((stat, index) => (
                                    <StatCard
                                        key={index}
                                        title={stat.title}
                                        value={stat.value}
                                        change={stat.change}
                                        trend={stat.trend}
                                        color={stat.color}
                                        currency={stat.currency}
                                    />
                                ))}
                            </div>

                            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                <div className="lg:col-span-2">
                                    <RevenueChart data={data.chartData} />
                                </div>
                                <div>
                                    <PopularGames games={data.popularGames} />
                                </div>
                            </div>

                            <div className="mt-8">
                                <ActivityFeed activities={data.recentActivity} />
                            </div>
                        </>
                    ) : (
                        <ResourceManager
                            title={activeConfig.title}
                            singularTitle={activeConfig.singularTitle}
                            description={activeConfig.description}
                            endpoint={activeConfig.endpoint}
                            columns={activeConfig.columns}
                            fields={activeConfig.fields}
                            emptyMessage={activeConfig.emptyMessage}
                            filterItems={activeConfig.filterItems}
                            formDefaults={activeConfig.formDefaults}
                            dataSources={activeConfig.dataSources}
                        />
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
