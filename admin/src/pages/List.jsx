import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { backendUrl, currency } from '../App'
import { toast } from 'react-toastify'

const List = ({ token }) => {
  const [list, setList] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [editPrice, setEditPrice] = useState('')
  const [editDiscount, setEditDiscount] = useState('')
  const [editColors, setEditColors] = useState([])
  const [newColorInput, setNewColorInput] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchList = async () => {
    try {
      const response = await axios.get((backendUrl || '') + '/api/product/list')
      if (response.data.success) {
        setList(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchList()
  }, [])

  const removeProduct = async (id, e) => {
    if (e) e.stopPropagation();
    
    // Optimistic deletion
    const originalList = [...list];
    setList(prev => prev.filter(p => p._id !== id));
    if (selectedProduct && selectedProduct._id === id) {
      setSelectedProduct(null);
    }

    try {
      const activeToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token') || 'admin_secret_token';
      const response = await axios.post(
        (backendUrl || '') + '/api/product/remove',
        { id },
        { headers: { token: activeToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message || 'Product deleted');
      } else {
        toast.error(response.data.message || 'Delete failed');
        setList(originalList);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Delete failed');
      setList(originalList);
    }
  };

  const toggleStock = async (id, outOfStock, e) => {
    if (e) e.stopPropagation();
    try {
      const activeToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
      if (!activeToken) {
        toast.error('Authentication token not found');
        return;
      }
      const response = await axios.post(
        (backendUrl || '') + '/api/product/toggle-stock',
        { id, outOfStock },
        { headers: { token: activeToken } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setList(prev => prev.map(p => p._id === id ? { ...p, outOfStock } : p));
        if (selectedProduct && selectedProduct._id === id) {
          setSelectedProduct(prev => ({ ...prev, outOfStock }));
        }
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const openProductModal = (product) => {
    setSelectedProduct(product);
    setEditPrice(product.price || '');
    setEditDiscount(product.discount || 0);
    setEditColors(Array.isArray(product.colors) ? [...product.colors] : []);
    setNewColorInput('');
  };

  const handleAddColor = () => {
    if (!newColorInput.trim()) return;
    const colorVal = newColorInput.trim();
    if (!editColors.includes(colorVal)) {
      setEditColors([...editColors, colorVal]);
    }
    setNewColorInput('');
  };

  const handleRemoveColor = (colorToRemove) => {
    setEditColors(editColors.filter(c => c !== colorToRemove));
  };

  const handleSaveChanges = async () => {
    if (!selectedProduct) return;
    setIsUpdating(true);
    try {
      const activeToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.post(
        (backendUrl || '') + '/api/product/update',
        {
          id: selectedProduct._id,
          price: Number(editPrice),
          discount: Number(editDiscount),
          colors: editColors
        },
        { headers: { token: activeToken } }
      );

      if (response.data.success) {
        toast.success("Product updated successfully!");
        const updated = response.data.product || { 
          ...selectedProduct, 
          price: Number(editPrice), 
          discount: Number(editDiscount), 
          colors: editColors 
        };
        setSelectedProduct(updated);
        setList(prev => prev.map(p => p._id === updated._id ? updated : p));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemoveComment = async (reviewId) => {
    if (!selectedProduct || !reviewId) return;
    if (!window.confirm("Are you sure you want to remove this comment from database?")) return;
    try {
      const activeToken = token || localStorage.getItem('adminToken') || localStorage.getItem('token');
      const response = await axios.post(
        (backendUrl || '') + '/api/product/review/delete',
        {
          productId: selectedProduct._id,
          reviewId,
          isAdmin: true
        },
        { headers: { token: activeToken } }
      );

      if (response.data.success) {
        toast.success("Comment removed successfully!");
        const updated = response.data.product;
        setSelectedProduct(updated);
        setList(prev => prev.map(p => p._id === updated._id ? updated : p));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h2 className='font-bold text-lg text-gray-900'>Product Inventory & Stock Management</h2>
          <p className='text-xs text-gray-500'>Click on any product to edit price, discount, color variants or manage comments.</p>
        </div>
        <span className='text-xs font-bold bg-black text-white px-3 py-1 rounded-full'>
          Total: {list.length} Items
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        {/* List Table Title */}
        <div className='hidden md:grid grid-cols-[1fr_2.5fr_1fr_1fr_1.5fr_1.2fr] items-center py-2 px-3 border bg-gray-100 text-xs font-bold uppercase text-gray-700 rounded-lg'>
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b className='text-center'>Stock Status</b>
          <b className='text-center'>Actions</b>
        </div>

        {/* Product List */}
        {list.map((item, index) => (
          <div 
            key={index}
            onClick={() => openProductModal(item)}
            className='grid grid-cols-[1fr_2fr_1.5fr_0.8fr] md:grid-cols-[1fr_2.5fr_1fr_1fr_1.5fr_1.2fr] items-center gap-2 py-2.5 px-3 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 transition cursor-pointer group shadow-2xs'
          >
            <img className='w-12 h-12 object-cover rounded-lg border border-gray-200 group-hover:scale-105 transition' src={item.images?.[0] || item.image?.[0] || 'placeholder.jpg'} alt={item.name} />
            <div>
              <p className='font-bold text-gray-900 group-hover:text-blue-600 transition flex items-center gap-1.5'>
                <span>{item.name}</span>
                <span className='text-[10px] bg-gray-100 text-gray-600 font-semibold px-1.5 py-0.5 rounded'>👁️ View</span>
              </p>
              {item.outOfStock && <span className='md:hidden text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded'>Out of Stock</span>}
            </div>
            <p className='text-gray-600 text-xs'>{item.category}</p>
            <div>
              <p className='font-bold text-gray-900'>{currency}{item.price}</p>
              {item.discount > 0 && <span className='text-[10px] font-bold text-red-500'>-{item.discount}% Off</span>}
            </div>
            
            {/* Stock Toggle Button */}
            <div className='flex items-center justify-center' onClick={e => e.stopPropagation()}>
              <button
                type="button"
                onClick={(e) => toggleStock(item._id, !item.outOfStock, e)}
                className={`px-3 py-1.5 text-xs font-bold rounded-full transition shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                  item.outOfStock 
                    ? 'bg-red-50 text-red-700 border border-red-300 hover:bg-red-100' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                }`}
                title="Click to toggle product stock availability"
              >
                <span className={`w-2 h-2 rounded-full ${item.outOfStock ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                <span>{item.outOfStock ? 'Out of Stock' : 'In Stock'}</span>
              </button>
            </div>

            <div className='flex items-center justify-center gap-2' onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => openProductModal(item)} 
                className='text-blue-600 hover:text-blue-800 font-bold px-2 py-1 hover:bg-blue-50 rounded transition text-xs'
                title="View Details & Edit"
              >
                ✏️ Edit
              </button>
              <button 
                onClick={(e) => removeProduct(item._id, e)} 
                className='text-red-500 hover:text-red-700 font-bold px-2 py-1 hover:bg-red-50 rounded transition text-xs'
                title="Delete Product"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADMIN PRODUCT DETAILS & QUICK EDIT MODAL */}
      {selectedProduct && (
        <div 
          className='fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn'
          onClick={() => setSelectedProduct(null)}
        >
          <div 
            className='bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto border border-gray-200'
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='flex items-start justify-between border-b pb-4'>
              <div className='flex items-center gap-4'>
                <img 
                  src={selectedProduct.images?.[0] || selectedProduct.image?.[0] || 'placeholder.jpg'} 
                  alt={selectedProduct.name} 
                  className='w-16 h-16 object-cover rounded-xl border border-gray-200 shadow-2xs'
                />
                <div>
                  <h3 className='font-bold text-lg text-gray-900'>{selectedProduct.name}</h3>
                  <div className='flex items-center gap-2 text-xs text-gray-500 mt-0.5'>
                    <span className='bg-gray-100 text-gray-700 font-semibold px-2 py-0.5 rounded'>{selectedProduct.category}</span>
                    <span>•</span>
                    <span className='font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200'>
                      🔥 {selectedProduct.salesCount || 0} sold
                    </span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedProduct(null)}
                className='text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full cursor-pointer transition'
              >
                ✕
              </button>
            </div>

            {/* Quick Edit Controls (Price, Discount, Colors) */}
            <div className='bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4'>
              <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2'>
                <span>⚙️ Edit Price & Color Variants</span>
              </h4>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                {/* Price Edit */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 mb-1'>
                    Product Price ({currency})
                  </label>
                  <input 
                    type="number" 
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    placeholder="Enter price"
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm font-bold bg-white focus:outline-none focus:border-black'
                  />
                </div>

                {/* Discount Edit */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 mb-1'>
                    Discount Percentage (%)
                  </label>
                  <input 
                    type="number" 
                    value={editDiscount}
                    onChange={(e) => setEditDiscount(e.target.value)}
                    min="0"
                    max="99"
                    placeholder="Enter discount %"
                    className='w-full border border-gray-300 rounded-lg p-2 text-sm font-bold bg-white focus:outline-none focus:border-black'
                  />
                </div>
              </div>

              {/* Color Variants Manager */}
              <div>
                <label className='block text-xs font-bold text-gray-700 mb-1'>
                  Color Variants (আরও কালার প্রোডাক্ট অ্যাড করুন)
                </label>
                <div className='flex flex-wrap gap-2 mb-2 min-h-[32px] items-center'>
                  {editColors.length > 0 ? (
                    editColors.map((col, idx) => (
                      <span key={idx} className='bg-white border border-gray-300 text-gray-800 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-2xs'>
                        <span>{col}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveColor(col)} 
                          className='text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer'
                          title="Remove color"
                        >
                          ✕
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className='text-xs text-gray-400 italic'>No color variants added yet.</span>
                  )}
                </div>

                {/* Add New Color Input */}
                <div className='flex flex-col sm:flex-row gap-2'>
                  <input 
                    type="text" 
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    placeholder="Add color (e.g. Navy, Rose Gold)"
                    className='flex-1 border border-gray-300 rounded-lg p-2.5 sm:p-2 text-sm sm:text-xs bg-white focus:outline-none focus:border-black'
                  />
                  <button 
                    type="button"
                    onClick={handleAddColor}
                    className='w-full sm:w-auto bg-black text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-xs font-bold hover:bg-neutral-800 cursor-pointer transition shrink-0'
                  >
                    + Add Color
                  </button>
                </div>
              </div>

              <button 
                type="button"
                onClick={handleSaveChanges}
                disabled={isUpdating}
                className='w-full bg-emerald-600 text-white font-bold py-2.5 rounded-xl hover:bg-emerald-700 transition cursor-pointer shadow-xs disabled:opacity-50 text-xs uppercase tracking-wider'
              >
                {isUpdating ? 'Saving Changes...' : '💾 Save Product Changes'}
              </button>
            </div>

            {/* Customer Reviews Section (Read-Only for Admin per author-only policy) */}
            <div className='space-y-3 pt-2'>
              <div className='flex items-center justify-between border-b pb-2'>
                <h4 className='font-bold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2'>
                  <span>💬 Customer Reviews</span>
                  <span className='bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full'>
                    {selectedProduct.reviews?.length || 0}
                  </span>
                </h4>
                <span className='text-[10px] text-gray-500 italic'>
                  *শুধুমাত্র কমেন্টকারী ইউজার নিজে ওয়েবসাইট থেকে তার কমেন্ট রিমুভ করতে পারবেন
                </span>
              </div>

              {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                <div className='space-y-2.5 max-h-60 overflow-y-auto pr-1'>
                  {selectedProduct.reviews.map((rev, idx) => (
                    <div key={rev._id || idx} className='p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-start justify-between gap-3'>
                      <div>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-bold text-xs text-gray-900'>{rev.userName || 'Customer'}</span>
                          <span className='text-amber-500 text-xs font-medium'>{'★'.repeat(rev.rating)}{'☆'.repeat(5-rev.rating)}</span>
                          {rev.date && (
                            <span className='text-[10px] text-gray-400'>
                              {new Date(rev.date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <p className='text-xs text-gray-700'>{rev.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className='py-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200'>
                  No comments or reviews submitted for this product yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='flex justify-end pt-2 border-t'>
              <button 
                onClick={() => setSelectedProduct(null)}
                className='bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer transition'
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default List

