import requests
import os
from bs4 import BeautifulSoup
from llama_cpp import Llama

# Llama is a c++ library and needs a compiler for vs code to be happy. Below are the steps I took that allowed me to install llama-cpp-python in my .venv:
# Steps taken:
# 1. install visual studio installer
# 2. through installer, install c++ tools
# 3. pip install requirements
# 4. download model from https://huggingface.co/TheBloke/Mistral-7B-v0.1-GGUF/blob/main/mistral-7b-v0.1.Q5_K_S.gguf
# 5. create models directory in py_proto
# 6. put downloaded .gguf inside models
# 7. update MODEL_PATH below if needed

MODEL_PATH = "py_proto\\models\\mistral-7b-v0.1.Q2_K.gguf"
llm = Llama(model_path=MODEL_PATH, n_ctx=4096)

def fetch_webpage(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text()
    except requests.exceptions.RequestException as e:
        return f"Error fetching the webpage: {e}"

def analyze_content_with_llama(content):
    instructions = """I am going to provide you a link to a news article. 
    I want you to summarize the article in 250 words or less. 
    The summary should be simple, clear, and focus on key points.
    Do not add extra text before or after the summary.\n\n"""
    
    prompt = instructions + f"{content[:3000]}"
    
    response = llm(prompt, max_tokens=400, temperature=0.7)
    return response["choices"][0]["text"]

if __name__ == "__main__":
    url = input("Enter a webpage URL: ")
    page_content = fetch_webpage(url)

    if "Error" in page_content:
        print(page_content)
    else:
        print("\nSummarizing article...\n")
        result = analyze_content_with_llama(page_content)
        print("\nSummary:\n", result)
