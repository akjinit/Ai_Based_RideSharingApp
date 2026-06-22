import React from "react";
import { Link } from "react-router-dom";
import { FiMail, FiHelpCircle } from "react-icons/fi";

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900/95 border-t border-white/5 text-gray-400 py-4">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-sm">© {new Date().getFullYear()} rideShare — All rights reserved</div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm hover:text-white/80">Home</Link>
          <Link to="/login" className="text-sm hover:text-white/80">Login</Link>
          <a href="#" className="flex items-center gap-1 text-sm hover:text-white/80"><FiHelpCircle /> Help</a>
          <a href="mailto:help@rideshare.example" className="flex items-center gap-1 text-sm hover:text-white/80"><FiMail /> Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
