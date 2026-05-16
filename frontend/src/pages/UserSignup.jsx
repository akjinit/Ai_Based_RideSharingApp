import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";

const UserSignup = () => {
  const [email, setEmail] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserDataContext);

  const submitHandler = async (e) => {
    e.preventDefault();
    const newUser = {
      fullName: {
        firstName,
        lastName,
      },
      email,
      password,
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        newUser
      );

      if (response.status === 201) {
        const data = response.data;
        setUser(data.user);
        localStorage.setItem("token", data.token);
        navigate("/home");
      }
    } catch (error) {
      console.error("Signup failed", error);
    }

    setfirstName("");
    setlastName("");
    setPassword("");
    setEmail("");
  };

  return (
    <div className="p-7 flex h-screen flex-col justify-between bg-slate-900 text-white">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-white">
          ride<span className="text-indigo-400">Share</span>
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 mb-2 block">Name</label>
              <div className="flex gap-4">
                <input
                  required
                  type="text"
                  value={firstName}
                  onChange={(e) => setfirstName(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                  placeholder="First name"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setlastName(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 mb-2 block">Email Address</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-800/50 border border-slate-700 w-full text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                placeholder="email@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300 mb-2 block">Password</label>
              <input
                required
                type="password"
                className="bg-slate-800/50 border border-slate-700 w-full text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-white"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button className="bg-indigo-500 hover:bg-indigo-600 transition-colors w-full text-lg font-semibold text-white px-4 py-3 rounded-xl shadow-lg shadow-indigo-500/30">
              Create Account
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to={"/login"} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <p className="text-[10px] leading-tight text-gray-500 mt-6">
        By proceeding, you consent to get calls, WhatsApp or SMS messages, including by automated means, from rideShare and its affiliates to the number provided.
      </p>
    </div>
  );
};

export default UserSignup;
