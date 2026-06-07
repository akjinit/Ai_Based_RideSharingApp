import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CaptainDetails from "../Components/CaptainDetails";
import RidePopup from "../Components/RidePopup";
import ConfirmRidePopup from "../Components/ConfirmRidePopup";
import { CaptainDataContext } from "../context/CaptainContext";
import { SocketDataContext } from "../context/SocketContext";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet'

const icon = L.icon({
  iconUrl: './location-marker.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

import axios from 'axios'

const UpdateMapComponent = ({ location }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([location.lat, location.lng], 15);
  }, [location, map]);

  return null;
}


const CaptainHome = () => {
  const [ridePopupPanel, setRidePopupPanel] = useState(false);
  const [confirmRidePopupPanel, setConfirmRidePopupPanel] = useState(false);
  const { sendMessage, recieveMessage, socket } = useContext(SocketDataContext);
  const [ride, setRide] = useState(null);
  const { captain } = useContext(CaptainDataContext);
  const navigate = useNavigate();
  const [location, setLocation] = useState({ lat: 22.961074, lng: 88.433524 });
  const [captainDetailsPanelOpen, setCaptainDetailsPanelOpen] = useState(true);

  const fetchActiveRide = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/rides/active-ride/captain`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data) {
        setRide(response.data);
        if (response.data.status === 'in_progress') {
          navigate('/captain-riding', { state: { ride: response.data } });
        } else {
          setConfirmRidePopupPanel(true);
        }
      }
    } catch (err) {
      // No active ride found, which is normal
      console.log("No active ride found");
    }
  }

  const updateLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setLocation({
          lat: latitude,
          lng: longitude
        })

        if (captain?._id) {
          sendMessage('update-location-captain', { captainId: captain._id, latitude, longitude, rideId: ride?._id });
        }
      }, (err) => {
        console.error("Error getting location:", err);
      });
    }
  }


  const acceptRideHandler = async () => {
    setRidePopupPanel(false);

    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/rides/accept-ride`,
      {
        rideId: ride._id,
        captainId: captain._id
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    console.log(response.data);
    setConfirmRidePopupPanel(true);
  }

  useEffect(() => {
    // Check for active ride on mount
    if (captain?._id) {
      fetchActiveRide();
      sendMessage('join', { userType: "captain", userId: captain._id });
    }
  }, [captain,socket]);

  useEffect(() => {
    if (socket) {
      recieveMessage('new-ride-request', (ride) => {
        console.log("New ride request received:", ride);
        setRide(ride);
        setRidePopupPanel(true);
      });
    }
  }, [socket, recieveMessage]);

  useEffect(() => {
    updateLocation();
    const locationInterval = setInterval(() => {
      updateLocation();
    }, 5000);

    return () => clearInterval(locationInterval);
  }, [ride]);




  return (
    <div className="h-screen relative overflow-hidden bg-slate-900">
      <div className="w-full px-5 py-4 fixed top-0 z-20 flex items-center justify-between">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl shadow-sm border border-white/20">
          <h2 className="text-xl font-extrabold tracking-tight text-gray-900 pointer-events-none">
            ride<span className="text-emerald-500">Captain</span>
          </h2>
        </div>

        <Link to="/captain/logout" className="h-12 w-12 bg-white/90 backdrop-blur-md flex items-center justify-center rounded-xl shadow-sm border border-white/20 hover:bg-white transition-colors text-red-500 hover:text-red-600">
          <i className="text-xl font-medium ri-logout-box-r-line"></i>
        </Link>
      </div>

      <div className="h-screen w-screen absolute z-0">
        <MapContainer
          center={[location.lat, location.lng]}
          zoom={14}
          className="h-full w-full"
        >
          <TileLayer
            attribution="© OpenStreetMap"
            className=""
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <UpdateMapComponent location={location} />
          <Marker position={[location.lat, location.lng]} icon={icon}></Marker>
        </MapContainer>
      </div>

      <div className={`h-[45%] p-6 rounded-t-[2.5rem] fixed w-full z-10 bottom-0 bg-white/95 backdrop-blur-xl transition-transform duration-500 overflow-y-scroll shadow-[0_-10px_40px_rgba(0,0,0,0.15)] border-t border-white/40 ${captainDetailsPanelOpen ? 'translate-y-0' : 'translate-y-[85%]'}`}>
        <div
          onClick={() => setCaptainDetailsPanelOpen(!captainDetailsPanelOpen)}
          className="absolute top-0 left-0 w-full flex justify-center py-4 cursor-pointer"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors"></div>
        </div>

        <div className="mt-4">
          <CaptainDetails />
        </div>
      </div>

      <RidePopup ride={ride} acceptRideHandler={acceptRideHandler} setRidePopupPanel={setRidePopupPanel} ridePopupPanel={ridePopupPanel} />
      <ConfirmRidePopup ride={ride} confirmRidePopupPanel={confirmRidePopupPanel} setConfirmRidePopupPanel={setConfirmRidePopupPanel} />
    </div>
  );
};

export default CaptainHome;
