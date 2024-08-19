import express from "express";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

async function removeBg(imageUrl) {
  const formData = new FormData();
  formData.append("size", "auto");
  formData.append("image_url", imageUrl);

  const response = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": "TeyjDz6FiALt63DML3amk3XV" },
    body: formData,
  });

  if (response.ok) {
    return await response.arrayBuffer();
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

app.post("/remove-background", async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).send("Image URL is required.");
    }

    const rbgResultData = await removeBg(imageUrl);

    const outputPath = `processed-${Date.now()}.png`;
    fs.writeFileSync(outputPath, Buffer.from(rbgResultData));

    res.download(outputPath, (err) => {
      if (err) throw err;

      fs.unlinkSync(outputPath);
    });
  } catch (error) {
    res.status(500).send("An error occurred while processing the image.");
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
