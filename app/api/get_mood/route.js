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
      data: path.toString("base64"),
      mimeType
    },
  };
}

async function getHexCodes(imagePath) {
  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "Describe the mood of the following image and generate only 2 hex codes that define the emotions expressed by this image. If you see a blank image, type 'blank'. Answer in the following format: #HEX1, #HEX2";

  const imageParts = [
    fileToGenerativePart(imagePath, "image/png")
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();

  const regex = /#([A-Fa-f0-9]{6})(?:, *#([A-Fa-f0-9]{6}))?/g;
  const matches = text.match(regex);
  console.log("matches", matches);
  if (matches) {
    const hexArr = matches[0].split(',');
    const hex1 = hexArr[0];
    const hex2 = hexArr[1];
    console.log(`Hex1: ${hex1}, Hex2: ${hex2}`);
    return [hex1, hex2];
  } else {
    return ['#0D98BA', '#BA2F0D']
  }
}

export async function POST(req) {
  let { image } = await req.json();
  image = image.replace(/^data:image\/\w+;base64,/, "");

  // Decode the base64 image
  const decodedImage = Buffer.from(image, 'base64');
  
  try {
    // Convert the image and save it as a JPEG file
    const hexCodes = await getHexCodes(decodedImage);
    console.log(hexCodes);

    return Response.json({ 'hex1': hexCodes[0], 'hex2': hexCodes[1] });
  } catch (err) {
    console.error(err);
    return Response.json({ 'error': 'error processing picture' });
  }
}
