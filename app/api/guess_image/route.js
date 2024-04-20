import fetch from 'node-fetch';
import sharp from 'sharp';
// const fs = require('fs');
import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94');
const model = genAI.getGenerativeModel({ model: "gemini-pro-vision"});

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function getImageGuess(imagePath) {
  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "In as few words as possible, guess what this basic picture depicts. The answer will not be advanced and should be around 1 word. If you only see white, type 'blank'.";

  const imageParts = [
    fileToGenerativePart(imagePath, "image/png")
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  // console.log(text);
  return text;
}

export async function POST(req) {
  let { image, username } = await req.json();
  image = image.replace(/^data:image\/\w+;base64,/, "");

  // Decode the base64 image
  const decodedImage = Buffer.from(image, 'base64');
  
  try {
    // Convert the image and save it as a JPEG file
    const data = await sharp(decodedImage)
      .flatten({ background: { r: 255, g: 255, b: 255 } }) // Add white background
      .jpeg() // Convert to JPEG
      .toBuffer(); // Convert to buffer

    // Save the image as a JPEG file
    fs.writeFileSync(`./app/api/guess_image/image-${username}.png`, data);

    // Get the image guess
    const guess = await getImageGuess(`./app/api/guess_image/image-${username}.png`);
    console.log(guess);

    return Response.json({ guess });
  } catch (err) {
    console.error(err);
    return Response.json({ 'error': 'error processing picture' });
  }
}
