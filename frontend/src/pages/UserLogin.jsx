import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";

const UserLogin = () => {
  const [email, setEmail] = useState("akshatiiit@gmail.com");
  const [password, setPassword] = useState("7777777");

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();

    const newUserLoginData = {
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/login`,
        newUserLoginData
      );
      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem('token', data.token);
        navigate("/home");
      }
    } catch (error) {
      console.error("Login failed", error);
    }

    setEmail("");
    setPassword("");
  };

  return (
    <div className="p-7 flex h-screen flex-col justify-between bg-slate-900 text-white">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-10 text-white">
          ride<span className="text-indigo-400">Share</span>
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl max-w-md mx-auto">
          <form onSubmit={submitHandler}>
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Email Address
              </label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 w-full text-sm placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
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
                className="bg-slate-800/50 border border-slate-700 w-full text-sm placeholder:text-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="bg-indigo-500 hover:bg-indigo-600 transition-colors w-full text-base font-semibold text-white px-4 py-2 rounded-lg shadow-sm shadow-indigo-500/20">
              Login
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            New here?{" "}
            <Link to={"/signup"} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      <div>
        <Link
          to={"/captain-login"}
          className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 transition-colors flex justify-center w-full text-lg font-medium text-emerald-400 px-4 py-3 rounded-xl"
        >
          Sign in as Captain
        </Link>
      </div>
    </div>
  );
};

export default UserLogin;
