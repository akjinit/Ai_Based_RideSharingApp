import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiMap, FiZap, FiClock, FiLogIn } from "react-icons/fi";

const NavBar = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/90 backdrop-blur-[6px] border-b border-white/5">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center gap-2 text-lg font-semibold">
            <FiHome className="text-2xl text-indigo-400" />
            <span className="hidden sm:inline">rideShare</span>
          </Link>
        </div>

        <ul className="hidden sm:flex items-center gap-3 text-sm">
          <li>
            <Link to="/home" title="Find a trip — Search pickup & destination" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <FiMap className="text-lg text-white/90" />
              <span className="text-sm text-white/90">Map</span>
            </Link>
          </li>
          <li>
            <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} title="AI recommendations — Explore nearby places" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <FiZap className="text-lg text-indigo-300" />
              <span className="text-sm text-white/90">AI</span>
            </button>
          </li>
          <li>
            <Link to="/riding" title="Current ride status & tracking" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <FiClock className="text-lg text-white/90" />
              <span className="text-sm text-white/90">Rides</span>
            </Link>
          </li>
          <li>
            <Link to="/login" title="Sign in as a rider" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600/90 hover:bg-indigo-700 transition">
              <FiLogIn className="text-lg text-white" />
              <span className="text-sm text-white">Login</span>
            </Link>
          </li>
        </ul>

        <div className="sm:hidden">{/* small screens: show simplified controls */}
          <Link to="/login" className="px-3 py-2 rounded-md bg-indigo-600/80">Login</Link>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
