async function promptSDXL(description) {
  const response = await fetch(
    "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer VZlLjrlTqebChSNFepvks5aJzIxfu5RF1wTNppYHGtphRdkp `,
        Accept: "application/json",
      },
      body: JSON.stringify({ prompt: `Draw something that depicts the following setting in the story: ${description}` }),
    },
  );
  return await response.json().then((data) => data[0].base64);
}

export async function POST(req) {
  const { prompt } = await req.json();
  const image = await promptSDXL(prompt);
  return Response.json({ image });
}
