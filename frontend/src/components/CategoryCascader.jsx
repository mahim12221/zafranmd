import React, { useState, useRef, useEffect } from 'react';

const CategoryCascader = ({ categories = [], value = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Selection state inside modal before confirmation
  const [selectedL1, setSelectedL1] = useState(null);
  const [selectedL2, setSelectedL2] = useState(null);
  const [selectedL3, setSelectedL3] = useState(null);
  const [selectedL4, setSelectedL4] = useState(null);

  // Search filter states for each column
  const [searchL1, setSearchL1] = useState('');
  const [searchL2, setSearchL2] = useState('');
  const [searchL3, setSearchL3] = useState('');
  const [searchL4, setSearchL4] = useState('');

  // Mobile drill-down step stack (array of category objects)
  const [mobileStack, setMobileStack] = useState([]);

  const columnsContainerRef = useRef(null);

  // Sync internal state when opened or value changes
  useEffect(() => {
    if (isOpen && Array.isArray(value) && value.length > 0 && categories.length > 0) {
      const l1 = categories.find(c => (!c.parentId || c.level === 1) && c.name === value[0]);
      if (l1) {
        setSelectedL1(l1);
        const l2 = categories.find(c => c.parentId && String(c.parentId) === String(l1._id) && c.name === value[1]);
        if (l2) {
          setSelectedL2(l2);
          const l3 = categories.find(c => c.parentId && String(c.parentId) === String(l2._id) && c.name === value[2]);
          if (l3) {
            setSelectedL3(l3);
            const l4 = categories.find(c => c.parentId && String(c.parentId) === String(l3._id) && c.name === value[3]);
            if (l4) setSelectedL4(l4);
          }
        }
      }
    }
  }, [isOpen, value, categories]);

  const level1Items = categories.filter(c => !c.parentId || c.level === 1);

  const getChildren = (parentId) => {
    if (!parentId) return [];
    return categories.filter(c => c.parentId && String(c.parentId) === String(parentId));
  };

  // Helper to commit selection to form
  const commitSelection = (chosenCategory, pathArray) => {
    const fullPath = pathArray.map(item => item.name);
    const rootCategory = fullPath[0] || chosenCategory.name;
    const finalSub = fullPath[fullPath.length - 1] || chosenCategory.name;

    onChange({
      path: fullPath,
      category: rootCategory,
      subCategory: finalSub
    });
    setIsOpen(false);
  };

  // Auto-scroll columns container on desktop when child opened
  const scrollToRight = () => {
    setTimeout(() => {
      if (columnsContainerRef.current) {
        columnsContainerRef.current.scrollTo({
          left: columnsContainerRef.current.scrollWidth,
          behavior: 'smooth'
        });
      }
    }, 50);
  };

  const handleSelectL1 = (item) => {
    setSelectedL1(item);
    setSelectedL2(null);
    setSelectedL3(null);
    setSelectedL4(null);
    setSearchL2('');
    setSearchL3('');
    setSearchL4('');
    scrollToRight();
  };

  const handleSelectL2 = (item) => {
    setSelectedL2(item);
    setSelectedL3(null);
    setSelectedL4(null);
    setSearchL3('');
    setSearchL4('');
    scrollToRight();
  };

  const handleSelectL3 = (item) => {
    setSelectedL3(item);
    setSelectedL4(null);
    setSearchL4('');
    scrollToRight();
  };

  const handleSelectL4 = (item) => {
    setSelectedL4(item);
  };

  // Calculate current assembled path
  const currentPath = [selectedL1, selectedL2, selectedL3, selectedL4].filter(Boolean);

  // Column children
  const l2Children = selectedL1 ? getChildren(selectedL1._id) : [];
  const l3Children = selectedL2 ? getChildren(selectedL2._id) : [];
  const l4Children = selectedL3 ? getChildren(selectedL3._id) : [];

  // Mobile drill-down current parent
  const mobileCurrentParent = mobileStack.length > 0 ? mobileStack[mobileStack.length - 1] : null;
  const mobileCurrentItems = mobileCurrentParent ? getChildren(mobileCurrentParent._id) : level1Items;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[11px] font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
          <span>Dynamic Category Selection</span>
          <span className="text-[10px] text-zinc-400 font-normal">(Multi-level)</span>
        </label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange({ path: [], category: '', subCategory: '' })}
            className="text-[10px] text-red-500 hover:text-red-700 font-bold hover:underline cursor-pointer"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Trigger Box in Form */}
      <div 
        onClick={() => setIsOpen(true)}
        className="w-full min-h-[48px] rounded-xl border border-gray-200 bg-white p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:border-black/50 hover:shadow-xs transition duration-200"
      >
        {value && value.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {value.map((seg, idx) => (
              <React.Fragment key={idx}>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                  idx === value.length - 1 
                    ? 'bg-zinc-950 text-white shadow-xs' 
                    : 'bg-zinc-100 text-zinc-800 border border-zinc-200'
                }`}>
                  {seg}
                </span>
                {idx < value.length - 1 && (
                  <span className="text-zinc-400 text-xs font-bold">›</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>Click to browse & select category path...</span>
          </div>
        )}

        <button
          type="button"
          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0 transition"
        >
          <span>Browse Path</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* =========================================================================
          RESPONSIVE MODAL DIALOG: Fits 100% on phone, tablet & laptop screens
          ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          {/* Dialog Container */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-scaleIn">
            
            {/* Modal Header */}
            <div className="p-4 sm:px-6 sm:py-4 border-b border-zinc-100 bg-zinc-50/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center text-sm font-bold shadow-xs">
                  📁
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-zinc-900">
                    Category Path Selector
                  </h3>
                  <p className="text-[11px] text-zinc-500 font-medium hidden sm:block">
                    Select the exact hierarchical category path for your product
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-200/70 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center text-sm font-bold cursor-pointer transition active:scale-95"
              >
                ✕
              </button>
            </div>

            {/* Breadcrumb Trail Strip */}
            <div className="px-4 py-2.5 bg-zinc-100/70 border-b border-zinc-200/80 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-semibold shrink-0">
                <span className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">Path:</span>
                {currentPath.length > 0 ? (
                  currentPath.map((item, idx) => (
                    <React.Fragment key={item._id}>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                        idx === currentPath.length - 1 
                          ? 'bg-zinc-900 text-white' 
                          : 'bg-white border border-zinc-200 text-zinc-800'
                      }`}>
                        {item.name}
                      </span>
                      {idx < currentPath.length - 1 && (
                        <span className="text-zinc-400">›</span>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <span className="text-zinc-400 italic text-xs">No category selected yet</span>
                )}
              </div>

              {currentPath.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedL1(null);
                    setSelectedL2(null);
                    setSelectedL3(null);
                    setSelectedL4(null);
                    setMobileStack([]);
                  }}
                  className="text-[10px] text-zinc-500 hover:text-black font-bold uppercase underline shrink-0 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Modal Body: Responsive Layout */}
            <div className="flex-1 overflow-hidden flex flex-col p-3 sm:p-4">
              
              {/* DESKTOP / LAPTOP: Horizontal Scrollable Miller Columns */}
              <div 
                ref={columnsContainerRef}
                className="hidden md:flex overflow-x-auto divide-x divide-zinc-200 border border-zinc-200 rounded-2xl bg-zinc-50/30 flex-1 min-h-[320px] max-h-[460px] no-scrollbar"
              >
                {/* Column 1: Level 1 */}
                <div className="w-56 min-w-[210px] shrink-0 flex flex-col h-full bg-white">
                  <div className="p-2.5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500">
                      1. Main Category
                    </span>
                    <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded font-bold">
                      {level1Items.length}
                    </span>
                  </div>
                  <div className="p-2 border-b border-zinc-100">
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={searchL1}
                      onChange={(e) => setSearchL1(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-500"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                    {level1Items
                      .filter(i => i.name.toLowerCase().includes(searchL1.toLowerCase()))
                      .map((l1) => {
                        const children = getChildren(l1._id);
                        const hasChildren = children.length > 0;
                        const isSelected = selectedL1 && String(selectedL1._id) === String(l1._id);

                        return (
                          <div
                            key={l1._id}
                            onClick={() => handleSelectL1(l1)}
                            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                              isSelected 
                                ? 'bg-zinc-900 text-white shadow-xs' 
                                : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                            }`}
                          >
                            <span className="truncate flex-1 pr-1">{l1.name}</span>
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  commitSelection(l1, [l1]);
                                }}
                                title="Pick this level"
                                className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                                  isSelected 
                                    ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' 
                                    : 'bg-zinc-200 text-zinc-700 hover:bg-black hover:text-white'
                                }`}
                              >
                                Pick
                              </button>
                              {hasChildren && (
                                <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                  ›
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Column 2: Level 2 */}
                {selectedL1 && (
                  <div className="w-56 min-w-[210px] shrink-0 flex flex-col h-full bg-white animate-fadeIn">
                    <div className="p-2.5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 truncate">
                        2. {selectedL1.name}
                      </span>
                      <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded font-bold">
                        {l2Children.length}
                      </span>
                    </div>
                    <div className="p-2 border-b border-zinc-100">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={searchL2}
                        onChange={(e) => setSearchL2(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {l2Children.length === 0 ? (
                        <div className="p-4 text-center text-xs text-zinc-400">No sub-items</div>
                      ) : (
                        l2Children
                          .filter(i => i.name.toLowerCase().includes(searchL2.toLowerCase()))
                          .map((l2) => {
                            const children = getChildren(l2._id);
                            const hasChildren = children.length > 0;
                            const isSelected = selectedL2 && String(selectedL2._id) === String(l2._id);

                            return (
                              <div
                                key={l2._id}
                                onClick={() => handleSelectL2(l2)}
                                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                                  isSelected 
                                    ? 'bg-zinc-900 text-white shadow-xs' 
                                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                                }`}
                              >
                                <span className="truncate flex-1 pr-1">{l2.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      commitSelection(l2, [selectedL1, l2]);
                                    }}
                                    title="Pick this level"
                                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                                      isSelected 
                                        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' 
                                        : 'bg-zinc-200 text-zinc-700 hover:bg-black hover:text-white'
                                    }`}
                                  >
                                    Pick
                                  </button>
                                  {hasChildren && (
                                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                      ›
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}

                {/* Column 3: Level 3 */}
                {selectedL2 && (
                  <div className="w-56 min-w-[210px] shrink-0 flex flex-col h-full bg-white animate-fadeIn">
                    <div className="p-2.5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 truncate">
                        3. {selectedL2.name}
                      </span>
                      <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded font-bold">
                        {l3Children.length}
                      </span>
                    </div>
                    <div className="p-2 border-b border-zinc-100">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={searchL3}
                        onChange={(e) => setSearchL3(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {l3Children.length === 0 ? (
                        <div className="p-4 text-center text-xs text-zinc-400">No sub-items</div>
                      ) : (
                        l3Children
                          .filter(i => i.name.toLowerCase().includes(searchL3.toLowerCase()))
                          .map((l3) => {
                            const children = getChildren(l3._id);
                            const hasChildren = children.length > 0;
                            const isSelected = selectedL3 && String(selectedL3._id) === String(l3._id);

                            return (
                              <div
                                key={l3._id}
                                onClick={() => handleSelectL3(l3)}
                                className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                                  isSelected 
                                    ? 'bg-zinc-900 text-white shadow-xs' 
                                    : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                                }`}
                              >
                                <span className="truncate flex-1 pr-1">{l3.name}</span>
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      commitSelection(l3, [selectedL1, selectedL2, l3]);
                                    }}
                                    title="Pick this level"
                                    className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                                      isSelected 
                                        ? 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700' 
                                        : 'bg-zinc-200 text-zinc-700 hover:bg-black hover:text-white'
                                    }`}
                                  >
                                    Pick
                                  </button>
                                  {hasChildren && (
                                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                      ›
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                      )}
                    </div>
                  </div>
                )}

                {/* Column 4: Level 4 (Final) */}
                {selectedL3 && l4Children.length > 0 && (
                  <div className="w-56 min-w-[210px] shrink-0 flex flex-col h-full bg-white animate-fadeIn">
                    <div className="p-2.5 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 truncate">
                        4. Final Level
                      </span>
                      <span className="text-[10px] bg-zinc-200 text-zinc-700 px-1.5 py-0.2 rounded font-bold">
                        {l4Children.length}
                      </span>
                    </div>
                    <div className="p-2 border-b border-zinc-100">
                      <input
                        type="text"
                        placeholder="Filter..."
                        value={searchL4}
                        onChange={(e) => setSearchL4(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 focus:bg-white focus:outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
                      {l4Children
                        .filter(i => i.name.toLowerCase().includes(searchL4.toLowerCase()))
                        .map((l4) => {
                          const isSelected = selectedL4 && String(selectedL4._id) === String(l4._id);

                          return (
                            <div
                              key={l4._id}
                              onClick={() => {
                                handleSelectL4(l4);
                                commitSelection(l4, [selectedL1, selectedL2, selectedL3, l4]);
                              }}
                              className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                                isSelected 
                                  ? 'bg-zinc-900 text-white shadow-xs' 
                                  : 'text-zinc-700 hover:bg-zinc-100 hover:text-black'
                              }`}
                            >
                              <span className="truncate flex-1 pr-1">{l4.name}</span>
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-orange-100 text-orange-800">
                                Pick
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE / PHONE: Touch Drill-down view (< md screens) */}
              <div className="flex md:hidden flex-col flex-1 overflow-hidden border border-zinc-200 rounded-2xl bg-white">
                <div className="p-3 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                  {mobileStack.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setMobileStack(prev => prev.slice(0, -1))}
                      className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-zinc-200"
                    >
                      <span>‹ Back</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                      Select Category
                    </span>
                  )}

                  {mobileCurrentParent && (
                    <span className="text-xs font-bold text-zinc-900 truncate max-w-[140px]">
                      {mobileCurrentParent.name}
                    </span>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                  {mobileCurrentItems.map((item) => {
                    const children = getChildren(item._id);
                    const hasChildren = children.length > 0;

                    return (
                      <div
                        key={item._id}
                        className="p-3 rounded-xl border border-zinc-100 bg-zinc-50 flex items-center justify-between gap-2"
                      >
                        <div 
                          onClick={() => {
                            if (hasChildren) {
                              setMobileStack(prev => [...prev, item]);
                            } else {
                              commitSelection(item, [...mobileStack, item]);
                            }
                          }}
                          className="flex-1 text-left cursor-pointer flex items-center justify-between"
                        >
                          <span className="text-sm font-bold text-zinc-900">{item.name}</span>
                          {hasChildren && (
                            <span className="text-xs font-bold text-zinc-400 bg-white border border-zinc-200 px-2 py-0.5 rounded">
                              Next ›
                            </span>
                          )}
                        </div>

                        {/* Pick button */}
                        <button
                          type="button"
                          onClick={() => commitSelection(item, [...mobileStack, item])}
                          className="text-xs font-bold px-3 py-1.5 bg-zinc-900 hover:bg-black text-white rounded-lg cursor-pointer shrink-0"
                        >
                          Pick
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:px-6 sm:py-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between gap-2 shrink-0">
              <div className="text-xs text-zinc-600 truncate">
                {currentPath.length > 0 ? (
                  <span>Selected: <strong>{currentPath.map(c => c.name).join(' > ')}</strong></span>
                ) : (
                  <span>Please choose a category from the columns above</span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-zinc-700 bg-white border border-zinc-300 rounded-xl hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={currentPath.length === 0}
                  onClick={() => {
                    if (currentPath.length > 0) {
                      commitSelection(currentPath[currentPath.length - 1], currentPath);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-zinc-900 hover:bg-black disabled:bg-zinc-300 rounded-xl shadow-xs transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Confirm & Set Path ✓
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryCascader;
