import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SocketDataContext } from "../context/SocketContext";
import { useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from 'leaflet';
import axios from "axios";

const vehicleImageMap = {
  car: "car.png",
  motorcycle: "motorbike.webp",
  auto: "auto.webp"
};

// Component to handle map recentering
const MapRecenter = ({ captainLocation, userLocation }) => {
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

const Riding = () => {
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [captainLocation, setCaptainLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const { sendMessage, recieveMessage, socket } = useContext(SocketDataContext);

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

  // Fetch ride from backend on refresh
  const fetchRideData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active-ride/user`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data) {
        setRide(response.data);
        
        // Set captain location if available
        if (response.data.captainId?.location?.coordinates) {
          const [lng, lat] = response.data.captainId.location.coordinates;
          setCaptainLocation({ lat, lng });
        }
        
        // Also get captain location from ride doc
        if (response.data.captainLocation?.coordinates) {
          const [lng, lat] = response.data.captainLocation.coordinates;
          if (lng && lat) {
            setCaptainLocation({ lat, lng });
          }
        }
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.log("Error fetching ride data:", err.message);
      navigate("/home");
    }
  }

  // Update user location on ride document
  const updateLocationOnRide = async (lat, lng) => {
    if (!ride?._id) return;
    
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/rides/update-user-location`, {
        rideId: ride._id,
        latitude: lat,
        longitude: lng
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });
    } catch (err) {
      console.log("Error updating user location:", err);
    }
  }

  useEffect(() => {
    // Fetch ride data from backend
    const fetchAndSetupRide = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active-ride/user`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data) {
          setRide(response.data);
          
          // Set captain location if available from ride doc
          if (response.data.captainLocation?.coordinates) {
            const [lng, lat] = response.data.captainLocation.coordinates;
            if (lng && lat) {
              setCaptainLocation({ lat, lng });
            }
          }
        } else {
          navigate("/home");
        }
      } catch (err) {
        console.log("Error fetching ride data:", err.message);
        navigate("/home");
      }
    };

    // Get user's current location from geolocation - non-blocking
    const getAndSetUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log("Geolocation error:", error.message);
          },
          { timeout: 2000, maximumAge: 0 }
        );
      }
    };

    // Start both operations immediately - don't wait for either
    fetchAndSetupRide();
    getAndSetUserLocation();
  }, [navigate]);

  // Periodically fetch ride to get updated captain location
  useEffect(() => {
    const fetchInterval = setInterval(() => {
      fetchRideData();
    }, 5000); // Fetch every 5 seconds

    return () => clearInterval(fetchInterval);
  }, []);

  // Update user location on ride document and geolocation
  useEffect(() => {
    if (userLocation) {
      updateLocationOnRide(userLocation.lat, userLocation.lng);
    }
  }, [userLocation, ride?._id]);

  // Update user location periodically from geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      // Update location every 3 seconds
      const locationInterval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            console.log("Geolocation error:", error.message);
          },
          { timeout: 2000, maximumAge: 0 }
        );
      }, 3000);

      return () => clearInterval(locationInterval);
    }
  }, []);

  useEffect(() => {
    if (socket) {
      recieveMessage('captain-location-update', (data) => {
        setCaptainLocation({
          lat: data.latitude,
          lng: data.longitude
        });
      });

      recieveMessage('ride-ended', (rideData) => {
        setRide(rideData);
        setTimeout(() => {
          navigate('/home');
        }, 3000);
      });
    }
  }, [socket, recieveMessage, navigate]);

  // Monitor ride status and navigate when completed
  useEffect(() => {
    if (ride && ride.status === 'completed') {
      // Show completion message for 2 seconds then navigate
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    }
  }, [ride?.status, navigate]);

  // Generate polyline from ride origin to destination
  useEffect(() => {
    const generateRoute = async () => {
      if (ride) {
        let originLat, originLng, destLat, destLng;

        // Try to get coordinates from ride
        if (ride.originCoordinates && ride.originCoordinates.latitude && ride.originCoordinates.longitude) {
          originLat = ride.originCoordinates.latitude;
          originLng = ride.originCoordinates.longitude;
        }

        if (ride.destinationCoordinates && ride.destinationCoordinates.latitude && ride.destinationCoordinates.longitude) {
          destLat = ride.destinationCoordinates.latitude;
          destLng = ride.destinationCoordinates.longitude;
        }

        // If coordinates are missing, try to fetch from maps service via backend
        if (!originLat || !originLng || !destLat || !destLng) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/ride-coordinates/${ride._id}`, {
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
        } else {
          console.log("Missing coordinates for route generation");
        }
      }
    };

    generateRoute();
  }, [ride]);

  if (!ride) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <p className="text-lg mb-4 text-gray-300">Loading your journey...</p>
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Determine map center - priority: captainLocation > userLocation > ride origin
  let mapCenter = [22.961074, 88.433524];
  if (captainLocation) {
    mapCenter = [captainLocation.lat, captainLocation.lng];
  } else if (userLocation) {
    mapCenter = [userLocation.lat, userLocation.lng];
  }

  // Show ride completion modal
  if (ride.status === 'completed') {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-900 bg-opacity-95">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-10 text-center shadow-2xl max-w-sm w-full mx-4">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
            <i className="ri-check-line text-4xl text-white"></i>
          </div>
          <h2 className="text-3xl font-bold mb-2 text-white">Journey Complete</h2>
          <p className="text-gray-300 mb-8">Thank you for riding with rideShare</p>
          
          <div className="bg-slate-800/50 rounded-2xl p-5 mb-4 border border-slate-700">
            <p className="text-sm text-gray-400 mb-1">Total Distance</p>
            <p className="text-2xl font-bold text-white">{(ride.distance / 1000).toFixed(2)} KM</p>
          </div>
          
          <div className="bg-emerald-500/10 rounded-2xl p-5 mb-8 border border-emerald-500/20">
            <p className="text-sm text-emerald-400 mb-1">Total Fare</p>
            <p className="text-3xl font-bold text-emerald-400">₹{Math.round(ride.fare)}</p>
          </div>
          
          <p className="text-sm text-gray-500 animate-pulse">Redirecting to home...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 relative overflow-hidden">
      {/* MAP */}
      <div className="h-[60%] relative z-0">
        <Link to="/home" className="fixed left-4 top-4 w-12 h-12 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-xl z-20 shadow-lg border border-white/20 hover:bg-white transition-colors">
          <i className="ri-home-4-line text-2xl text-gray-800"></i>
        </Link>

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
          <MapRecenter captainLocation={captainLocation} userLocation={userLocation} />

          {/* User location */}
          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={leafLetIcons.location}>
            </Marker>
          )}

          {/* Captain location */}
          {captainLocation && (
            <Marker position={[captainLocation.lat, captainLocation.lng]} icon={leafLetIcons[ride?.vehicleType]}>
            </Marker>
          )}

          {/* Route polyline */}
          {routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} color="#6366f1" weight={5} />
          )}
        </MapContainer>
      </div>

      {/* RIDE INFO */}
      <div className="h-[45%] p-6 rounded-t-[2.5rem] absolute w-full z-10 bottom-0 bg-white/95 backdrop-blur-xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40 overflow-y-auto">
        <div className="absolute top-0 left-0 w-full flex justify-center py-4">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>
        
        <div className="mt-4">
          {!ride ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading ride information...</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {ride.status === 'in_progress' ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                      En Route
                    </span>
                  ) : 'Status: ' + ride.status}
                </h3>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-semibold border border-indigo-100">
                  {ride.otp}
                </div>
              </div>

              {/* Captain details */}
              <div className="flex justify-between items-center bg-gray-50/80 border border-gray-100 p-4 rounded-2xl mb-6 shadow-sm">
                <img src={vehicleImageMap[ride.vehicleType]} className="w-24 object-contain" alt="" />

                <div className="text-right">
                  <h2 className="text-lg font-semibold text-gray-800">
                    {ride.captainId?.fullName?.firstName || "Captain"}
                  </h2>
                  <h4 className="text-2xl font-bold text-gray-900 -mt-1">
                    {ride.captainId?.vehicle?.plate || "—"}
                  </h4>
                  <p className="text-sm text-gray-500 font-medium">
                    {ride?.vehicleType || "Vehicle"}
                  </p>
                </div>
              </div>

              {/* Route & Payment */}
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50/80 border border-gray-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <i className="ri-map-pin-user-fill text-xl"></i>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Destination</p>
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">
                      {ride.destination}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-emerald-50/80 border border-emerald-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shrink-0">
                    <i className="ri-money-rupee-circle-fill text-xl"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-emerald-600/80 font-medium mb-1">Payment Amount</p>
                    <h3 className="text-xl font-bold text-emerald-700">
                      ₹{ride.fare}
                    </h3>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-lg border border-emerald-100 text-emerald-700 text-xs font-bold shadow-sm">
                    {ride.paymentMethod || "CASH"}
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-4 bg-emerald-500 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-colors">
                Make Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Riding;
