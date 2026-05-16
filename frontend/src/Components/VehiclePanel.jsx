import React from "react";

const VehiclePanel = (props) => {
  const setvehiclePanelOpen = props.setvehiclePanelOpen;
  const vehiclePanelOpen = props.vehiclePanelOpen;
  const setConfirmVehiclePanel = props.setConfirmVehiclePanel;
  const fareDetails = props.fareDetails;
  const setSelectedVehicle = props.setSelectedVehicle;

  const confirmVehicleHandler = () => {
    setConfirmVehiclePanel(true);
  }

  return (
    <>
      <div
        className={` ${vehiclePanelOpen ? "translate-y-0" : "translate-y-[120%]"
          } w-full fixed z-20 bottom-0 bg-white/95 backdrop-blur-xl px-6 py-6 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40`}
      >
        <div 
          onClick={() => setvehiclePanelOpen(false)}
          className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
        ></div>
        
        <div className="flex justify-between items-end mb-6 mt-4">
          <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Choose a Vehicle</h3>
          <h3 className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{fareDetails.distance} km away</h3>
        </div>

        <div className="flex flex-col gap-3">
          {/* CAR */}
          <div onClick={() => {
            confirmVehicleHandler()
            setSelectedVehicle('car');
          }} className="flex items-center bg-gray-50/80 hover:bg-indigo-50/50 border-2 border-transparent hover:border-indigo-500/30 active:border-indigo-500 p-4 rounded-2xl cursor-pointer transition-all shadow-sm">
            <img src="car.png" className="w-20 object-contain mr-4 drop-shadow-md" alt="" />
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                RideShare Go
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">
                  <i className="ri-user-3-fill"></i> 4
                </span>
              </h4>
              <h5 className="font-semibold text-emerald-600 text-sm mt-0.5">{`${fareDetails.duration} mins away`}</h5>
              <p className="font-medium text-xs text-gray-500 mt-1">
                Affordable compact rides
              </p>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{`₹${fareDetails.car}`}</h2>
          </div>

          {/* MOTORCYCLE */}
          <div onClick={() => {
            confirmVehicleHandler()
            setSelectedVehicle('motorcycle');
          }} className="flex items-center bg-gray-50/80 hover:bg-indigo-50/50 border-2 border-transparent hover:border-indigo-500/30 active:border-indigo-500 p-4 rounded-2xl cursor-pointer transition-all shadow-sm">
            <img src="motorbike.webp" className="w-20 object-contain mr-4 drop-shadow-md" alt="" />
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                Moto
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">
                  <i className="ri-user-3-fill"></i> 1
                </span>
              </h4>
              <h5 className="font-semibold text-emerald-600 text-sm mt-0.5">{`${fareDetails.duration * 1.5} mins away`}</h5>
              <p className="font-medium text-xs text-gray-500 mt-1">
                Affordable motorcycle rides
              </p>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{`₹${fareDetails.motorcycle}`}</h2>
          </div>

          {/* AUTO */}
          <div onClick={() => {
            confirmVehicleHandler()
            setSelectedVehicle('auto');
          }} className="flex items-center bg-gray-50/80 hover:bg-indigo-50/50 border-2 border-transparent hover:border-indigo-500/30 active:border-indigo-500 p-4 rounded-2xl cursor-pointer transition-all shadow-sm">
            <img src="auto.webp" className="w-20 object-contain mr-4 drop-shadow-md" alt="" />
            <div className="flex-1">
              <h4 className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                Auto
                <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 bg-gray-200/60 px-1.5 py-0.5 rounded">
                  <i className="ri-user-3-fill"></i> 3
                </span>
              </h4>
              <h5 className="font-semibold text-emerald-600 text-sm mt-0.5">{`${fareDetails.duration * 1.6} mins away`}</h5>
              <p className="font-medium text-xs text-gray-500 mt-1">
                Affordable auto rides
              </p>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{`₹${fareDetails.auto}`}</h2>
          </div>
        </div>
      </div>
    </>
  );
};

export default VehiclePanel;
