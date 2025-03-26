import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  Upload as UploadIcon,
  Image as ImageIcon,
  X as XIcon,
  Download,
  RotateCw,
} from "lucide-react";
import { toast } from "react-toastify";

const Upload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [file, setFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const backend = import.meta.env.VITE_BACKEND;

  // Check for passed image from home page
  useEffect(() => {
    if (location.state?.image) {
      const { file: passedFile, previewUrl: passedPreview } =
        location.state.image;
      setFile(passedFile);
      setPreviewUrl(passedPreview);
    }
  }, [location.state]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!selectedFile) {
      setError("No file selected");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Please upload an image (JPEG, PNG, GIF, or WebP)");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("Image must be smaller than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setError(null);
    };
    reader.readAsDataURL(selectedFile);

    setFile(selectedFile);
    setProcessedImageUrl(null);
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    setProcessedImageUrl(null);
    setError(null);
  };

  const handleFileUpload = async () => {
    if (!file) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        throw new Error("Please login to continue");
      }

      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(`${backend}/api/bg-removal`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      });

      const imageUrl = URL.createObjectURL(response.data);
      setProcessedImageUrl(imageUrl);
      toast.success("Background removed successfully!");
    } catch (err) {
      let errorMessage = "Failed to process image";
      if (err.response?.data instanceof Blob) {
        errorMessage = await err.response.data.text();
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (processedImageUrl) {
      const link = document.createElement("a");
      link.href = processedImageUrl;
      link.download = `bg-removed-${file.name.replace(/\.[^/.]+$/, "")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Download started!");
    }
  };

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [processedImageUrl, previewUrl]);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Background Remover</h1>
        <p className="text-gray-600 mt-1">
          Upload an image to remove its background
        </p>
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors bg-gray-50">
          {previewUrl ? (
            <div className="relative w-full h-full">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
              >
                <XIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-8 h-8 mb-3 text-gray-500" />
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mb-6">
        <button
          onClick={handleFileUpload}
          disabled={!file || loading}
          className={`flex-1 py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors ${
            !file || loading
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Processing...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2" size={18} />
              Remove Background
            </>
          )}
        </button>
      </div>

      {/* Processed Image */}
      {processedImageUrl && (
        <div className="animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold text-gray-800">Result</h2>
            <div className="flex space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                title="Download"
              >
                <Download size={18} />
              </button>
              <button
                onClick={clearFile}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                title="Start Over"
              >
                <RotateCw size={18} />
              </button>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden bg-gray-100">
            <img
              src={processedImageUrl}
              alt="Processed result"
              className="w-full h-auto"
            />
          </div>
          <div className="mt-3 text-center text-sm text-gray-500">
            Right-click the image to save, or use the download button above
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
