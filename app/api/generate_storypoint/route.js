import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI('AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94');

async function run(context) {
  // For text-only input, use the gemini-pro model
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});

  const prompt = `Based on the following storypoint context of a choose your own adventure story, your task is to continue the story. Respond only in a few sentences picking up where the story left off and adding your own twists, making sure to keep the story interesting, suspenseful, and exciting for the user. Here is the context: ${context}`
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  return text;
}

export async function POST(req) {
  const { context } = await req.json();
  const model = genAI.getGenerativeModel({ model: "gemini-pro"});
  
  const prompt = `Based on the following storypoint context of a choose your own adventure story, your task is to continue the story. Respond only in a few sentences picking up where the story left off and adding your own twists, making sure to keep the story interesting, suspenseful, and exciting for the user. Here is the context: ${context}`
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  // console.log(text);

  return Response.json({ 'response': text });
}