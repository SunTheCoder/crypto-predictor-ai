from openai import OpenAI
from dotenv import load_dotenv
import os

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print("OpenAI API test successful!")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"OpenAI API test failed: {str(e)}") 