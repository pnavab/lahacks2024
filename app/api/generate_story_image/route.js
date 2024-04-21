import OpenAI from "openai";

const openai = new OpenAI();

const response = await openai.images.generate({
  model: "dall-e-2",
  prompt: "a line art, sketch vibe white siamese cat",
  n: 1,
  size: "1024x1024",
});
const image_url = response.data[0].url;
console.log(image_url);

export async function POST(req) {
  let { prompt } = await req.json();
}