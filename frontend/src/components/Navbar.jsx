import React from "react";
import { Link } from "react-router-dom";
import bg from "../assets/bg-removebg-preview.png";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-lg">
      <div className="container flex   ">
        <div className="flex  ">
          <Link to="/">
            <img src={bg} className="h-20 w-24 " alt="image" />
          </Link>
        </div>

        <div className="flex mx-[3rem]   items-center space-x-6">
          <Link
            to="/"
            className="flex flex-col items-center hover:text-yellow-800"
          >
            <span className="text-lg">Home</span>
          </Link>
          <Link
            to="/upload"
            className="flex flex-col items-center hover:text-yellow-800  "
          >
            <span className="text-lg">Remove Background</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
