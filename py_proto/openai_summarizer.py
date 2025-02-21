import openai
import requests
import os
from bs4 import BeautifulSoup

# Running into issues with openAI clamping down on their free api key policies. Looks like it's very limited and llocked to phone numbers.
# I think one or two keys would be enough for the whole semester, since free trials get you ~750 API requests but this is really annoying.
# Going to experiment with Llama 2, which is a local model that doesn't come with a cost attached.


openai.api_key = os.getenv("OPENAI_API_KEY")

def fetch_webpage(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text()
    except requests.exceptions.RequestException as e:
        return f"Error fetching the webpage: {e}"

def analyze_content_with_openai(content):
    instructions = """I am going to provide you a link to a news article. I want you to summarize the article in 250 words or less.
     I want the summary to touch on the main points of the article and to not go into great detail. 
     I want you to only respond with the summary, no text before or after your summary. 
     I want you to make it as understandable to a general audience as possible.\n\n"""
    
    prompt = instructions + f"{content[:3000]}"
    response = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "user",
                "content": prompt
            },
        ],
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    url = input("Enter a webpage URL: ")
    page_content = fetch_webpage(url)

    if "Error" in page_content:
        print(page_content)
    else:
        print("\nSummarizing article...\n")
        result = analyze_content_with_openai(page_content)
        print("\nSummary:\n", result)
