import React from "react";

const WaitingForDriver = (props) => {
  const waitingForDriver = props.waitingForDriver;
  const ride = props.ride;

  const vehicleImageMap = {
    car: "car.png",
    motorcycle: "motorbike.webp",
    auto: "auto.webp"
  };

  const captain = ride?.captainId;
  const otp = ride?.OTP || ride?.otp;

  return (
    <div
      className={` ${waitingForDriver ? "translate-y-0" : "translate-y-[120%]"
        } w-full fixed z-20 bottom-0 bg-white/95 backdrop-blur-xl px-6 py-8 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40`}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
      
      <div className="flex items-center justify-between mb-6 mt-2">
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Driver is arriving...</h3>
      </div>

      <div className="flex items-center justify-between bg-yellow-50 border border-yellow-200 rounded-3xl p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-2xl shadow-sm border border-yellow-100">
             <img src={vehicleImageMap[ride?.vehicleType]} className="w-20 object-contain drop-shadow-sm" alt="" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{`${captain?.fullName?.firstName} ${captain?.fullName?.lastName}`}</h2>
            <h4 className="text-2xl font-black text-gray-800 -mt-1 tracking-tight">{`${captain?.vehicle?.plate}`}</h4>
            <p className="text-xs font-semibold text-gray-500 uppercase">{ride?.vehicleType || "Vehicle"}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 p-4 rounded-2xl mb-6 shadow-sm">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-200 flex items-center justify-center text-indigo-700">
               <i className="ri-key-2-fill"></i>
            </div>
            <h3 className="font-bold text-indigo-900">OTP</h3>
         </div>
         <p className="text-2xl font-black tracking-widest text-indigo-600 bg-white px-4 py-1.5 rounded-xl shadow-inner border border-indigo-50">
            {otp ? otp.toString().split('').join(' ') : '----'}
         </p>
      </div>

      <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 space-y-4">
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
             <i className="ri-map-pin-line"></i>
          </div>
          <div>
             <p className="text-xs text-gray-500 font-semibold mb-1">PICKUP</p>
             <h3 className="text-sm font-bold text-gray-900 leading-tight">{ride?.origin}</h3>
          </div>
        </div>
        
        <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4 -my-2"></div>
        
        <div className="flex gap-4 items-start">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
             <i className="ri-map-pin-user-fill"></i>
          </div>
          <div>
             <p className="text-xs text-gray-500 font-semibold mb-1">DESTINATION</p>
             <h3 className="text-sm font-bold text-gray-900 leading-tight">{ride?.destination}</h3>
          </div>
        </div>
        
        <div className="h-px w-full bg-gray-200 my-2"></div>
        
        <div className="flex gap-4 items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
             <i className="ri-bank-card-fill"></i>
          </div>
          <div className="flex-1 flex justify-between items-center">
             <div>
                <p className="text-xs text-gray-500 font-semibold mb-0.5">ESTIMATED FARE</p>
                <h3 className="text-lg font-bold text-gray-900">{`₹${ride?.fare}`}</h3>
             </div>
             <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">CASH</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitingForDriver;
