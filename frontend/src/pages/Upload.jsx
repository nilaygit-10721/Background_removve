import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const Upload = () => {
  const location = useLocation();
  const file = location.state?.file;

  const [selectedFile, setSelectedFile] = useState(null);
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async () => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await axios.post(
        "https://background-remove-xxhl.onrender.com/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          responseType: "blob", // Ensure the response is handled as a blob
        }
      );

      // Create a URL for the processed image and display it
      const imageUrl = URL.createObjectURL(new Blob([response.data]));
      setProcessedImageUrl(imageUrl);
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Your Image</h1>
      {file ? (
        <p className="mb-4">
          File: <span className="font-bold">{file.name}</span>
        </p>
      ) : (
        <p className="mb-4">No file uploaded yet.</p>
      )}

      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleFileUpload}
        disabled={loading}
      >
        {loading ? "Processing..." : "Upload and Remove Background"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {processedImageUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-bold mb-2">Processed Image:</h2>
          <img src={processedImageUrl} alt="Processed" className="max-w-full" />
        </div>
      )}
    </div>
  );
};

export default Upload;
