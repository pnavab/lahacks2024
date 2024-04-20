import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94');

async function run() {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = "Generate a 5-word simple and funny prompt for a fast paced drawing game."

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}

export async function GET() {
  const prompt = await run();
  return Response.json({ prompt });
}

run();
