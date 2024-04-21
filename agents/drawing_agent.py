from uagents import Agent, Context, Model
import base64
import requests
import os
import together
together.api_key="713ab4d86fc2505d5632f1cf7039fe3740bd25c15d56722a4e94f5067eb81c11"
def get_ai_image(correct):
    response = together.Image.create(
        prompt=f"{correct} drawn in crude pictionary style by a child in black on a white",
        model="stabilityai/stable-diffusion-2-1", width=500, height=500)
    image = response["output"]["choices"][0]
    output = image["image_base64"]
    return output

GUESSING_AGENT_ADDRESS = "agent1qw23p2euxrt0ysppyfaxn46gusswu3tm2jrtgc5xq4kh328u2r7ej555mcc"
class Request0(Model):
    correct: str

class Response(Model):
    text: str

class GuesserRequest(Model):
    correct: str
    guessed: str

drawing_agent = Agent(
    name="drawing_agent",
    seed="drawingrecovery",
    port=8001,
    endpoint="http://localhost:8001/submit",
)

@drawing_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Starting up {drawing_agent.name}")
    ctx.logger.info(f"With address: {drawing_agent.address}")


@drawing_agent.on_query(model=Request0, replies={Response, GuesserRequest, Request0})
async def query_handler(ctx: Context, sender: str, _query: Request0):
    ctx.logger.info("Query received")

    # img = get_ai_image(_query.correct)
    url = "https://api.fireworks.ai/inference/v1/image_generation/accounts/fireworks/models/stable-diffusion-xl-1024-v1-0"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer VZlLjrlTqebChSNFepvks5aJzIxfu5RF1wTNppYHGtphRdkp",
        "Accept": "application/json"
    }
    prompt = f"Draw a/n {_query.correct} extremely crudely and sloppily in black and white. Use few lines and make it look handdrawn."
    payload = {"prompt": prompt}

    response = requests.post(url, headers=headers, json=payload)
    data = response.json()
    await ctx.send(sender, Request0(correct=data[0]['base64']))


if __name__ == "__main__":
    drawing_agent.run()


    import requests
import json

