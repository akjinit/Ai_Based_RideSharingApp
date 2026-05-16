import React from "react";
import { Link } from "react-router-dom";

const Start = () => {
  return (
    <div className="bg-slate-900 text-white">
      <div className="bg-center bg-cover bg-[url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2070&auto=format&fit=crop')] h-screen w-full flex justify-between flex-col relative">
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 via-gray-900/40 to-gray-900 z-0"></div>

        <div className="pt-8 pl-6 z-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            ride<span className="text-indigo-400">Share</span>
          </h1>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 py-8 px-6 pb-12 rounded-t-[2.5rem] z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <h2 className="text-[32px] font-bold leading-tight mb-2 text-white">
            Your journey,<br/>elevated.
          </h2>
          <p className="text-gray-300 mb-8 text-lg font-light">
            Get Started with rideShare and experience the future of mobility.
          </p>
          <Link 
            to={'/login'} 
            className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 w-full text-white py-4 px-10 rounded-2xl text-xl font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Continue
            <i className="ri-arrow-right-line ml-2"></i>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Start;
