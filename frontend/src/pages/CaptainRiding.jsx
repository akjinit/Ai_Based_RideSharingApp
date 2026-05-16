import React, { useState, useEffect, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from 'leaflet';
import FinishRidePanel from '../Components/FinishRidePanel';
import axios from 'axios';

// Component to handle map recentering
const MapRecenterCaptain = ({ captainLocation, userLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (captainLocation) {
            map.setView([captainLocation.lat, captainLocation.lng], 14);
        } else if (userLocation) {
            map.setView([userLocation.lat, userLocation.lng], 14);
        }
    }, [captainLocation, userLocation, map]);

    return null;
};

const CaptainRiding = () => {
    const [finishRidePanel, setFinishRidePanel] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { ride: initialRide, otpVerified } = location.state || {};
    const [savedRide, setSavedRide] = useState(initialRide);
    const [captainLocation, setCaptainLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [routeCoordinates, setRouteCoordinates] = useState([]);

    const leafLetIcons = {
        location: L.icon({
            iconUrl: "./location-marker.png",
            iconSize: [70, 70],
            iconAnchor: [35, 35],
        }),
        car: L.icon({
            iconUrl: "car.png",
            iconSize: [60, 40],
            iconAnchor: [30, 20],
        }),
        motorcycle: L.icon({
            iconUrl: "motorbike.webp",
            iconSize: [60, 40],
            iconAnchor: [30, 20],
        }),
        auto: L.icon({
            iconUrl: "auto.webp",
            iconSize: [60, 40],
            iconAnchor: [30, 20],
        })
    };

    // Get real route from OSRM
    const getOSRMRoute = async (startLat, startLng, endLat, endLng) => {
        try {
            // Validate coordinates
            if (!startLat || !startLng || !endLat || !endLng ||
                isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
                return [];
            }

            const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`;

            const response = await axios.get(url);

            if (response.data && response.data.routes && response.data.routes.length > 0) {
                const route = response.data.routes[0];
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                return coordinates;
            }
            return [];
        } catch (err) {
            console.log("Error fetching OSRM route:", err.message);
            return [];
        }
    }

    // Generate simple route coordinates (fallback)
    const generateSimpleRoute = (startLat, startLng, endLat, endLng, steps = 50) => {
        // Validate coordinates
        if (!startLat || !startLng || !endLat || !endLng ||
            isNaN(startLat) || isNaN(startLng) || isNaN(endLat) || isNaN(endLng)) {
            return [];
        }

        const coordinates = [];
        for (let i = 0; i <= steps; i++) {
            const lat = startLat + (endLat - startLat) * (i / steps);
            const lng = startLng + (endLng - startLng) * (i / steps);
            coordinates.push([lat, lng]);
        }
        return coordinates;
    }

    // Fetch active ride from backend on refresh
    const fetchActiveRide = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active-ride/captain`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.data) {
                setSavedRide(response.data);

                // Set user location if available
                if (response.data.userId?.location?.coordinates) {
                    const [lng, lat] = response.data.userId.location.coordinates;
                    setUserLocation({ lat, lng });
                }

                // Also get user location from ride doc
                if (response.data.userLocation?.coordinates) {
                    const [lng, lat] = response.data.userLocation.coordinates;
                    if (lng && lat) {
                        setUserLocation({ lat, lng });
                    }
                }
            }
        } catch (err) {
            console.log("No active ride found");
            navigate("/captain-home");
        }
    }

    // Update captain location on ride document
    const updateLocationOnRide = async (lat, lng) => {
        if (!savedRide?._id) return;

        try {
            await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/update-captain-location`, {
                rideId: savedRide._id,
                latitude: lat,
                longitude: lng
            }, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                }
            });
        } catch (err) {
            console.log("Error updating captain location:", err);
        }
    }

    useEffect(() => {
        if (initialRide) {
            setSavedRide(initialRide);

            // Set user location if available
            if (initialRide.userId?.location?.coordinates) {
                const [lng, lat] = initialRide.userId.location.coordinates;
                setUserLocation({ lat, lng });
            }

            // Also get user location from ride doc
            if (initialRide.userLocation?.coordinates) {
                const [lng, lat] = initialRide.userLocation.coordinates;
                if (lng && lat) {
                    setUserLocation({ lat, lng });
                }
            }
        } else {
            // Refresh case - fetch from backend
            fetchActiveRide();
        }

        // Get captain's current location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                setCaptainLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            });
        }
    }, [initialRide]);

    // Periodically fetch ride to get updated user location
    useEffect(() => {
        const fetchInterval = setInterval(() => {
            fetchActiveRide();
        }, 5000); // Fetch every 5 seconds

        return () => clearInterval(fetchInterval);
    }, []);

    // Update captain location on ride document
    useEffect(() => {
        if (captainLocation) {
            updateLocationOnRide(captainLocation.lat, captainLocation.lng);
        }
    }, [captainLocation]);

    if (!savedRide) {
        return <div className="h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-lg mb-2">Loading ride...</p>
                <div className="animate-spin">⏳</div>
            </div>
        </div>;
    }

    // Determine map center - priority: captainLocation > userLocation > ride origin
    let mapCenter = [22.961074, 88.433524];
    if (captainLocation) {
        mapCenter = [captainLocation.lat, captainLocation.lng];
    } else if (userLocation) {
        mapCenter = [userLocation.lat, userLocation.lng];
    }

    // Generate polyline from ride origin to destination
    useEffect(() => {
        const generateRoute = async () => {
            if (savedRide) {
                let originLat, originLng, destLat, destLng;

                // Try to get coordinates from ride
                if (savedRide.originCoordinates && savedRide.originCoordinates.latitude && savedRide.originCoordinates.longitude) {
                    originLat = savedRide.originCoordinates.latitude;
                    originLng = savedRide.originCoordinates.longitude;
                }

                if (savedRide.destinationCoordinates && savedRide.destinationCoordinates.latitude && savedRide.destinationCoordinates.longitude) {
                    destLat = savedRide.destinationCoordinates.latitude;
                    destLng = savedRide.destinationCoordinates.longitude;
                }

                // If coordinates are missing, try to fetch from maps service via backend
                if (!originLat || !originLng || !destLat || !destLng) {
                    try {
                        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/ride-coordinates/${savedRide._id}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem("token")}`,
                            },
                        });
                        if (response.data) {
                            originLat = response.data.originLat;
                            originLng = response.data.originLng;
                            destLat = response.data.destLat;
                            destLng = response.data.destLng;
                        }
                    } catch (err) {
                        console.log("Could not fetch coordinates from backend:", err.message);
                    }
                }

                // Generate route if we have valid coordinates
                if (originLat && originLng && destLat && destLng) {
                    const coordinates = await getOSRMRoute(
                        originLat,
                        originLng,
                        destLat,
                        destLng
                    );
                    setRouteCoordinates(coordinates);
                }
            }
        };

        generateRoute();
    }, [savedRide]);

    return (
        <div className="h-screen flex flex-col bg-slate-900 relative overflow-hidden">
            {/* Map Section */}
            <div className="h-[55%] relative z-0">
                <div className="w-full px-4 fixed flex items-center justify-between z-20 top-4">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white/20">
                        <h2 className="text-xl font-extrabold tracking-tight text-gray-900">
                            ride<span className="text-emerald-500">Captain</span>
                        </h2>
                    </div>
                    <Link to="/captain-home">
                        <button className="bg-red-500/90 backdrop-blur-md hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg border border-red-400/50 transition-all">
                            End Early
                        </button>
                    </Link>
                </div>

                <MapContainer
                    center={mapCenter}
                    zoom={14}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution="© OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Recenter map when locations change */}
                    <MapRecenterCaptain captainLocation={captainLocation} userLocation={userLocation} />

                    {/* User location */}
                    {userLocation && (
                        <Marker position={[userLocation.lat, userLocation.lng]} icon={leafLetIcons.location}>
                            <Popup>User Location</Popup>
                        </Marker>
                    )}

                    {/* Captain location */}
                    {captainLocation && (
                        <Marker position={[captainLocation.lat, captainLocation.lng]} icon={leafLetIcons[savedRide?.vehicleType]}>
                            <Popup>Your Location</Popup>
                        </Marker>
                    )}

                    {/* Route polyline */}
                    {routeCoordinates.length > 0 && (
                        <Polyline positions={routeCoordinates} color="#10b981" weight={5} />
                    )}
                </MapContainer>
            </div>

            {/* Ride Info Section */}
            <div className="h-[45%] bg-white/95 backdrop-blur-xl rounded-t-[2.5rem] absolute bottom-0 w-full z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40 p-6 flex flex-col">
                <div className="absolute top-0 left-0 w-full flex justify-center py-4">
                    <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
                </div>

                <div className="flex-1 overflow-y-auto mt-4">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">
                                {savedRide.userId?.fullName?.firstName} {savedRide.userId?.fullName?.lastName}
                            </h3>
                            <p className="text-sm text-gray-500 font-medium">{savedRide.userId?.email}</p>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${savedRide.status === 'in_progress' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}>
                            {savedRide.status === 'in_progress' ? 'EN ROUTE' : savedRide.status?.toUpperCase()}
                        </span>
                    </div>

                    {/* Route Info */}
                    <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4 mb-6 space-y-4">
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                <i className="ri-map-pin-line"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">PICKUP</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">{savedRide.origin}</p>
                            </div>
                        </div>
                        
                        <div className="ml-4 border-l-2 border-dashed border-gray-300 h-4 -my-2"></div>
                        
                        <div className="flex gap-4 items-start">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                <i className="ri-map-pin-user-fill"></i>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-semibold mb-1">DESTINATION</p>
                                <p className="text-sm font-bold text-gray-900 leading-tight">{savedRide.destination}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
                            <p className="text-xs text-gray-500 font-semibold mb-1">DISTANCE</p>
                            <p className="font-bold text-lg text-gray-900">{(savedRide.distance / 1000).toFixed(1)} <span className="text-sm font-medium text-gray-500">km</span></p>
                        </div>
                        <div className="bg-white border border-gray-100 rounded-2xl p-3 text-center shadow-sm">
                            <p className="text-xs text-gray-500 font-semibold mb-1">TIME</p>
                            <p className="font-bold text-lg text-gray-900">{Math.round(savedRide.duration / 60)} <span className="text-sm font-medium text-gray-500">min</span></p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 text-center shadow-sm">
                            <p className="text-xs text-emerald-600 font-semibold mb-1">FARE</p>
                            <p className="font-bold text-xl text-emerald-600">₹{Math.round(savedRide.fare)}</p>
                        </div>
                    </div>

                    {/* Finish Ride Button */}
                    <button
                        onClick={() => setFinishRidePanel(true)}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 text-white font-bold text-lg py-4 rounded-xl transition-all">
                        Complete Journey
                    </button>
                </div>
            </div>

            <FinishRidePanel
                savedRide={savedRide}
                finishRidePanel={finishRidePanel}
                setFinishRidePanel={setFinishRidePanel}
            />
        </div>
    );
};


export default CaptainRiding
