import React, { useState, useContext, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import ProductItem from '../components/ProductItem';


const Collection = () => {
  const {products, search, showSearch} = useContext(ShopContext);
  const [showFilter, setShowFilter] = useState(false);
  const [filterProducts, setFilterProducts] = useState([]);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  const toggleCategory = (e) => {
    if(category.includes(e.target.value)){
      setCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setCategory(prev => [...prev, e.target.value])
    }
  }

  const toggleSubCategory = (e) => {
    if(subCategory.includes(e.target.value)){
      setSubCategory(prev => prev.filter(item => item !== e.target.value));
    }
    else{
      setSubCategory(prev => [...prev, e.target.value])
    }
  }

  const applyFilter = () => {
    let productsCopy = products.slice();
    if(search && search.trim() !== ''){
      const query = search.trim().toLowerCase();
      productsCopy = productsCopy.filter(item => 
        (item.name && item.name.toLowerCase().includes(query)) ||
        (item.category && item.category.toLowerCase().includes(query)) ||
        (item.subCategory && item.subCategory.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }
    if(category.length > 0){
      productsCopy = productsCopy.filter(item => category.includes(item.category))
    }
    if(subCategory.length > 0){
      productsCopy = productsCopy.filter(item => subCategory.includes(item.subCategory || item.subcategory))
    }
    setFilterProducts(productsCopy)
  }

  const sortProduct = () => {
    let fpCopy = filterProducts.slice();
    switch (sortType){
      case 'low-high':
        setFilterProducts(fpCopy.sort((a,b)=>(a.price-b.price)));
        break;
      case 'high-low':
        setFilterProducts(fpCopy.sort((a,b)=>(b.price-a.price)));
        break;
      default:
        applyFilter();
        break;
    }
  }
  useEffect(()=>{
    applyFilter();
  }, [category, subCategory, search, showSearch, products])
  useEffect(()=>{
    sortProduct();
  }, [sortType])
  return (
    <div className='flex flex-col sm:flex-row gap-6 sm:gap-10 pt-8 border-t border-gray-100'>
      {/* Filter Sidebar */}
      <div className='min-w-64'> 
        <div className='flex items-center justify-between my-2'>
          <button 
            type="button"
            onClick={()=>setShowFilter(!showFilter)} 
            className='text-lg font-bold flex items-center cursor-pointer gap-2 tracking-wide text-gray-900'
          >
            <span>FILTERS</span>
            <img className={`h-3 sm:hidden transition-transform duration-200 ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt="" />
          </button>
          {(category.length > 0 || subCategory.length > 0) && (
            <button
              onClick={() => { setCategory([]); setSubCategory([]); }}
              className='text-xs font-semibold text-red-500 hover:text-red-700 transition'
            >
              Reset All
            </button>
          )}
        </div>

        <div className={`${showFilter ? 'block' : 'hidden'} sm:block space-y-5 mt-4`}>
          {/* Category Filter Card */} 
          <div className='bg-neutral-50/70 border border-gray-200/80 rounded-2xl p-5 shadow-xs transition hover:border-gray-300'> 
            <div className='flex items-center justify-between mb-3.5'>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-800'>Categories</p>
              {category.length > 0 && (
                <span className='bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full'>
                  {category.length}
                </span>
              )}
            </div>
            <div className='flex flex-col gap-2.5 text-sm text-gray-700'>
              {[
                { name: 'Gadgets', count: products.filter(p => p.category === 'Gadgets').length },
                { name: 'Fidget & EDC', count: products.filter(p => p.category === 'Fidget & EDC').length },
                { name: 'Electronics', count: products.filter(p => p.category === 'Electronics').length },
                { name: 'Accessories', count: products.filter(p => p.category === 'Accessories').length }
              ].map(cat => {
                const isSelected = category.includes(cat.name);
                return (
                  <label 
                    key={cat.name} 
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition select-none ${
                      isSelected ? 'bg-black text-white font-medium shadow-xs' : 'hover:bg-gray-100/80 text-gray-700'
                    }`}
                  >
                    <div className='flex items-center gap-3'>
                      <input 
                        className='hidden' 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={toggleCategory} 
                        value={cat.name}
                      />
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border transition ${
                        isSelected ? 'bg-white border-white text-black' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && (
                          <svg className="w-3 h-3 text-black stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                      <span className='text-xs sm:text-sm'>{cat.name}</span>
                    </div>
                    {cat.count > 0 && (
                      <span className={`text-[11px] px-1.5 py-0.5 rounded-md ${
                        isSelected ? 'bg-white/20 text-white' : 'text-gray-400'
                      }`}>
                        {cat.count}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Subcategory Type Filter Card */}
          <div className='bg-neutral-50/70 border border-gray-200/80 rounded-2xl p-5 shadow-xs transition hover:border-gray-300'> 
            <div className='flex items-center justify-between mb-3.5'>
              <p className='text-xs font-bold uppercase tracking-wider text-gray-800'>Product Type</p>
              {subCategory.length > 0 && (
                <span className='bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full'>
                  {subCategory.length}
                </span>
              )}
            </div>
            <div className='flex flex-wrap gap-2'>
              {['Fidget Toys', 'EDC Gear', 'Audio', 'Wearables', 'Desk Gadgets', 'Gaming', 'Power & Charging', 'Smart Devices'].map(type => {
                const isSelected = subCategory.includes(type);
                return (
                  <button
                    type="button"
                    key={type}
                    onClick={() => toggleSubCategory({ target: { value: type } })}
                    className={`text-xs px-3.5 py-2 rounded-xl font-medium transition cursor-pointer border ${
                      isSelected
                        ? 'bg-black text-white border-black shadow-xs'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Right side Products Grid */}
      <div className='flex-1'>
        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6'>
          <Title text1={'ALL'} text2={'COLLECTIONS'} />
          
          {/* Exclusive Product Sort Dropdown */}
          <div className='flex items-center gap-2 self-end sm:self-auto'>
            <span className='text-xs text-gray-400 uppercase tracking-wider font-semibold hidden md:inline'>Sort By:</span>
            <div className='relative'>
              <select 
                value={sortType}
                onChange={(e)=>setSortType(e.target.value)} 
                className="appearance-none bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-800 pl-4 pr-9 py-2.5 shadow-xs hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black cursor-pointer transition"
              >
                <option value="relevant">Featured / Relevant</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Map Products */}
        {filterProducts.length === 0 ? (
          <div className='py-20 text-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 p-8'>
            <div className='w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400'>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <p className='text-base font-semibold text-gray-800'>No products found</p>
            <p className='text-xs mt-1 text-gray-400 max-w-sm mx-auto'>We couldn't find any products matching your active filters. Try clearing your search term or filter tags.</p>
            <button
              onClick={() => { setCategory([]); setSubCategory([]); }}
              className='mt-4 text-xs font-semibold bg-black text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition'
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className='columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 md:gap-5'>
            {filterProducts.map((item, index)=>(
              <ProductItem key={index} name={item.name} id={item._id} price={item.price} image={item.images || item.image} discount={item.discount} outOfStock={item.outOfStock} salesCount={item.salesCount} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Collection;
