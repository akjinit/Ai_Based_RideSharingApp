import React from "react";

const LookingForDriver = (props) => {
  const lookingForDriverPanel = props.lookingForDriverPanel;
  const ride = props.ride;

  const vehicleImageMap = {
    car: "car.png",
    motorcycle: "motorbike.webp",
    auto: "auto.webp"
  };

  return (
    <div
      className={` ${lookingForDriverPanel ? "translate-y-0" : "translate-y-[120%]"
        } w-full fixed z-20 bottom-0 bg-white/95 backdrop-blur-xl px-6 py-8 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40`}
    >
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>

      <div className="flex items-center gap-4 mt-2 mb-6">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-4 border-indigo-100 flex items-center justify-center">
             <div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Finding nearby drivers...</h3>
      </div>
      
      {ride ? (
        <div className="flex flex-col justify-center">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 mb-6 shadow-sm flex justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
            <img src={vehicleImageMap[ride.vehicleType] || "car.png"} className="w-40 object-contain drop-shadow-lg transform scale-110 relative z-10" alt="Vehicle" />
          </div>

          <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 mb-6 space-y-4">
            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <i className="ri-map-pin-line"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">PICKUP</p>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{ride.origin}</h3>
              </div>
            </div>
            
            <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4 -my-2"></div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <i className="ri-map-pin-user-fill"></i>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold mb-1">DESTINATION</p>
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{ride.destination}</h3>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-2xl mb-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <i className="ri-money-rupee-circle-fill text-xl"></i>
              </div>
              <div>
                 <p className="text-xs text-gray-500 font-semibold mb-0.5">ESTIMATED FARE</p>
                 <h3 className="text-lg font-bold text-gray-900">{"₹" + ride.fare}</h3>
              </div>
            </div>
            
            <div className="text-right flex flex-col gap-1">
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
                 {(ride.duration / 60).toFixed(0)} MINS
              </span>
              <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md text-xs font-bold">
                 {(ride.distance / 1000).toFixed(1)} KM
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              props.cancelRide()
            }}
            className='w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 font-bold text-lg py-4 rounded-xl transition-all border border-red-200'>
            Cancel Request
          </button>
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center h-64 opacity-50">
           <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
           <p className="text-gray-500 font-medium">Preparing ride details...</p>
        </div>
      )}
    </div>
  );
};

export default LookingForDriver;
