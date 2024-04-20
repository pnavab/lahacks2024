from uagents import Agent, Context, Model

import google.generativeai as genai
from PIL import Image
from io import BytesIO
import base64
class Request(Model):
    base64encodedimage: str


class Response(Model):
    text: str


guesser_agent = Agent(
    name="guesser_agent",
    seed="guesserrecovery",
    port=8001,
    endpoint="http://localhost:8001/submit",
)

@guesser_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Starting up {guesser_agent.name}")
    ctx.logger.info(f"With address: {guesser_agent.address}")


@guesser_agent.on_query(model=Request, replies={Response})
async def query_handler(ctx: Context, sender: str, _query: Request):
    ctx.logger.info("Query received")
    try:
        # do something here
        genai.configure(api_key='AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94')
        model = genai.GenerativeModel(model_name="gemini-pro-vision")
        img = Image.open(BytesIO(base64.b64decode(_query.base64encodedimage)))
        response = model.generate_content(["respond with one or two words that describe what the image is of. do not include any words describing or elaborating on your answer.", img])
        
        
        await ctx.send(sender, Response(text=_query.base64encodedimage))
    except Exception:
        await ctx.send(sender, Response(text="fail"))


if __name__ == "__main__":
    guesser_agent.run()