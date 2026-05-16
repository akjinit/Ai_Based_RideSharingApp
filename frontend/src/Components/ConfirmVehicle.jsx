import React from "react";

const ConfirmVehicle = (props) => {
  const confirmVehiclePanel = props.confirmVehiclePanel;
  const setConfirmVehiclePanel = props.setConfirmVehiclePanel;
  const setlookingForDriverPanel = props.setlookingForDriverPanel;
  const selectedVehicle = props.selectedVehicle;

  const fareDetails = props.fareDetails;
  const pickup = props.pickup;
  const destination = props.destination;
  const createRide = props.createRide;

  const vehicleImageMap = {
    car: "car.png",
    motorcycle: "motorbike.webp",
    auto: "auto.webp"
  };

  return (
    <div
      className={` ${
        confirmVehiclePanel ? "translate-y-0" : "translate-y-[120%]"
      } w-full fixed z-20 bottom-0 bg-white/95 backdrop-blur-xl px-6 py-8 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40`}
    >
      <div 
        onClick={() => setConfirmVehiclePanel(false)}
        className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
      ></div>

      <h3 className="text-2xl font-bold text-gray-900 tracking-tight mt-2">Confirm Your Ride</h3>
      
      <div className="flex flex-col justify-center mt-6">
        <div className="bg-gray-50/80 border border-gray-100 rounded-3xl p-6 mb-6 shadow-sm flex justify-center">
          <img src={vehicleImageMap[selectedVehicle]} className="w-40 object-contain drop-shadow-lg transform scale-110" alt="Vehicle" />
        </div>

        <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 mb-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <i className="ri-map-pin-line"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">PICKUP</p>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{pickup}</h3>
            </div>
          </div>
          
          <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4 -my-2"></div>

          <div className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <i className="ri-map-pin-user-fill"></i>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">DESTINATION</p>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">{destination}</h3>
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
                <h3 className="text-lg font-bold text-gray-900">{`₹${fareDetails[selectedVehicle]}`}</h3>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">CASH</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setConfirmVehiclePanel(false);
            setlookingForDriverPanel(true);
            createRide(selectedVehicle);
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/30"
        >
          Confirm & Request
        </button>
      </div>
    </div>
  );
};

export default ConfirmVehicle;
