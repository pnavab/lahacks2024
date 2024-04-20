from uagents import Agent, Context, Model

import google.generativeai as genai
import re
class Request(Model):
    guessed: str
    correct: str


class Response(Model):
    text: str


validator_agent = Agent(
    name="validator_agent",
    seed="validatorrecovery",
    port=8003,
    endpoint="http://localhost:8003/submit",
)

@validator_agent.on_event("startup")
async def startup(ctx: Context):
    ctx.logger.info(f"Starting up {validator_agent.name}")
    ctx.logger.info(f"With address: {validator_agent.address}")


@validator_agent.on_query(model=Request, replies={Response})
async def query_handler(ctx: Context, sender: str, _query: Request):
    ctx.logger.info("Query received")
    try:
        # do something here
        genai.configure(api_key='AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94')
        model = genai.GenerativeModel(model_name="gemini-pro-vision")
        response = model.generate_content("true or false: is it understandable that a smart person would mix up {guessed} with {correct} when playing pictionary")
        matches = re.search(response, "[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee]")
        if(matches == None):
            await ctx.send(sender, Response(text="fail"))
        else:
            await ctx.send(sender, Response(text=matches.group().lower()))
    except Exception:
        await ctx.send(sender, Response(text="fail"))


if __name__ == "__main__":
    validator_agent.run()