import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";

const CaptainLogin = () => {
  const [email, setEmail] = useState("vishalsharma@gmail.com");
  const [password, setPassword] = useState("7777777");
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/captain-home');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const newCaptain = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/login`,
        newCaptain
      );

      if (response.status === 200) {
        const data = response.data;
        console.log("Captain logged in:", data.captain);
        setCaptain(data.captain);
        localStorage.setItem("token", data.token);
        navigate("/captain-home");
      }
    } catch (error) {
      console.error("Captain login failed", error);
    }
  };

  return (
    <div className="p-7 flex h-screen flex-col justify-between bg-slate-900 text-white">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-white">
          ride<span className="text-emerald-400">Captain</span>
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
          <form onSubmit={submitHandler}>
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Captain Email
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 w-full text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                placeholder="email@example.com"
              />
            </div>

            <div className="mb-8">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Password
              </label>
              <input
                required
                type="password"
                className="bg-slate-800/50 border border-slate-700 w-full text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="bg-emerald-500 hover:bg-emerald-600 transition-colors w-full text-lg font-semibold text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/30">
              Login
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Join a fleet?{" "}
            <Link to={"/captain-signup"} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Register as a Captain
            </Link>
          </p>
        </div>
      </div>

      <div>
        <Link
          to={"/login"}
          className="bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors flex justify-center w-full text-lg font-medium text-indigo-400 px-4 py-3 rounded-xl"
        >
          Sign in as User
        </Link>
      </div>
    </div>
  );
};

export default CaptainLogin;
