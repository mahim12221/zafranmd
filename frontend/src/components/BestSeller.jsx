import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';

const BestSeller = () => {
  const { products } = useContext(ShopContext); 
  const [bestSeller, setBestSeller] = useState([]); 

  useEffect(() => { 
    const bestProduct = products.filter((item) => item.bestseller); 
    setBestSeller(bestProduct.slice(0, 5)); 
  }, [products]);

  if (bestSeller.length === 0) {
    return null;
  }

  return (
    <div className="my-14 sm:my-20">
      <div className="text-center pb-8 sm:pb-10">
        <Title text1={'BEST'} text2={'SELLERS'} />
        <p className="w-full max-w-xl mx-auto text-xs sm:text-sm text-zinc-500 leading-relaxed px-4">
          Our top-rated products chosen by customers for exceptional performance and quality.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 gap-y-6">
        {bestSeller.map((item, index) => (
          <ProductItem key={index} id={item._id} image={item.images || item.image} name={item.name} price={item.price} discount={item.discount} outOfStock={item.outOfStock} salesCount={item.salesCount} />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;
