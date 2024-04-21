import json
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from uagents import Model
from uagents.query import query
import requests
import os
import together
together.api_key="713ab4d86fc2505d5632f1cf7039fe3740bd25c15d56722a4e94f5067eb81c11"

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
VALIDATOR_AGENT_ADDRESS = "agent1q2zfsfptf2j936hjnlcutpmzqm705ka7frkmwr6uxlg4wdlgvvy97l03ynx"

class Request(Model):
    guessed: str
    correct: str

class Request1(Model):
    guessed: str
    correct: str

class TestRequest(Model):
    message: str

async def guessing_agent_query(req):
    response = await query(destination=GUESSING_AGENT_ADDRESS, message=req, timeout=15.0)
    print(response)
    data = json.loads(response.decode_payload())
    return data
async def validator_agent_query(req):
    print("TEST!!")
    response = await query(destination=VALIDATOR_AGENT_ADDRESS, message=req, timeout=15.0)
    print(response)
    data = json.loads(response.decode_payload())
    return data
async def game_master_query(req):
    response = await query(destination=GAME_MASTER_ADDRESS, message=req, timeout=15.0)
    data = json.loads(response.decode_payload())
    return data["text"]



@app.get("/")
def read_root():
    return "Hello from the Agent controller"


@app.post("/endpoint")
async def make_agent_call(req: Request):
    # try:
    #NO DRAWING YET, DRAWING CAN REGEN IMAGE
    correct_image = True
    while(not correct_image):
        guessingRes = await guessing_agent_query(req)
        print(f"successful call - guessing agent response: {guessingRes}")
        req1 = Request1(correct=req.correct,guessed=guessingRes.get('guessed'))
        validatorRes = await validator_agent_query(req1)
        print(f"successful call - validation agent response: {validatorRes}")
        return validatorRes.get('text')
    #RETURN IMAGE CODE
    # except Exception as e:
    #     print("ERRR "+str(e))
    #     return "unsuccessful agent call"
    
@app.post("/game_master")
async def game_master_call(req: TestRequest):
    try:
        res = await game_master_query(req)
        return {res}
    except Exception:
        return "unsuccessful agent call"

def get_ai_image(prompt):
    response = together.Image.create(
        prompt=prompt,
        model="stabilityai/stable-diffusion-xl-base-1.0", width=500, height=500)
    image = response["output"]["choices"][0]
    output = image["image_base64"]
    return output

@app.post("/get_image")
async def get_image(req: Request):
    req_json = await req.json()
    print(req_json)
    prompt = req_json["prompt"]
    print(prompt)
    response = await get_ai_image(prompt)
    print(response)
    return response

