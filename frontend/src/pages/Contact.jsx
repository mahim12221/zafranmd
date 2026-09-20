import React from 'react';
import Title from '../components/Title';
import contactTechImg from '../assets/contact_tech.jpg';

const Contact = () => {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <Title text1={'CONTACT'} text2={'KERIYO'} />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto mt-1">
          Have a question about gadgets, EDC gear, or your order? We're always here to assist.
        </p>
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-12 mb-24 items-center">
        <img
          id="contact-tech-support-image"
          className="w-full md:max-w-[480px] rounded-2xl shadow-lg border border-zinc-200/80 object-cover"
          src={contactTechImg}
          alt="Keriyo Concierge"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col justify-center items-start gap-6 max-w-lg p-6 sm:p-8 bg-zinc-50 border border-zinc-200/80 rounded-3xl">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100/70 border border-orange-200 px-2.5 py-1 rounded-full">
              Direct Concierge
            </span>
            <h3 className="font-extrabold text-2xl text-zinc-950 mt-2">Keriyo Customer Care</h3>
          </div>

          <div className="text-xs sm:text-sm text-zinc-600 space-y-2">
            <p><strong>Founder:</strong> Mahim Afridi</p>
            <p><strong>Headquarters:</strong> Dhaka, Bangladesh</p>
            <p>
              <strong>Direct Phone:</strong>{' '}
              <a href="tel:01880172859" className="text-zinc-950 hover:text-orange-600 underline font-bold">01880172859</a> /{' '}
              <a href="tel:01742111888" className="text-zinc-950 hover:text-orange-600 underline font-bold">01742111888</a>
            </p>
            <p>
              <strong>Official Email:</strong>{' '}
              <a href="mailto:contact@keriyo.com" className="text-zinc-950 hover:text-orange-600 underline">contact@keriyo.com</a>
            </p>
          </div>

          <div className="pt-2 w-full">
            <p className="font-bold text-xs uppercase tracking-wider text-zinc-400 mb-3">Connect Instantly</p>
            <div className="flex flex-wrap gap-2.5">
              <a
                href="https://wa.me/8801742111888"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 text-xs font-bold rounded-xl hover:opacity-90 transition shadow-xs"
              >
                💬 WhatsApp Chat
              </a>
              <a
                href="https://www.facebook.com/mahim.afridi.136555"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1877F2] text-white px-4 py-2.5 text-xs font-bold rounded-xl hover:opacity-90 transition shadow-xs"
              >
                Facebook
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200/80 w-full text-xs text-zinc-500">
            <p className="font-semibold text-zinc-800">Operational Hours</p>
            <p className="mt-0.5">Saturday – Thursday: 9:00 AM – 10:00 PM (GMT+6)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
