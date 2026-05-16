import React from 'react'

const RidePopup = (props) => {
    const ridePopupPanel = props.ridePopupPanel;
    const setRidePopupPanel = props.setRidePopupPanel;
    const ride = props.ride;
    const user = ride?.userId;
    const acceptRideHandler = props.acceptRideHandler;

    return (
        <div
            className={` ${ridePopupPanel ? "translate-y-0" : "translate-y-[120%]"} w-full fixed z-30 bottom-0 bg-white/95 backdrop-blur-xl px-6 py-8 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40`}
        >
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
            
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight mt-2 mb-6">New Ride Request</h3>
            
            <div className='bg-indigo-50/80 border border-indigo-100 rounded-3xl p-4 flex items-center mb-6 justify-between shadow-sm'>
                <div className='flex items-center gap-4'>
                    <div className="bg-white p-1 rounded-full shadow-sm">
                        <img className="h-12 w-12 object-cover rounded-full" src="sample-user.webp" alt="" />
                    </div>
                    <h2 className='text-xl font-bold text-gray-900'>{`${user?.fullName.firstName} ${user?.fullName.lastName}`}</h2>
                </div>
                <div className="bg-indigo-500 text-white px-3 py-1.5 rounded-xl font-bold shadow-sm">
                    {`${(ride?.distance/1000).toFixed(2)} KM `}
                </div>
            </div>
            
            <div className="flex flex-col justify-center gap-5">
                <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 space-y-4 shadow-sm">
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
                                <h3 className="text-lg font-bold text-gray-900">₹{ride?.fare}</h3>
                            </div>
                            <span className="text-xs font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">CASH</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 mt-2">
                    <button
                        onClick={() => {
                            setRidePopupPanel(false);
                        }}
                        className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold p-4 rounded-xl transition-all"
                    >
                        Ignore
                    </button>
                    <button
                        onClick={() => {
                            props.acceptRideHandler();
                        }}
                        className="w-2/3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg p-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all"
                    >
                        Accept Ride
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RidePopup
