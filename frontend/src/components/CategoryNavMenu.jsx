import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';

const CategoryNavMenu = () => {
  const { categories, products } = useContext(ShopContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Desktop active hover branch states
  const [activeL1, setActiveL1] = useState(null);
  const [activeL2, setActiveL2] = useState(null);
  const [activeL3, setActiveL3] = useState(null);
  const hoverTimeoutRef = useRef(null);

  // Mobile Drill-Down states (luxury.com.bd style)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileNavStack, setMobileNavStack] = useState([]); // array of category objects

  // Close menus on route changes
  useEffect(() => {
    setActiveL1(null);
    setActiveL2(null);
    setActiveL3(null);
    setMobileDrawerOpen(false);
    setMobileNavStack([]);
  }, [location.pathname, location.search]);

  if (!categories || categories.length === 0) {
    return null;
  }

  // Level 1 top-level categories
  const level1Items = categories.filter(c => !c.parentId || c.level === 1);
  if (level1Items.length === 0) return null;

  const getChildren = (parentId) => {
    if (!parentId) return [];
    return categories.filter(c => c.parentId && String(c.parentId) === String(parentId));
  };

  // Product counter helper
  const getProductCount = (categoryName) => {
    if (!products || !Array.isArray(products)) return 0;
    const target = (categoryName || '').toLowerCase().trim();
    return products.filter(p => {
      const inCat = p.category && p.category.toLowerCase().trim() === target;
      const inSub = (p.subCategory || p.subcategory) && (p.subCategory || p.subcategory).toLowerCase().trim() === target;
      const inPath = Array.isArray(p.categoryPath) && p.categoryPath.some(cp => cp && cp.toLowerCase().trim() === target);
      return inCat || inSub || inPath;
    }).length;
  };

  // Navigate to collection with category filter
  const goToCollection = (item, path = []) => {
    setActiveL1(null);
    setActiveL2(null);
    setActiveL3(null);
    setMobileDrawerOpen(false);
    setMobileNavStack([]);

    const fullPath = path.length > 0 ? path : [item.name];
    const categoryQuery = encodeURIComponent(item.name);
    const filterQuery = encodeURIComponent(fullPath.join(' > '));
    navigate(`/collection?category=${categoryQuery}&filter=${filterQuery}`);
  };

  // --- Desktop Hover Handlers ---
  const handleMouseEnterL1 = (item) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveL1(item);
    setActiveL2(null);
    setActiveL3(null);
  };

  const handleMouseLeaveDesktop = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveL1(null);
      setActiveL2(null);
      setActiveL3(null);
    }, 200);
  };

  // --- Mobile Drill-Down Handlers ---
  const currentMobileParent = mobileNavStack.length > 0 ? mobileNavStack[mobileNavStack.length - 1] : null;
  const currentMobileItems = currentMobileParent 
    ? getChildren(currentMobileParent._id) 
    : level1Items;

  const handleMobileDrillIn = (e, item) => {
    e.stopPropagation();
    setMobileNavStack(prev => [...prev, item]);
  };

  const handleMobileBack = () => {
    setMobileNavStack(prev => prev.slice(0, -1));
  };

  const l2Children = activeL1 ? getChildren(activeL1._id) : [];
  const l3Children = activeL2 ? getChildren(activeL2._id) : [];
  const l4Children = activeL3 ? getChildren(activeL3._id) : [];

  return (
    <>
      {/* =========================================================================
          DESKTOP LUXURY MEGA-MENU: Cascading Branches with Multi-Columns
          ========================================================================= */}
      <nav 
        aria-label="Categories Desktop"
        className="hidden md:block relative border-t border-b border-zinc-200/70 py-2.5 my-1.5 z-40 bg-white select-none"
        onMouseLeave={handleMouseLeaveDesktop}
      >
        {/* Top Horizontal Category Bar (luxury.com.bd style) */}
        <div className="flex items-center justify-center gap-6 lg:gap-8 overflow-x-auto no-scrollbar px-4">
          {level1Items.map((l1) => {
            const children = getChildren(l1._id);
            const hasChildren = children.length > 0;
            const isActive = activeL1 && String(activeL1._id) === String(l1._id);

            return (
              <div 
                key={l1._id}
                className="relative group py-1"
                onMouseEnter={() => handleMouseEnterL1(l1)}
              >
                <div className="flex items-center gap-1">
                  {/* Category Name Link: Direct access on click */}
                  <button
                    type="button"
                    onClick={() => goToCollection(l1, [l1.name])}
                    className={`text-[13px] font-semibold tracking-wide transition-colors py-1 cursor-pointer flex items-center gap-1.5 ${
                      isActive 
                        ? 'text-black font-extrabold' 
                        : 'text-zinc-700 hover:text-black'
                    }`}
                  >
                    <span>{l1.name}</span>
                    {hasChildren && (
                      <span className="m-menu__arrow text-zinc-400 group-hover:text-black transition-transform duration-200">
                        <svg className={`w-3 h-3 fill-current ${isActive ? 'rotate-180 text-black' : ''}`} viewBox="0 0 448 512">
                          <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"/>
                        </svg>
                      </span>
                    )}
                  </button>

                  {/* Active bottom bar indicator */}
                  {isActive && (
                    <span className="absolute -bottom-2.5 left-0 right-0 h-0.5 bg-black rounded-full" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Cascading Multi-Column Mega Menu (luxury.com.bd style) */}
        {activeL1 && l2Children.length > 0 && (
          <div 
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-zinc-200 shadow-2xl rounded-2xl overflow-hidden flex z-50 animate-fadeIn"
            onMouseEnter={() => {
              if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            }}
            onMouseLeave={handleMouseLeaveDesktop}
            style={{ minHeight: '220px', maxHeight: '460px' }}
          >
            {/* Column 1: Level 2 Items (e.g. iPhone, Samsung, Vivo) */}
            <div className="w-60 py-3 border-r border-zinc-100 overflow-y-auto bg-zinc-50/40">
              <div className="px-4 py-2 mb-1 border-b border-zinc-100 flex items-center justify-between">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 truncate">
                  {activeL1.name}
                </span>
                <button
                  type="button"
                  onClick={() => goToCollection(activeL1, [activeL1.name])}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                >
                  <span>All ({getProductCount(activeL1.name)})</span>
                  <span>↗</span>
                </button>
              </div>

              {l2Children.map((l2) => {
                const children = getChildren(l2._id);
                const hasSub = children.length > 0;
                const isSelected = activeL2 && String(activeL2._id) === String(l2._id);

                return (
                  <div
                    key={l2._id}
                    onMouseEnter={() => {
                      if (hasSub) {
                        setActiveL2(l2);
                        setActiveL3(null);
                      } else {
                        setActiveL2(null);
                        setActiveL3(null);
                      }
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 mx-2 my-0.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                      isSelected 
                        ? 'bg-zinc-900 text-white shadow-xs' 
                        : 'text-zinc-700 hover:bg-zinc-200/70 hover:text-black'
                    }`}
                  >
                    {/* Left: Direct Clickable Category Link */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToCollection(l2, [activeL1.name, l2.name]);
                      }}
                      className="truncate flex-1 text-left cursor-pointer hover:underline"
                    >
                      {l2.name}
                    </button>

                    {/* Right: Sub-Arrow indicator to open branch */}
                    {hasSub ? (
                      <div 
                        onClick={() => {
                          setActiveL2(isSelected ? null : l2);
                          setActiveL3(null);
                        }}
                        className="flex items-center gap-1 pl-2 shrink-0 cursor-pointer"
                        title="Expand branch"
                      >
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                          isSelected 
                            ? 'bg-zinc-800 text-zinc-300' 
                            : 'bg-zinc-200 text-zinc-600'
                        }`}>
                          All ↗
                        </span>
                        <svg className={`w-3.5 h-3.5 fill-current ${isSelected ? 'text-white' : 'text-zinc-400'}`} viewBox="0 0 448 512">
                          <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" transform="rotate(-90 224 256)"/>
                        </svg>
                      </div>
                    ) : (
                      <span className={`text-[10px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                        ({getProductCount(l2.name)})
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Column 2: Level 3 Items (e.g. iphone 17, iphone 18) */}
            {activeL2 && l3Children.length > 0 && (
              <div className="w-60 py-3 border-r border-zinc-100 overflow-y-auto bg-white animate-fadeIn">
                <div className="px-4 py-2 mb-1 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 truncate">
                    {activeL2.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToCollection(activeL2, [activeL1.name, activeL2.name])}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <span>All ({getProductCount(activeL2.name)})</span>
                    <span>↗</span>
                  </button>
                </div>

                {l3Children.map((l3) => {
                  const children = getChildren(l3._id);
                  const hasSub = children.length > 0;
                  const isSelected = activeL3 && String(activeL3._id) === String(l3._id);

                  return (
                    <div
                      key={l3._id}
                      onMouseEnter={() => {
                        if (hasSub) {
                          setActiveL3(l3);
                        } else {
                          setActiveL3(null);
                        }
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 mx-2 my-0.5 rounded-xl text-xs font-semibold cursor-pointer transition ${
                        isSelected 
                          ? 'bg-zinc-900 text-white shadow-xs' 
                          : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          goToCollection(l3, [activeL1.name, activeL2.name, l3.name]);
                        }}
                        className="truncate flex-1 text-left cursor-pointer hover:underline"
                      >
                        {l3.name}
                      </button>

                      {hasSub ? (
                        <div 
                          onClick={() => setActiveL3(isSelected ? null : l3)}
                          className="flex items-center gap-1 pl-2 shrink-0 cursor-pointer"
                        >
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded transition ${
                            isSelected 
                              ? 'bg-zinc-800 text-zinc-300' 
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            All ↗
                          </span>
                          <svg className={`w-3.5 h-3.5 fill-current ${isSelected ? 'text-white' : 'text-zinc-400'}`} viewBox="0 0 448 512">
                            <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z" transform="rotate(-90 224 256)"/>
                          </svg>
                        </div>
                      ) : (
                        <span className={`text-[10px] ${isSelected ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          ({getProductCount(l3.name)})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Column 3: Level 4 Items (Final leaf branch) */}
            {activeL3 && l4Children.length > 0 && (
              <div className="w-60 py-3 overflow-y-auto bg-zinc-50/40 animate-fadeIn">
                <div className="px-4 py-2 mb-1 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 truncate">
                    {activeL3.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToCollection(activeL3, [activeL1.name, activeL2.name, activeL3.name])}
                    className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-0.5 cursor-pointer shrink-0"
                  >
                    <span>All</span>
                    <span>↗</span>
                  </button>
                </div>

                {l4Children.map((l4) => (
                  <div
                    key={l4._id}
                    onClick={() => goToCollection(l4, [activeL1.name, activeL2.name, activeL3.name, l4.name])}
                    className="px-3.5 py-2.5 mx-2 my-0.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition text-zinc-700 hover:bg-zinc-900 hover:text-white"
                  >
                    <span className="truncate flex-1 pr-2">{l4.name}</span>
                    <span className="text-[10px] text-zinc-400">
                      ({getProductCount(l4.name)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* =========================================================================
          MOBILE LUXURY DRILL-DOWN NAVIGATION: Matches luxury.com.bd
          ========================================================================= */}
      <div className="block md:hidden my-2">
        {/* Mobile Category Trigger Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-1 py-1">
          <button
            type="button"
            onClick={() => {
              setMobileNavStack([]);
              setMobileDrawerOpen(true);
            }}
            className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-3.5 py-2 rounded-xl shrink-0 shadow-xs cursor-pointer active:scale-95 transition"
          >
            <span>☰ Categories</span>
            <svg className="w-3 h-3 fill-current ml-0.5" viewBox="0 0 448 512">
              <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"/>
            </svg>
          </button>

          {/* Quick horizontal top-level category pills */}
          {level1Items.map((l1) => {
            const hasChildren = getChildren(l1._id).length > 0;
            return (
              <button
                key={l1._id}
                type="button"
                onClick={() => {
                  if (hasChildren) {
                    setMobileNavStack([l1]);
                    setMobileDrawerOpen(true);
                  } else {
                    goToCollection(l1, [l1.name]);
                  }
                }}
                className="text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-xl shrink-0 cursor-pointer flex items-center gap-1 active:scale-95 transition"
              >
                <span>{l1.name}</span>
                {hasChildren && <span className="text-[10px] text-zinc-400">›</span>}
              </button>
            );
          })}
        </div>

        {/* Mobile luxury.com.bd Slide-in Drawer with Multi-level Drill-Down */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div 
              className="bg-white w-4/5 max-w-sm h-full shadow-2xl flex flex-col overflow-hidden animate-slideRight"
            >
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/90">
                {mobileNavStack.length > 0 ? (
                  /* luxury.com.bd .m-menu-mobile__back-button */
                  <button
                    type="button"
                    onClick={handleMobileBack}
                    className="flex items-center gap-2 text-xs font-bold text-zinc-900 cursor-pointer active:scale-95 transition"
                  >
                    <svg className="w-4 h-4 fill-current rotate-90" viewBox="0 0 448 512">
                      <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"/>
                    </svg>
                    <span>Back</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">Categories</span>
                    <span className="text-[10px] font-bold bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-full">
                      {level1Items.length}
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-sm cursor-pointer"
                  title="Close"
                >
                  ✕
                </button>
              </div>

              {/* Drill-down Breadcrumb / Active Parent Banner */}
              {currentMobileParent && (
                <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-100 flex items-center justify-between">
                  <div className="truncate">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400 block">Current Category</span>
                    <h4 className="text-sm font-bold text-zinc-900 truncate">{currentMobileParent.name}</h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const path = mobileNavStack.map(h => h.name);
                      goToCollection(currentMobileParent, path);
                    }}
                    className="text-xs font-bold text-orange-600 bg-orange-50 border border-orange-200/80 px-2.5 py-1 rounded-lg hover:bg-orange-100 cursor-pointer"
                  >
                    View All ↗
                  </button>
                </div>
              )}

              {/* Drill-Down Items List: matches luxury.com.bd .m-menu-mobile */}
              <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
                {currentMobileItems.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 text-xs">
                    No sub-categories available.
                  </div>
                ) : (
                  currentMobileItems.map((item) => {
                    const children = getChildren(item._id);
                    const hasChildren = children.length > 0;
                    const count = getProductCount(item.name);

                    return (
                      /* .m-menu-mobile__item */
                      <div
                        key={item._id}
                        className="flex items-center justify-between hover:bg-zinc-50 transition"
                      >
                        {/* Left Link: Direct navigation to that category */}
                        <button
                          type="button"
                          onClick={() => {
                            const path = [...mobileNavStack.map(h => h.name), item.name];
                            goToCollection(item, path);
                          }}
                          className="flex-1 text-left px-4 py-3.5 text-xs sm:text-sm font-semibold text-zinc-800 hover:text-black flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{item.name}</span>
                          {count > 0 && (
                            <span className="text-[11px] text-zinc-400 font-normal ml-2">
                              ({count})
                            </span>
                          )}
                        </button>

                        {/* Right Toggle Button: Opens sub-panel on mobile (48px square touch target) */}
                        {hasChildren && (
                          <button
                            type="button"
                            onClick={(e) => handleMobileDrillIn(e, item)}
                            className="m-menu-mobile__toggle-button w-12 h-12 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-zinc-100 cursor-pointer shrink-0 border-l border-zinc-100"
                            title={`Open ${item.name} sub-categories`}
                          >
                            <svg className="w-3.5 h-3.5 fill-current -rotate-90" viewBox="0 0 448 512">
                              <path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Drawer Footer */}
              <div className="p-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/collection');
                    setMobileDrawerOpen(false);
                  }}
                  className="font-bold text-zinc-900 hover:underline cursor-pointer"
                >
                  Browse All Collections →
                </button>
              </div>
            </div>

            {/* Backdrop click to close */}
            <div 
              className="flex-1 cursor-pointer" 
              onClick={() => setMobileDrawerOpen(false)} 
            />
          </div>
        )}
      </div>
    </>
  );
};

export default CategoryNavMenu;
