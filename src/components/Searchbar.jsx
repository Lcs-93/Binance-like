import React from "react";
import { FiSearch } from "react-icons/fi"; 

const SearchBar = () => {
  return (
    <div className="flex items-center bg-gray-800 text-gray-400 rounded-full px-4 py-2 w-full max-w-md">
      <FiSearch className="text-xl mr-2" /> 
      <input
        type="text"
        placeholder="Rechercher un actif"
        className="bg-transparent outline-none flex-1 text-gray-200 placeholder-gray-400"
      />
    </div>
  );
};

export default SearchBar;