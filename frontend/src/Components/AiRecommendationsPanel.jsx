import React from 'react';

const AiRecommendationsPanel = ({ 
    aiPanelOpen, 
    setAiPanelOpen, 
    recommendations, 
    isAiLoading, 
    onSelectPlace 
}) => {
    return (
        <div className={`fixed inset-x-0 bottom-0 z-50 bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40 transition-transform duration-500 ease-in-out ${aiPanelOpen ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
            
            <div className="p-6 pt-10 flex flex-col h-[65vh]">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 inline-block text-transparent bg-clip-text tracking-tight">✨ AI Inspire Me</h3>
                    <button 
                        onClick={() => setAiPanelOpen(false)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm"
                    >
                        <i className="ri-close-line text-2xl"></i>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-6">
                    {isAiLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-6">
                            <div className="relative">
                               <div className="w-16 h-16 border-4 border-indigo-100 rounded-full"></div>
                               <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                            </div>
                            <p className="text-gray-500 font-bold animate-pulse text-lg tracking-tight">Discovering hidden gems nearby...</p>
                        </div>
                    ) : recommendations && recommendations.length > 0 ? (
                        <div className="space-y-4 pt-2">
                            {recommendations.map((place, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => {
                                        onSelectPlace(place.name);
                                        setAiPanelOpen(false);
                                    }}
                                    className="bg-white/80 border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all cursor-pointer group hover:-translate-y-1"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-500 group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-sm">
                                            <i className="ri-map-pin-star-fill text-2xl"></i>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">{place.name}</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed font-medium">{place.description}</p>
                                        </div>
                                        <div className="flex items-center text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all h-12">
                                            <i className="ri-arrow-right-s-line text-3xl"></i>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-50">
                            <div className="bg-gray-100 p-6 rounded-full mb-4 text-gray-400">
                                <i className="ri-planet-line text-5xl"></i>
                            </div>
                            <p className="text-gray-500 font-bold text-lg">Click the button below to discover amazing places to visit!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiRecommendationsPanel;
