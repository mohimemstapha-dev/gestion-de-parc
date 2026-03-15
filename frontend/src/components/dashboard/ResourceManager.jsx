import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api';
import { Pencil, Plus, RefreshCw, Save, Search, Trash2, X } from 'lucide-react';

const getInitialFormData = (fields) =>
    fields.reduce((accumulator, field) => {
        accumulator[field.name] = field.defaultValue ?? '';
        return accumulator;
    }, {});

const getErrorMessage = (error, fallbackMessage) => {
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    const validationErrors = error.response?.data?.errors;
    if (validationErrors) {
        return Object.values(validationErrors).flat().join(' ');
    }

    return fallbackMessage;
};

const ResourceManager = ({
    title,
    singularTitle,
    description,
    endpoint,
    columns,
    fields,
    emptyMessage,
    active = true,
    filterItems,
    formDefaults,
    dataSources,
}) => {
    const recordLabel = singularTitle || title.replace(/s$/, '');
    const initialFormData = useMemo(() => getInitialFormData(fields), [fields]);
    const [items, setItems] = useState([]);
    const [relatedData, setRelatedData] = useState({});
    const [formData, setFormData] = useState(initialFormData);
    const [editingItem, setEditingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const resetForm = () => {
        const defaults = typeof formDefaults === 'function' ? formDefaults(null) : {};
        setFormData({ ...initialFormData, ...defaults });
        setEditingItem(null);
    };

    const loadItems = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/${endpoint}`);
            setItems(response.data);
            setError('');
        } catch (requestError) {
            console.error(requestError);
            setError(getErrorMessage(requestError, `Failed to load ${title.toLowerCase()}.`));
        } finally {
            setLoading(false);
        }
    };

    const loadDataSources = async () => {
        if (!dataSources?.length) {
            setRelatedData({});
            return;
        }

        try {
            const responses = await Promise.all(
                dataSources.map(async (source) => {
                    const response = await api.get(`/${source.endpoint}`);
                    return [source.key, response.data];
                })
            );

            setRelatedData(Object.fromEntries(responses));
        } catch (requestError) {
            console.error(requestError);
            setError(getErrorMessage(requestError, `Failed to load ${recordLabel.toLowerCase()} options.`));
        }
    };

    useEffect(() => {
        if (!active) {
            return;
        }

        resetForm();
        loadDataSources();
        loadItems();
    }, [active, endpoint]);

    const visibleItems = useMemo(() => {
        const filteredSource = typeof filterItems === 'function' ? filterItems(items) : items;
        if (!searchTerm.trim()) {
            return filteredSource;
        }

        const loweredSearch = searchTerm.toLowerCase();
        return filteredSource.filter((item) =>
            Object.values(item).some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(loweredSearch)
            )
        );
    }, [filterItems, items, searchTerm]);

    const handleChange = (fieldName, value) => {
        setFormData((current) => ({
            ...current,
            [fieldName]: value,
        }));
    };

    const startEditing = (item) => {
        const defaults = typeof formDefaults === 'function' ? formDefaults(item) : {};
        const nextFormData = fields.reduce((accumulator, field) => {
            if (typeof field.valueFromItem === 'function') {
                accumulator[field.name] = field.valueFromItem(item);
                return accumulator;
            }

            if (field.type === 'password') {
                accumulator[field.name] = '';
                return accumulator;
            }

            accumulator[field.name] = item[field.name] ?? field.defaultValue ?? '';
            return accumulator;
        }, {});

        setEditingItem(item);
        setFormData({ ...nextFormData, ...defaults });
        setSuccessMessage('');
        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccessMessage('');

            const payload = fields.reduce((accumulator, field) => {
                const value = formData[field.name];
                const isEmptyPassword = field.type === 'password' && !value;

                if (isEmptyPassword) {
                    return accumulator;
                }

                if (typeof field.transformSubmit === 'function') {
                    accumulator[field.name] = field.transformSubmit(value, formData);
                    return accumulator;
                }

                if (field.type === 'number' && value !== '') {
                    accumulator[field.name] = Number(value);
                    return accumulator;
                }

                accumulator[field.name] = value;
                return accumulator;
            }, {});

            if (editingItem) {
                await api.put(`/${endpoint}/${editingItem.id}`, payload);
                setSuccessMessage(`${recordLabel} updated successfully.`);
            } else {
                await api.post(`/${endpoint}`, payload);
                setSuccessMessage(`${recordLabel} created successfully.`);
            }

            await loadItems();
            resetForm();
        } catch (requestError) {
            console.error(requestError);
            setError(getErrorMessage(requestError, `Failed to save ${title.toLowerCase()}.`));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        const confirmed = window.confirm(`Delete this ${recordLabel.toLowerCase()}?`);
        if (!confirmed) {
            return;
        }

        try {
            setError('');
            setSuccessMessage('');
            await api.delete(`/${endpoint}/${item.id}`);
            setSuccessMessage(`${recordLabel} deleted successfully.`);
            if (editingItem?.id === item.id) {
                resetForm();
            }
            await loadItems();
        } catch (requestError) {
            console.error(requestError);
            setError(getErrorMessage(requestError, `Failed to delete ${title.toLowerCase()}.`));
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.95fr] gap-8">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 shadow-2xl shadow-slate-950/30">
                <div className="border-b border-slate-800 p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-white">{title}</h3>
                            <p className="mt-1 text-sm text-slate-400">{description}</p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <label className="flex min-w-[260px] items-center rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-300">
                                <Search className="mr-2 h-4 w-4 text-slate-500" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder={`Search ${title.toLowerCase()}...`}
                                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                />
                            </label>
                            <button
                                type="button"
                                onClick={async () => {
                                    await loadDataSources();
                                    await loadItems();
                                }}
                                className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>

                {error ? (
                    <div className="mx-6 mt-6 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                        {error}
                    </div>
                ) : null}

                {successMessage ? (
                    <div className="mx-6 mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {successMessage}
                    </div>
                ) : null}

                <div className="overflow-x-auto p-6">
                    <table className="min-w-full text-left text-sm text-slate-300">
                        <thead>
                            <tr className="border-b border-slate-800 text-xs uppercase tracking-[0.18em] text-slate-500">
                                {columns.map((column) => (
                                    <th key={column.key} className="px-4 py-3 font-semibold">
                                        {column.label}
                                    </th>
                                ))}
                                <th className="px-4 py-3 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                                        Loading {title.toLowerCase()}...
                                    </td>
                                </tr>
                            ) : null}

                            {!loading && visibleItems.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                                        {emptyMessage}
                                    </td>
                                </tr>
                            ) : null}

                            {!loading &&
                                visibleItems.map((item) => (
                                    <tr key={item.id} className="border-b border-slate-800/80 transition hover:bg-slate-800/40">
                                        {columns.map((column) => (
                                            <td key={column.key} className="px-4 py-4 align-top">
                                                {typeof column.render === 'function' ? column.render(item[column.key], item) : item[column.key]}
                                            </td>
                                        ))}
                                        <td className="px-4 py-4">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => startEditing(item)}
                                                    className="inline-flex items-center rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-blue-500/50 hover:bg-blue-500/10 hover:text-blue-200"
                                                >
                                                    <Pencil className="mr-2 h-3.5 w-3.5" />
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item)}
                                                    className="inline-flex items-center rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-200"
                                                >
                                                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-2xl shadow-slate-950/30">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-sky-400">
                            {editingItem ? 'Edit record' : 'Create record'}
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-white">
                            {editingItem ? `Update ${recordLabel}` : `New ${recordLabel}`}
                        </h3>
                    </div>
                    {editingItem ? (
                        <button
                            type="button"
                            onClick={resetForm}
                            className="inline-flex items-center rounded-xl border border-slate-700 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-slate-800"
                        >
                            <X className="mr-2 h-3.5 w-3.5" />
                            Cancel
                        </button>
                    ) : null}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {fields.map((field) => {
                        const isRequired = editingItem ? field.requiredOnEdit : field.requiredOnCreate;
                        const value = formData[field.name] ?? '';
                        const options =
                            typeof field.options === 'function' ? field.options(relatedData) : field.options || [];

                        if (field.type === 'hidden') {
                            return <input key={field.name} type="hidden" value={value} readOnly />;
                        }

                        return (
                            <label key={field.name} className="block">
                                <span className="mb-2 block text-sm font-medium text-slate-300">
                                    {field.label}
                                </span>

                                {field.type === 'select' ? (
                                    <select
                                        value={value}
                                        onChange={(event) => handleChange(field.name, event.target.value)}
                                        required={isRequired}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                    >
                                        {options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : field.type === 'multiselect' ? (
                                    <>
                                        <select
                                            multiple
                                            value={value}
                                            onChange={(event) =>
                                                handleChange(
                                                    field.name,
                                                    Array.from(event.target.selectedOptions, (option) => option.value)
                                                )
                                            }
                                            required={isRequired}
                                            className="min-h-[160px] w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-500"
                                        >
                                            {options.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                        <span className="mt-2 block text-xs text-slate-500">
                                            Hold Ctrl or Cmd to select multiple options.
                                        </span>
                                    </>
                                ) : field.type === 'textarea' ? (
                                    <textarea
                                        value={value}
                                        onChange={(event) => handleChange(field.name, event.target.value)}
                                        required={isRequired}
                                        rows={4}
                                        placeholder={field.placeholder}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500"
                                    />
                                ) : (
                                    <input
                                        type={field.type}
                                        value={value}
                                        onChange={(event) => handleChange(field.name, event.target.value)}
                                        required={isRequired}
                                        min={field.min}
                                        step={field.step}
                                        placeholder={field.placeholder}
                                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-500"
                                    />
                                )}
                            </label>
                        );
                    })}

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {saving ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : editingItem ? (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save changes
                            </>
                        ) : (
                            <>
                                <Plus className="mr-2 h-4 w-4" />
                                Add record
                            </>
                        )}
                    </button>
                </form>
            </aside>
        </div>
    );
};

export default ResourceManager;
