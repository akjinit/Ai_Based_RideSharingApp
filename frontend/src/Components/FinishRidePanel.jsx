import axios from 'axios';
import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const FinishRidePanel = (props) => {
    const { finishRidePanel, setFinishRidePanel, savedRide } = props;
    const navigate = useNavigate();

    async function finishRide() {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/end-ride`, {
            params: {
                rideId: savedRide?._id,
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })

        if (response.status === 200) {
            setFinishRidePanel(false);
            navigate('/captain-home');
        }
    }


    if (!savedRide) return null;

    return (
        <div className={`${finishRidePanel ? "translate-y-0" : "translate-y-[120%]"} w-full fixed z-[1000] bottom-0 bg-white/95 backdrop-blur-xl px-6 py-8 rounded-t-[2.5rem] transition-transform duration-500 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40 flex flex-col h-[85vh]`}>
            <div 
                onClick={() => setFinishRidePanel(false)}
                className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full cursor-pointer hover:bg-gray-400 transition-colors"
            ></div>

            <div className="flex-1 overflow-y-auto mt-4 pb-24">
                <div className='flex items-center justify-between mb-8'>
                    <h3 className="text-3xl font-extrabold tracking-tight text-gray-900">Finish <span className="text-emerald-500">Ride</span></h3>
                </div>

                <div className='bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-3xl p-5 flex items-center mb-6 justify-between shadow-sm'>
                    <div className='flex items-center gap-4'>
                        <div className="bg-white p-1 rounded-full shadow-sm">
                            <img className='h-12 w-12 rounded-full object-cover' src="sample-user.webp" alt="" />
                        </div>
                        <div >
                            <h2 className='text-xl font-bold text-gray-900'>{savedRide?.userId?.fullName?.firstName} {savedRide?.userId?.fullName?.lastName}</h2>
                            <p className='text-emerald-600 text-xs font-bold uppercase tracking-wider'>{savedRide?.paymentMethod || 'Cash'} Payment</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h4 className='text-2xl font-black text-emerald-600'>₹{savedRide?.fare}</h4>
                        <p className='text-[10px] text-gray-500 font-bold uppercase tracking-widest'>Total Fare</p>
                    </div>
                </div>

                <div className='bg-gray-50/80 border border-gray-100 rounded-2xl p-4 space-y-4 shadow-sm mb-6'>
                    <div className='flex items-start gap-4'>
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-1">
                            <i className="ri-map-pin-user-fill"></i>
                        </div>
                        <div>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Pickup</p>
                            <h3 className='text-sm font-bold text-gray-900 leading-tight'>{savedRide?.origin}</h3>
                        </div>
                    </div>
                    
                    <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4 -my-2"></div>
                    
                    <div className='flex items-start gap-4'>
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-1">
                            <i className="ri-map-pin-2-fill"></i>
                        </div>
                        <div>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>Destination</p>
                            <h3 className='text-sm font-bold text-gray-900 leading-tight'>{savedRide?.destination}</h3>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-4 mb-6'>
                    <div className='bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col items-center justify-center'>
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-2">
                             <i className="ri-route-line"></i>
                        </div>
                        <h4 className='text-xl font-black text-gray-900'>{(savedRide?.distance / 1000).toFixed(1)} <span className="text-sm font-bold text-gray-500">KM</span></h4>
                        <span className='text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1'>Distance</span>
                    </div>
                    <div className='bg-purple-50 border border-purple-100 rounded-2xl p-4 flex flex-col items-center justify-center'>
                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-2">
                             <i className="ri-time-line"></i>
                        </div>
                        <h4 className='text-xl font-black text-gray-900'>{Math.round(savedRide?.duration / 60)} <span className="text-sm font-bold text-gray-500">MIN</span></h4>
                        <span className='text-[10px] font-bold text-purple-400 uppercase tracking-widest mt-1'>Duration</span>
                    </div>
                </div>
            </div>

            <div className='absolute bottom-0 left-0 w-full p-6 bg-white border-t border-gray-100 pb-8'>
                <button
                    onClick={finishRide}
                    className='w-full bg-emerald-500 hover:bg-emerald-600 text-white text-xl font-bold py-4 rounded-xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2'>
                    Finish Ride <i className="ri-checkbox-circle-fill text-2xl"></i>
                </button>
            </div>
        </div>
    )
};


export default FinishRidePanel
