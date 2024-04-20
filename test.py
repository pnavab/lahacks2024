import base64
from PIL import Image

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as img_file:
        image_data = img_file.read()
        encoded_image = base64.b64encode(image_data)
        return encoded_image.decode('utf-8')


png_file_path = "testpng.png"


base64_encoded_image = encode_image_to_base64(png_file_path)

print("Base64 Encoded Image:\n", base64_encoded_image)