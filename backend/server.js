import express from "express";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });

// Create an uploads folder if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// Function to remove background using remove.bg API
async function removeBg(imagePath) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_file", fs.createReadStream(imagePath));

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": "TeyjDz6FiALt63DML3amk3XV" }, // Replace with your remove.bg API key
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

// Route to handle file uploads and background removal
app.post("/remove-background", upload.single("image"), async (req, res) => {
  try {
    const inputPath = req.file.path;
    const outputPath = `uploads/processed-${req.file.filename}`;

    // Remove background
    const rbgResultData = await removeBg(inputPath);
    fs.writeFileSync(outputPath, Buffer.from(rbgResultData));

    res.download(outputPath, (err) => {
      if (err) throw err;
      // Delete the files after download
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    res.status(500).send("An error occurred while processing the image.");
    console.log(error);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
