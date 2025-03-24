import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

// Remove background from image
export const removeBackground = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Image URL is required.",
      });
    }

    // Process the image
    const rbgResultData = await removeBg(imageUrl);

    // Generate unique filename
    const outputPath = `processed-${Date.now()}.png`;
    fs.writeFileSync(outputPath, Buffer.from(rbgResultData));

    // Log user activity
    const activity = new Activity({
      user: req.user._id,
      actionType: "background-removal",
      imageUrl,
      processedAt: new Date(),
    });

    await activity.save();

    // Update user's activity count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { processedImages: 1 },
      $set: { lastActive: new Date() },
    });

    // Send the processed image
    res.download(outputPath, (err) => {
      if (err) throw err;
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the image.",
      error: error.message,
    });
  }
};

// Helper function to remove background
async function removeBg(imageUrl) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", imageUrl);

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": process.env.REMOVE_BG_API_KEY || "TeyjDz6FiALt63DML3amk3XV",
    },
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}
