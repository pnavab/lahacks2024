from uagents import Agent, Context, Protocol, Model
from uagents.setup import fund_agent_if_low
import google.generativeai as genai

model = genai.GenerativeModel('gemini-pro')
genai.configure(api_key='AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94')
# response = model.generate_content("What is the meaning of life?")
# response = response.text

class TestRequest(Model):
    message: str

class Response(Model):
    text: str
 
rerouter = Agent(
    name="rerouter",
    port=8002,
    seed="rerouter secret phrase",
    endpoint=["http://127.0.0.1:8002/submit"], #address in which other agents can send messages to where rerouter will be listening
)
fund_agent_if_low(rerouter.wallet.address())

print("rerouter uAgent address: ", rerouter.address)
print("Fetch rerouter network address: ", rerouter.wallet.address())
 
 
@rerouter.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {ctx.name} and my address is {ctx.address}.")
    ctx.logger.info(f"And wallet address: {rerouter.wallet.address()}")

@rerouter.on_query(model=TestRequest, replies={Response})
async def query_handler(ctx: Context, sender: str, _query: TestRequest):
    ctx.logger.info(f"query: {_query.message}")
    game1 = "An AI powered story generator collaborative game. Each player will first create an avatar then take turns to write a sentence to continue the story. The AI will then generate the next sentence based on the previous storypoint as well as a corresponding image. This game will be filled with funny twists and unexpected turns."
    game2 = "A collaborative drawing game where all players will draw on the same canvas in a limited amount of time. There is a random prompt and players will have to hurry to draw the prompt before the time runs out. AI will then try to guess what the drawing is and see if it resembles the original prompt to earn a point."
    game3 = "A competitive game where all players are given the same prompt to draw and each will draw their own version. The AI will then try to guess what each drawing is and see if it resembles the original prompt to earn a point. The player with the most points at the end of the game wins."
    try:
        prompt = f"Your role is as a game master. You will be in charge of assigning games to the user based on the following interests they have expressed: {_query.message}. Here are the game options you can assign to the user: \n1. {game1}\n2. {game2}\n3. {game3}. Please select the game you would like to assign to the user by returning ONLY the number of the game with no punctuation."
        response = model.generate_content(prompt)
        response = response.text
        ctx.logger.info(f"{response}")
        # do something here
        await ctx.send(sender, Response(text=response))
    except Exception:
        await ctx.send(sender, Response(text="fail"))

 
if __name__ == "__main__":
    rerouter.run()