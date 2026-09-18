import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {
  const { products } = useContext(ShopContext);
  const [latestProducts, setLatestProducts] = useState([]);

  useEffect(() => {
    setLatestProducts(products.slice(0, 10));
  }, [products]);

  return (
    <div className="my-14 sm:my-20">
      <div className="text-center pb-8 sm:pb-10">
        <Title text1={'LATEST'} text2={'ARRIVALS'} />
        <p className="w-full max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed px-4">
          Discover cutting-edge smart gadgets, satisfying EDC fidget toys, and futuristic everyday gear.
        </p>
      </div>
      
      {/* Product Grid - Pinterest/Masonry Layout */}
      {latestProducts.length > 0 ? (
        <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 sm:gap-4 md:gap-5">
          {latestProducts.map((item, index) => (
            <ProductItem key={index} id={item._id} image={item.images || item.image} name={item.name} price={item.price} discount={item.discount} outOfStock={item.outOfStock} salesCount={item.salesCount} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-zinc-50/60 rounded-3xl border border-dashed border-zinc-200 max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-xl">
            📦
          </div>
          <h4 className="text-sm font-bold text-zinc-800">Catalog is being prepared</h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
            New products added through the Admin Panel will appear here instantly.
          </p>
        </div>
      )}
    </div>
  );
};

export default LatestCollection;
