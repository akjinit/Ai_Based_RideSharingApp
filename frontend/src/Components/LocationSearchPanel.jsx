import React from "react";

const LocationSearchPanel = (props) => {
  const suggestions = props.suggestions;

  return (
    <div className="pt-2">
      {suggestions.map(function (address, idx) {
        return (
          <div
            key={idx}
            onClick={() => {
              if (props.pickupInputFocused) {
                props.setPickup(address);
              }
              if (props.destinationInputFocused) {
                props.setDestination(address);
              }
            }}
            className="flex gap-4 border border-transparent hover:border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-all cursor-pointer p-3.5 rounded-2xl my-2 items-center justify-start"
          >
            <div className="w-10 h-10 bg-gray-200/60 rounded-full flex items-center justify-center shrink-0">
               <i className="ri-map-pin-2-fill text-gray-500 text-lg"></i>
            </div>
            <h4 className="font-medium text-gray-800 text-sm">{address}</h4>
          </div>
        );
      })}
    </div>
  );
};

export default LocationSearchPanel;
