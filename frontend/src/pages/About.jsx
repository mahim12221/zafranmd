import React from 'react';
import Title from '../components/Title';
import aboutTechImg from '../assets/tech_hero.jpg';

const About = () => {
  return (
    <div className="py-8">
      <div className="text-center mb-8">
        <Title text1={'ABOUT'} text2={'KERIYO'} />
        <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto mt-1">
          The story behind innovative smart gadgets, EDC fidget gear, and everyday tech innovations.
        </p>
      </div>

      <div className="my-10 flex flex-col md:flex-row gap-12 lg:gap-16 items-center">
        <img
          id="about-tech-story-image"
          className="w-full md:max-w-[450px] rounded-2xl shadow-lg border border-zinc-200/80 object-cover"
          src={aboutTechImg}
          alt="Keriyo Tech Story"
          referrerPolicy="no-referrer"
        />
        <div className="flex flex-col justify-center gap-5 md:w-2/4 text-zinc-600 text-sm leading-relaxed">
          <p>
            <strong>Keriyo</strong> was established with a singular vision: to bring distinctive, high-performance smart gadgets, tactile fidget toys, and innovative everyday tech accessories to everyone without the excessive markup of traditional tech retailers.
          </p>
          <p>
            Founded by <strong>Mahim Afridi</strong>, Keriyo represents innovation, curiosity, and an uncompromising commitment to premium build quality, satisfying EDC mechanics, and reliable electronics.
          </p>
          <div className="p-5 bg-zinc-50 border-l-4 border-orange-500 rounded-r-2xl">
            <p className="text-zinc-900 font-medium italic text-sm">
              &ldquo;We don't just sell gadgets; we curate tools, fidget toys, and devices that spark excitement, enhance productivity, and bring everyday utility.&rdquo;
            </p>
            <p className="text-xs text-orange-600 font-bold mt-2 uppercase tracking-wider">
              — Mahim Afridi, Founder
            </p>
          </div>
          <p>
            Every product in the Keriyo collection is rigorously tested for durability, tactile responsiveness, and build perfection so you receive only the finest gear.
          </p>
          <div className="flex items-center gap-3 pt-2 text-xs">
            <a
              href="https://www.facebook.com/mahim.afridi.136555"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-orange-500 transition shadow-xs"
            >
              Connect with Mahim Afridi
            </a>
          </div>
        </div>
      </div>

      <div className="text-center pt-10 pb-4">
        <Title text1={'WHY CHOOSE'} text2={'KERIYO'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
        <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:bg-white transition duration-300 shadow-2xs">
          <h4 className="text-base font-extrabold text-zinc-950 mb-2">Original Build &amp; Tech Integrity</h4>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Precision-machined metal EDC toys, tested magnetic mechanisms, and authentic certified electronic components built to last.
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:bg-white transition duration-300 shadow-2xs">
          <h4 className="text-base font-extrabold text-zinc-950 mb-2">Fast Direct Dispatch</h4>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Swift order processing with nationwide doorstep delivery and seamless Cash on Delivery support across all 64 districts.
          </p>
        </div>
        <div className="p-8 rounded-2xl bg-zinc-50 border border-zinc-200/80 hover:bg-white transition duration-300 shadow-2xs">
          <h4 className="text-base font-extrabold text-zinc-950 mb-2">7-Day Customer Peace of Mind</h4>
          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
            Transparent replacement guarantee and technical support backed by direct hotline and WhatsApp support to ensure total satisfaction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
