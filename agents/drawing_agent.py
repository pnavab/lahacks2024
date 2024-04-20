from uagents import Agent, Context, Model
import base64
GUESSING_AGENT_ADDRESS = "agent1qw23p2euxrt0ysppyfaxn46gusswu3tm2jrtgc5xq4kh328u2r7ej555mcc"
class Request(Model):
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


@drawing_agent.on_query(model=Request, replies={Response, GuesserRequest})
async def query_handler(ctx: Context, sender: str, _query: Request):
    ctx.logger.info("Query received")
    try:
        # base64 encode shit here

        
        
        res = await ctx.send(GUESSING_AGENT_ADDRESS, Request())
        await ctx.send(sender, Request(text=res))
    except Exception:
        
        await ctx.send(sender, Response(text="fail"))


if __name__ == "__main__":
    drawing_agent.run()