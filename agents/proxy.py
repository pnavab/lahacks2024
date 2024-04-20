import json

from fastapi import FastAPI
from uagents import Model
from uagents.query import query

DRAWING_AGENT_ADDRESS = "agent1qwqhyvxj9tpzflh9g47fk9w2wjfr5m5ctdsddt6npxwsk5veexujjtw9738"
GAME_MASTER_ADDRESS = "agent1q0l63cezc6udwjk9yzjyd7cwf9g9u36xuglm4ut7p457l7qvfvypjg7ty4w"


class TestRequest(Model):
    message: str


async def agent_query(req):
    response = await query(destination=DRAWING_AGENT_ADDRESS, message=req, timeout=15.0)
    data = json.loads(response.decode_payload())
    return data["text"]

async def game_master_query(req):
    response = await query(destination=GAME_MASTER_ADDRESS, message=req, timeout=15.0)
    data = json.loads(response.decode_payload())
    return data["text"]


app = FastAPI()


@app.get("/")
def read_root():
    return "Hello from the Agent controller"


@app.post("/endpoint")
async def make_agent_call(req: TestRequest):
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
