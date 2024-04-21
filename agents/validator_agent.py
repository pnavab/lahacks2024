from uagents import Agent, Context, Model

import google.generativeai as genai
import re
class Request1(Model):
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


@validator_agent.on_query(model=Request1, replies={Response})
async def query_handler(ctx: Context, sender: str, _query: Request1):
    ctx.logger.info("Query received")
    # try:
        # print("TESTSTST")
        # do something here
    genai.configure(api_key='AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94')
    model = genai.GenerativeModel(model_name="gemini-pro")
    response = model.generate_content(f"true or false: is it understandable that a smart person would mix up {_query.guessed} with {_query.correct} when playing pictionary")
    print("generating " + _query.correct+ " " +response.text)
    matches = re.search("[Tt][Rr][Uu][Ee]|[Ff][Aa][Ll][Ss][Ee]", response.text)
    if(matches == None):
        await ctx.send(sender, Response(text="fail"))
    else:
        await ctx.send(sender, Response(text=matches.group().lower()))
    # except Exception as e:
    #     print("ERRR1" + str(e))
    #     await ctx.send(sender, Response(text="fail"))


if __name__ == "__main__":
    validator_agent.run()