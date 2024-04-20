from uagents import Agent, Context, Model
import base64

class Request(Model):
    base64encodedimage: str


class Response(Model):
    text: str


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


@drawing_agent.on_query(model=Request, replies={Response})
async def query_handler(ctx: Context, sender: str, _query: Request):
    ctx.logger.info("Query received")
    try:
        # do something here
        
        
        await ctx.send(sender, Response(text=_query.base64encodedimage))
    except Exception:
        await ctx.send(sender, Response(text="fail"))


if __name__ == "__main__":
    drawing_agent.run()