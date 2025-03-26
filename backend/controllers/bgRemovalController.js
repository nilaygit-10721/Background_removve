import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import fs from "fs";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

async function removeBg(filePath, filename) {
  if (!process.env.REMOVE_BG_API_KEY) {
    throw new Error("Remove.bg API key not configured");
  }

  try {
    // Read the file synchronously
    const imageBuffer = fs.readFileSync(filePath);

    // Verify the file isn't empty
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error("Empty file received");
    }

    const formData = new FormData();
    const fileBlob = new Blob([imageBuffer], { type: "image/png" });
    formData.append("size", "auto");
    formData.append("image_file", fileBlob, filename);

    const response = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return await response.arrayBuffer();
  } catch (error) {
    console.error("Remove.bg processing error:", error);
    throw error;
  }
}

export const removeBackground = async (req, res) => {
  let outputPath;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    console.log("Processing image:", req.file.path);

    // Process the image
    const resultBuffer = await removeBg(req.file.path, req.file.originalname);

    // Verify the result isn't empty
    if (!resultBuffer || resultBuffer.byteLength === 0) {
      throw new Error("Empty result from background removal");
    }

    // Generate output path
    outputPath = `processed-${Date.now()}.png`;
    fs.writeFileSync(outputPath, Buffer.from(resultBuffer));

    // Log activity
    const activity = new Activity({
      user: req.user._id,
      actionType: "background-removal",
      imageUrl: `/uploads/${req.file.filename}`,
      processedAt: new Date(),
    });
    await activity.save();

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { processedImages: 1 },
      $set: { lastActive: new Date() },
    });

    // Send the result
    res.download(outputPath, (err) => {
      // Clean up files
      [req.file.path, outputPath].forEach((path) => {
        if (path && fs.existsSync(path)) fs.unlinkSync(path);
      });
      if (err) console.error("Download error:", err);
    });
  } catch (error) {
    console.error("Background removal error:", error);
    // Clean up files
    [req.file?.path, outputPath].forEach((path) => {
      if (path && fs.existsSync(path)) fs.unlinkSync(path);
    });

    res.status(500).json({
      success: false,
      message: "Background removal failed",
      error: error.message,
    });
  }
};
