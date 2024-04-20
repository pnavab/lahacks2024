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
 
game_master = Agent(
    name="game_master",
    port=8001,
    seed="game_master secret phrase",
    endpoint=["http://127.0.0.1:8001/submit"], #address in which other agents can send messages to where game_master will be listening
)
fund_agent_if_low(game_master.wallet.address())

print("game_master uAgent address: ", game_master.address)
# address:  agent1q0l63cezc6udwjk9yzjyd7cwf9g9u36xuglm4ut7p457l7qvfvypjg7ty4w
print("Fetch game_master network address: ", game_master.wallet.address())
 
 
@game_master.on_event("startup")
async def introduce_agent(ctx: Context):
    ctx.logger.info(f"Hello, I'm agent {ctx.name} and my address is {ctx.address}.")
    ctx.logger.info(f"And wallet address: {game_master.wallet.address()}")

# @game_master.on_interval(period=2.0)
# async def say_hello(ctx: Context):
#     ctx.logger.info(f'hello, my name is {ctx.name}')

# @game_master.on_interval(period=1.0)
# async def on_interval(ctx: Context):
#     current_count = ctx.storage.get("count") or 0
 
#     ctx.logger.info(f"My count is: {current_count}")
 
#     ctx.storage.set("count", current_count + 1)

@game_master.on_query(model=TestRequest, replies={Response})
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
    game_master.run()