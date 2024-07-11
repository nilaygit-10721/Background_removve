import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import roko from "../assets/download-removebg-preview.jpg";
import decor from "../assets/home-assets.jpg";
import car from "../assets/car6-thumbnail.jpg";
import carbg from "../assets/car6-thumbnail-bgremove.png";
import "./style.css";

const Home = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [change, setChange] = useState(50); // Changed to number for slider

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      navigate("/upload", { state: { file: selectedFile } });
    }
  };

  const handleSliderChange = (e) => {
    setChange(e.target.value);
  };

  return (
    <div className="relative container mx-auto p-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold mb-4">
            Welcome to the Background Remover
          </h1>
          <div className="mx-auto mt-2 max-w-xs sm:max-w-md lg:max-w-lg">
            <img className="rounded-lg w-full" src={roko} alt="roko" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-zinc-700 text-center lg:text-left">
            Remove Image <br className="hidden lg:block" /> Background
          </h1>
          <p className="text-xl sm:text-2xl mt-4 font-semibold text-zinc-700 text-center lg:text-left">
            100% Automatically and
            <span className="ml-2">
              <mark className="p-1 rounded-sm">Free</mark>
            </span>
          </p>
        </div>
        <div className="flex-1 top-[120px] mt-8 lg:mt-0 lg:ml-8 lg:order-first relative">
          <div
            className="relative h-[200px] w-[250px] sm:h-[250px] sm:w-[300px] lg:h-[300px] lg:w-[350px] bg-zinc-100 rounded-xl flex flex-col justify-center items-center mx-auto lg:mx-0"
            style={{ boxShadow: "0px 0px 15px -2px #000000" }}
          >
            <img
              className="absolute top-[-38px] -z-10  right-[-42px] sm:top-[-50px] sm:right-[-50px] lg:top-[-40px] lg:right-[-60px] h-[60px] w-[65px] sm:h-[70px] sm:w-[77px] lg:h-[80px] lg:w-[87px]"
              src={decor}
              alt="assets"
            />
            <label className="cursor-pointer">
              <input
                type="file"
                className="file-input hidden"
                onChange={handleFileChange}
              />
              <h1 className="text-center text-lg text-zinc-700">
                Upload Image
              </h1>
            </label>
          </div>
        </div>
      </div>
      <div className="flex flex-col justify-center items-center mt-[8rem]">
        <h1 className=" sm:mt-14 text-2xl font-semibold mb-4">Best Quality</h1>
      </div>
      <div className="relative flex justify-center">
        <div className="absolute ">
          <img
            className=" z-10"
            style={{ clipPath: `inset(0 0 0 ${change}%)` }}
            src={car}
            alt="Best Quality Image"
          />

          <input
            type="range"
            min="0"
            max="100"
            value={change}
            onChange={handleSliderChange}
            className=" w-full h-full absolute top-0 custom-slider z-20 vertical-slider   border-2 border-red-900"
          />
        </div>
        <div className="absolute">
          <img src={carbg} alt="Best Quality Image" />
        </div>
      </div>
    </div>
  );
};

export default Home;
