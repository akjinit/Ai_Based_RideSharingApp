import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import axios from "axios";

const CaptainSignup = () => {
  const [email, setEmail] = useState("");
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleColor, setVehicleColor] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [vehicleCapacity, setVehicleCapacity] = useState("");
  const [vehicleType, setVehicleType] = useState("");

  const { captain, setCaptain } = useContext(CaptainDataContext);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();
    const newCaptain = {
      fullName: {
        firstName,
        lastName,
      },
      email,
      password,
      vehicle: {
        color: vehicleColor,
        plate: vehiclePlate,
        capacity: vehicleCapacity,
        vehicleType,
      },
    };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/captains/register`,
        newCaptain
      );

      if (response.status === 201) {
        const data = response.data;
        setCaptain(data.captain);
        localStorage.setItem("token", data.token);
        navigate("/captain-home");
      }
    } catch (error) {
      console.error("Captain signup failed", error);
    }

    setfirstName("");
    setlastName("");
    setPassword("");
    setEmail("");
    setVehicleColor("");
    setVehiclePlate("");
    setVehicleCapacity("");
    setVehicleType("");
  };

  return (
    <div className="p-7 flex min-h-screen flex-col justify-between bg-slate-900 text-white">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-8 text-white">
          ride<span className="text-emerald-400">Captain</span>
        </h1>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl">
          <form onSubmit={submitHandler}>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-300 mb-2 block">Captain's Name</label>
              <div className="flex gap-4">
                <input
                  required
                  type="text"
                  value={firstName}
                  onChange={(e) => setfirstName(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                  placeholder="First name"
                />
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setlastName(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
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
                className="bg-slate-800/50 border border-slate-700 w-full text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                placeholder="email@example.com"
              />
            </div>

            <div className="mb-6">
              <label className="text-sm font-medium text-gray-300 mb-2 block">Password</label>
              <input
                required
                type="password"
                className="bg-slate-800/50 border border-slate-700 w-full text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="border-t border-slate-700 pt-5 mt-2 mb-4">
              <h3 className="text-lg font-semibold mb-4 text-emerald-400">Vehicle Information</h3>

              <div className="flex gap-4 mb-4">
                <input
                  required
                  type="text"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                  placeholder="Vehicle Color"
                />
                <input
                  required
                  type="text"
                  value={vehiclePlate}
                  onChange={(e) => setVehiclePlate(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                  placeholder="Vehicle Plate"
                />
              </div>

              <div className="flex gap-4 mb-6">
                <input
                  required
                  type="number"
                  value={vehicleCapacity}
                  onChange={(e) => setVehicleCapacity(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base placeholder:text-gray-500 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-white"
                  placeholder="Capacity (Seats)"
                />
                <select
                  required
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="bg-slate-800/50 border border-slate-700 w-1/2 text-base text-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                >
                  <option value="" disabled>Select Type</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <button className="bg-emerald-500 hover:bg-emerald-600 transition-colors w-full text-lg font-semibold text-white px-4 py-3 rounded-xl shadow-lg shadow-emerald-500/30">
              Create Captain Account
            </button>
          </form>

          <p className="text-center mt-6 text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to={"/captain-login"} className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
              Login here
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-[10px] leading-tight text-gray-500">
        Join the millions of riders who trust rideShare for their everyday travel needs. Get doorstep pickup and dropoff to your chosen destination at the tap of a button.
      </p>
    </div>
  );
};

export default CaptainSignup;
