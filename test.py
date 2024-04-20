import PIL.Image

img = PIL.Image.open('testpng.png')

import google.generativeai as genai
genai.configure(api_key='AIzaSyBu6U4n_yGG2cIRxdu4T36RRW7G2Ujsa94')
model = genai.GenerativeModel(model_name="gemini-pro-vision")

response = model.generate_content(["respond with one or two words that describe what the image is of. do not include any words describing or elaborating on your answer.", img])
print(response)