import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  Upload as UploadIcon,
  Image as ImageIcon,
} from "lucide-react";

const Upload = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(location.state?.file || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // File selection handler
  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!selectedFile) {
      setError("No file selected");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setError("Invalid file type. Please upload JPEG, PNG, GIF, or WebP.");
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (selectedFile.size > maxSize) {
      setError("File is too large. Maximum size is 10MB.");
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(selectedFile);

    setFile(selectedFile);
    setError(null);
  };

  // Handle file upload and background removal
  const handleFileUpload = async () => {
    // Validate file before upload
    if (!file) {
      setError("Please select a file first");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "https://background-remove-xxhl.onrender.com/remove-background",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // Ensure the response is handled as a blob
          timeout: 60000, // 60 seconds timeout
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            console.log(`Upload progress: ${percentCompleted}%`);
          },
        }
      );

      // Create a URL for the processed image and display it
      const imageUrl = URL.createObjectURL(new Blob([response.data]));
      setProcessedImageUrl(imageUrl);
    } catch (err) {
      // More detailed error handling
      if (err.response) {
        setError(
          `Server Error: ${err.response.status} - ${err.response.statusText}`
        );
      } else if (err.request) {
        setError(
          "No response received from server. Please check your internet connection."
        );
      } else {
        setError("Error uploading file. Please try again.");
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Download processed image
  const handleDownload = () => {
    if (processedImageUrl) {
      const link = document.createElement("a");
      link.href = processedImageUrl;
      link.download = `bg-removed-${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Clean up blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (processedImageUrl) {
        URL.revokeObjectURL(processedImageUrl);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [processedImageUrl, previewUrl]);

  return (
    <div className="container mx-auto p-4 max-w-md bg-gradient-to-br from-blue-50 to-white min-h-screen flex flex-col justify-center">
      <div className="bg-white shadow-2xl rounded-2xl p-6 border border-gray-100">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center">
          <ImageIcon className="mr-3 text-blue-500" />
          Background Remover
        </h1>

        {/* File Input */}
        <div className="mb-4">
          <label
            htmlFor="file-upload"
            className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <UploadIcon className="mr-2" />
            {file ? `Change File (${file.name})` : "Select Image"}
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Preview Image */}
        {previewUrl && !processedImageUrl && (
          <div className="mb-4 relative">
            <div className="border-2 border-blue-100 rounded-lg overflow-hidden shadow-md">
              <img
                src={previewUrl}
                alt="Preview"
                className={`w-full h-auto object-cover transition-all duration-500 ease-in-out ${
                  loading ? "filter blur-sm opacity-50 scale-105" : ""
                }`}
              />
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                  <Loader2 className="animate-spin text-white w-12 h-12" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload and Process Button */}
        <button
          className={`w-full py-3 px-4 rounded-lg text-white flex items-center justify-center space-x-2 transition-all duration-300 ease-in-out transform ${
            file && !loading
              ? "bg-green-500 hover:bg-green-600 hover:scale-105"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={handleFileUpload}
          disabled={!file || loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Remove Background"
          )}
        </button>

        {/* Error Handling */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-pulse">
            {error}
          </div>
        )}

        {/* Processed Image Display */}
        {processedImageUrl && (
          <div className="mt-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-2 text-center text-gray-800">
              Processed Image
            </h2>
            <div className="border-2 border-gray-200 rounded-lg p-2 shadow-lg">
              <img
                src={processedImageUrl}
                alt="Background Removed"
                className="max-w-full mx-auto mb-4 rounded-md transition-all duration-500 ease-in-out hover:scale-105"
              />
              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Download Processed Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Upload;
