import requests
import os
import together
together.api_key="713ab4d86fc2505d5632f1cf7039fe3740bd25c15d56722a4e94f5067eb81c11"
def get_ai_image(correct):
    response = together.Image.create(
        prompt=f"{correct} drawn in crude pictionary style by a child in black on a white",
        model="stabilityai/stable-diffusion-2-1", width=500, height=500)
    image = response["output"]["choices"][0]
    output = image["image_base64"]
    return output

print(get_ai_image("eggs"))