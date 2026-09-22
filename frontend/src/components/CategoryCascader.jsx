import React, { useState, useRef, useEffect } from 'react';

const CategoryCascader = ({ categories = [], value = [], onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeL1, setActiveL1] = useState(null);
  const [activeL2, setActiveL2] = useState(null);
  const [activeL3, setActiveL3] = useState(null);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const level1Items = categories.filter(c => !c.parentId || c.level === 1);

  const getChildren = (parentId) => {
    if (!parentId) return [];
    return categories.filter(c => c.parentId && String(c.parentId) === String(parentId));
  };

  const handleSelect = (item, path) => {
    const fullPath = [...path, item.name];
    const rootCategory = fullPath[0] || item.name;
    const finalLeaf = fullPath[fullPath.length - 1] || item.name;
    
    onChange({
      path: fullPath,
      category: rootCategory,
      subCategory: finalLeaf
    });
    setIsOpen(false);
  };

  const l2Children = activeL1 ? getChildren(activeL1._id) : [];
  const l3Children = activeL2 ? getChildren(activeL2._id) : [];
  const l4Children = activeL3 ? getChildren(activeL3._id) : [];

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center justify-between">
        <span>Dynamic Menu Category Selection</span>
        {value.length > 0 && (
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Path Selected
          </span>
        )}
      </label>

      {/* Selected breadcrumb preview & trigger */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full min-h-[44px] rounded-xl border border-gray-200 bg-gray-50/70 p-2.5 flex items-center justify-between gap-2 cursor-pointer hover:border-black/40 transition"
      >
        {value.length > 0 ? (
          <div className="flex items-center gap-1.5 flex-wrap">
            {value.map((seg, idx) => (
              <React.Fragment key={idx}>
                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                  idx === value.length - 1 ? 'bg-black text-white' : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  {seg}
                </span>
                {idx < value.length - 1 && (
                  <span className="text-gray-400 text-xs font-bold">›</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <span className="text-xs text-gray-400 font-medium">
            {level1Items.length > 0 
              ? "Click or hover to browse dynamic multi-level menu..." 
              : "No categories added yet. Go to 'Menu Categories' tab to add items."}
          </span>
        )}

        <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
          <span className="text-[11px] font-semibold text-gray-500">Browse</span>
          <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-black' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Cascading Hover Flyout Panels */}
      {isOpen && level1Items.length > 0 && (
        <div 
          className="absolute left-0 top-full mt-1.5 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden flex z-50 animate-fadeIn"
          style={{ minHeight: '200px', maxHeight: '420px', minWidth: '220px' }}
        >
          {/* Level 1 Panel */}
          <div className="w-52 py-2 border-r border-gray-100 overflow-y-auto bg-neutral-50/40">
            <div className="px-3 py-1.5 mb-1 border-b border-gray-100">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                Level 1 (Main Menu)
              </span>
            </div>
            {level1Items.map((l1) => {
              const children = getChildren(l1._id);
              const hasSub = children.length > 0;
              const isSelected = activeL1 && String(activeL1._id) === String(l1._id);

              return (
                <div
                  key={l1._id}
                  onMouseEnter={() => {
                    setActiveL1(l1);
                    setActiveL2(null);
                    setActiveL3(null);
                  }}
                  className={`px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                    isSelected ? 'bg-black text-white' : 'text-zinc-700 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <span className="truncate">{l1.name}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(l1, []);
                      }}
                      className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                        isSelected ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title="Select this level"
                    >
                      Pick
                    </button>
                    {hasSub && (
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                        ›
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Level 2 Panel */}
          {activeL1 && l2Children.length > 0 && (
            <div className="w-52 py-2 border-r border-gray-100 overflow-y-auto bg-white animate-fadeIn">
              <div className="px-3 py-1.5 mb-1 border-b border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  {activeL1.name} Sub-Items
                </span>
              </div>
              {l2Children.map((l2) => {
                const children = getChildren(l2._id);
                const hasSub = children.length > 0;
                const isSelected = activeL2 && String(activeL2._id) === String(l2._id);

                return (
                  <div
                    key={l2._id}
                    onMouseEnter={() => {
                      setActiveL2(l2);
                      setActiveL3(null);
                    }}
                    className={`px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                      isSelected ? 'bg-black text-white' : 'text-zinc-700 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <span className="truncate">{l2.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(l2, [activeL1.name]);
                        }}
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                          isSelected ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Select this level"
                      >
                        Pick
                      </button>
                      {hasSub && (
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          ›
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Level 3 Panel */}
          {activeL2 && l3Children.length > 0 && (
            <div className="w-52 py-2 border-r border-gray-100 overflow-y-auto bg-neutral-50/40 animate-fadeIn">
              <div className="px-3 py-1.5 mb-1 border-b border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  {activeL2.name} Sub-Items
                </span>
              </div>
              {l3Children.map((l3) => {
                const children = getChildren(l3._id);
                const hasSub = children.length > 0;
                const isSelected = activeL3 && String(activeL3._id) === String(l3._id);

                return (
                  <div
                    key={l3._id}
                    onMouseEnter={() => setActiveL3(l3)}
                    className={`px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition ${
                      isSelected ? 'bg-black text-white' : 'text-zinc-700 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <span className="truncate">{l3.name}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(l3, [activeL1.name, activeL2.name]);
                        }}
                        className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold transition cursor-pointer ${
                          isSelected ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        title="Select this level"
                      >
                        Pick
                      </button>
                      {hasSub && (
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                          ›
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Level 4 Panel */}
          {activeL3 && l4Children.length > 0 && (
            <div className="w-52 py-2 overflow-y-auto bg-white animate-fadeIn">
              <div className="px-3 py-1.5 mb-1 border-b border-gray-100">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Final Level (Level 4)
                </span>
              </div>
              {l4Children.map((l4) => (
                <div
                  key={l4._id}
                  onClick={() => handleSelect(l4, [activeL1.name, activeL2.name, activeL3.name])}
                  className="px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between cursor-pointer transition text-zinc-700 hover:bg-black hover:text-white"
                >
                  <span className="truncate">{l4.name}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded font-bold bg-orange-100 text-orange-800">
                    Pick
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryCascader;
