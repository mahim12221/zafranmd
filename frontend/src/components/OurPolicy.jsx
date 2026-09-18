import React from 'react';

const OurPolicy = () => {
  const policies = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
        </svg>
      ),
      title: 'Easy Exchange Policy',
      desc: 'Hassle-free 7-day replacement & technical warranty support'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
        </svg>
      ),
      title: '100% Genuine Gadgets',
      desc: 'Tested & inspected devices with original build quality'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V3.75A1.125 1.125 0 0 0 13.125 2.625H4.875A1.125 1.125 0 0 0 3.75 3.75v10.5m10.5-6.75h4.125c.621 0 1.125.504 1.125 1.125v2.25" />
        </svg>
      ),
      title: 'Express All-BD Delivery',
      desc: 'Rapid doorstep shipping with live tracking and COD support'
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.579-3.58a1.5 1.5 0 0 0-.962-.437 48.47 48.47 0 0 1-4.209-.272v-1.138A3.75 3.75 0 0 1 13.5 11.25h1.5A3.75 3.75 0 0 0 18.75 7.5v-.05a48.45 48.45 0 0 1 1.5 1.061Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 6.75A2.25 2.25 0 0 0 10.5 4.5h-6A2.25 2.25 0 0 0 2.25 6.75v6a2.25 2.25 0 0 0 2.25 2.25h.75v3.19l3.19-3.19h2.06a2.25 2.25 0 0 0 2.25-2.25v-6Z" />
        </svg>
      ),
      title: 'Dedicated Support',
      desc: 'Direct WhatsApp and phone assistance anytime you need'
    }
  ];

  return (
    <div className="py-14 border-y border-zinc-200/80 my-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {policies.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50/70 border border-zinc-200/60 hover:border-zinc-300 hover:bg-white transition duration-300 shadow-2xs group"
          >
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-xs">
              {item.icon}
            </div>
            <h4 className="font-bold text-sm text-zinc-900 mb-1.5">{item.title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OurPolicy;

