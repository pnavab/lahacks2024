import json
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uagents import Model
from uagents.query import query

app = FastAPI()
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DRAWING_AGENT_ADDRESS = "agent1qwqhyvxj9tpzflh9g47fk9w2wjfr5m5ctdsddt6npxwsk5veexujjtw9738"
GAME_MASTER_ADDRESS = "agent1q0l63cezc6udwjk9yzjyd7cwf9g9u36xuglm4ut7p457l7qvfvypjg7ty4w"
GUESSING_AGENT_ADDRESS = "agent1qw23p2euxrt0ysppyfaxn46gusswu3tm2jrtgc5xq4kh328u2r7ej555mcc"


class Request(Model):
    guessed: str
    correct: str

class TestRequest(Model):
    message: str

async def agent_query(req):
    response = await query(destination=GUESSING_AGENT_ADDRESS, message=req, timeout=15.0)
    print(response)
    data = json.loads(response.decode_payload())
    return data["text"]

async def game_master_query(req):
    response = await query(destination=GAME_MASTER_ADDRESS, message=req, timeout=15.0)
    data = json.loads(response.decode_payload())
    return data["text"]



@app.get("/")
def read_root():
    return "Hello from the Agent controller"


@app.post("/endpoint")
async def make_agent_call(req: Request):
    try:
        res = await agent_query(req)
        return f"successful call - agent response: {res}"
    except Exception:
        return "unsuccessful agent call"
    
@app.post("/game_master")
async def game_master_call(req: TestRequest):
    try:
        res = await game_master_query(req)
        return {res}
    except Exception:
        return "unsuccessful agent call"
    