import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoryManager = ({ backendUrl, adminToken, onUpdated }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form state for creating a top-level or child category
    const [newItemName, setNewItemName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState('');
    const [selectedLevel, setSelectedLevel] = useState(1);
    const [subItemsInput, setSubItemsInput] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl || ''}/api/category/list`);
            if (res.data.success) {
                setCategories(res.data.categories || []);
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to load dynamic menu categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Build category tree or flat list categorized by level
    const topLevelCategories = categories.filter(c => !c.parentId);

    const getChildren = (parentId) => {
        return categories.filter(c => c.parentId && c.parentId.toString() === parentId.toString());
    };

    const handleAddCategory = async (e, parentId = null, level = 1) => {
        if (e) e.preventDefault();
        const nameToUse = parentId ? newItemName : newItemName;
        if (!nameToUse.trim()) {
            toast.error('Please enter category name');
            return;
        }

        try {
            const res = await axios.post(`${backendUrl || ''}/api/category/add`, {
                name: nameToUse.trim(),
                parentId: parentId || null,
                level: level
            }, { headers: { token: adminToken } });

            if (res.data.success) {
                toast.success('Category added successfully!');
                setNewItemName('');
                setSelectedParentId('');
                fetchCategories();
                if (onUpdated) onUpdated();
            } else {
                toast.error(res.data.message || 'Failed to add category');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category and its sub-items?')) return;
        try {
            const res = await axios.post(`${backendUrl || ''}/api/category/remove`, { id }, { headers: { token: adminToken } });
            if (res.data.success) {
                toast.success('Category removed successfully');
                fetchCategories();
                if (onUpdated) onUpdated();
            } else {
                toast.error(res.data.message || 'Failed to remove category');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">🗂️ Dynamic Navbar &amp; Multi-Level Category Manager</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Create up to 4 levels of hover dropdowns (e.g., Phone Case → iPhone → iPhone 17 → Colors/Edition). Changes reflect instantly on user navigation.
                    </p>
                </div>
                <button
                    onClick={fetchCategories}
                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                    🔄 Refresh
                </button>
            </div>

            {/* Add Top-Level Category Form */}
            <form onSubmit={(e) => handleAddCategory(e, null, 1)} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                        Add New Top-Level Menu (Level 1)
                    </label>
                    <input
                        type="text"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        placeholder="e.g. Phone Case, Bag, Eyeglasses, Watch..."
                        className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer whitespace-nowrap"
                >
                    + Add Level 1 Menu
                </button>
            </form>

            {/* Existing Categories Tree View (Up to 4 Levels) */}
            <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">Active Navigation Menu Tree ({categories.length} items total)</h4>
                
                {loading ? (
                    <div className="py-12 text-center text-xs text-gray-400">Loading categories...</div>
                ) : topLevelCategories.length === 0 ? (
                    <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500 text-xs">
                        No custom menu items added yet. Add a Level 1 menu above to get started (e.g. Phone Case).
                    </div>
                ) : (
                    <div className="space-y-4">
                        {topLevelCategories.map((level1) => (
                            <div key={level1._id} className="p-4 bg-gray-50/80 border border-gray-200 rounded-xl space-y-3">
                                {/* Level 1 Header */}
                                <div className="flex items-center justify-between bg-black text-white px-4 py-2.5 rounded-lg shadow-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-500 text-white">Level 1</span>
                                        <span className="font-bold text-sm">{level1.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteCategory(level1._id)}
                                        className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded transition cursor-pointer"
                                    >
                                        Delete Menu
                                    </button>
                                </div>

                                {/* Level 2 Children */}
                                <div className="pl-4 sm:pl-6 space-y-3 border-l-2 border-orange-500/30">
                                    {getChildren(level1._id).map((level2) => (
                                        <div key={level2._id} className="p-3 bg-white border border-gray-200 rounded-xl space-y-2.5 shadow-xs">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-sky-500 text-white">Level 2</span>
                                                    <span className="font-bold text-xs text-gray-900">{level2.name}</span>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteCategory(level2._id)}
                                                    className="text-[11px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </div>

                                            {/* Level 3 Children */}
                                            <div className="pl-4 space-y-2 border-l-2 border-sky-400/30">
                                                {getChildren(level2._id).map((level3) => (
                                                    <div key={level3._id} className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-purple-500 text-white">Level 3</span>
                                                                <span className="font-semibold text-xs text-gray-800">{level3.name}</span>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteCategory(level3._id)}
                                                                className="text-[10px] text-red-600 hover:text-red-700 font-medium cursor-pointer"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>

                                                        {/* Level 4 Children (Max 4 Levels) */}
                                                        <div className="pl-4 space-y-1.5 border-l-2 border-purple-400/30">
                                                            {getChildren(level3._id).map((level4) => (
                                                                <div key={level4._id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-emerald-500 text-white">Level 4</span>
                                                                        <span className="font-medium text-gray-700">{level4.name}</span>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleDeleteCategory(level4._id)}
                                                                        className="text-[10px] text-red-500 hover:text-red-700 cursor-pointer"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            ))}
                                                            
                                                            {/* Add Level 4 Item form */}
                                                            <SubItemAddForm
                                                                parentId={level3._id}
                                                                level={4}
                                                                backendUrl={backendUrl}
                                                                adminToken={adminToken}
                                                                onAdded={fetchCategories}
                                                                placeholder="Add Level 4 sub-item (e.g. specific model)..."
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add Level 3 Item form */}
                                                <SubItemAddForm
                                                    parentId={level2._id}
                                                    level={3}
                                                    backendUrl={backendUrl}
                                                    adminToken={adminToken}
                                                    onAdded={fetchCategories}
                                                    placeholder="Add Level 3 sub-item (e.g. iPhone 17)..."
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add Level 2 Item form */}
                                    <SubItemAddForm
                                        parentId={level1._id}
                                        level={2}
                                        backendUrl={backendUrl}
                                        adminToken={adminToken}
                                        onAdded={fetchCategories}
                                        placeholder="Add Level 2 sub-item (e.g. iPhone, Samsung)..."
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Sub-component for adding sub-items with an Add button next to items
const SubItemAddForm = ({ parentId, level, backendUrl, adminToken, onAdded, placeholder }) => {
    const [name, setName] = useState('');
    const [adding, setAdding] = useState(false);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        try {
            const res = await axios.post(`${backendUrl || ''}/api/category/add`, {
                name: name.trim(),
                parentId,
                level
            }, { headers: { token: adminToken } });

            if (res.data.success) {
                toast.success('Sub-item added successfully!');
                setName('');
                setAdding(false);
                if (onAdded) onAdded();
            } else {
                toast.error(res.data.message || 'Failed to add');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || err.message);
        }
    };

    if (!adding) {
        return (
            <button
                onClick={() => setAdding(true)}
                className="mt-1 px-3 py-1 bg-black/5 hover:bg-black/10 text-black text-xs font-bold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
                <span>+ Add Level {level} Sub-Item</span>
            </button>
        );
    }

    return (
        <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={placeholder}
                autoFocus
                className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
            />
            <button
                type="submit"
                className="px-3 py-1.5 bg-black text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
                Save
            </button>
            <button
                type="button"
                onClick={() => setAdding(false)}
                className="px-2.5 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition cursor-pointer"
            >
                Cancel
            </button>
        </form>
    );
};

export default CategoryManager;
