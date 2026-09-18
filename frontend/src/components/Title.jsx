import React from 'react';

const Title = ({ text1, text2 }) => {
  return (
    <div className="inline-flex flex-col items-center justify-center mb-3">
      <div className="flex items-center gap-3">
        <span className="w-6 sm:w-8 h-px bg-gradient-to-r from-transparent to-orange-500/80"></span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-gray-950 font-['Outfit'] uppercase">
          <span className="text-gray-400 font-normal">{text1}</span>{' '}
          <span className="text-gray-950">{text2}</span>
        </h2>
        <span className="w-6 sm:w-8 h-px bg-gradient-to-l from-transparent to-orange-500/80"></span>
      </div>
    </div>
  );
};

export default Title;
