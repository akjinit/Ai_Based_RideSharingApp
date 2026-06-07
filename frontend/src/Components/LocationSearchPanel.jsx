import React from "react";

const LocationSearchPanel = (props) => {
  const suggestions = props.suggestions;

  return (
    <div className="pt-2">
      {suggestions.map(function (address, idx) {
        const suggestion = typeof address === "string"
          ? { description: address, main_text: address, secondary_text: "" }
          : address;

        return (
          <div
            key={idx}
            onClick={() => {
              if (props.pickupInputFocused) {
                props.setPickup(suggestion.description);
              }
              if (props.destinationInputFocused) {
                props.setDestination(suggestion.description);
              }
            }}
            className="flex gap-4 border border-transparent hover:border-gray-200 bg-gray-50/50 hover:bg-gray-100 transition-all cursor-pointer p-3.5 rounded-2xl my-2 items-center justify-start"
          >
            <div className="w-10 h-10 bg-gray-200/60 rounded-full flex items-center justify-center shrink-0">
               <i className="ri-map-pin-2-fill text-gray-500 text-lg"></i>
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 text-sm truncate">{suggestion.main_text}</h4>
              {suggestion.secondary_text && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{suggestion.secondary_text}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LocationSearchPanel;
