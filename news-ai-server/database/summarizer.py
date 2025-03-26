import requests
from bs4 import BeautifulSoup
from transformers import BartTokenizer, BartForConditionalGeneration

tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

def fetch_webpage(url):
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return soup.get_text()
    except requests.exceptions.RequestException as e:
        return f"Error fetching the webpage: {e}"

def generate_summary(content):
    instructions = """I am going to provide you a link to a news article. 
    I want you to summarize the article in 150 words or less. 
    The summary should be simple, clear, and focus on key points.
    Do not add extra text before or after the summary. Do not provide any more information than what I have requested,
    including any requests for feedback.\n\n"""
    
    prompt = tokenizer.encode(instructions + content, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(prompt, max_length=200, min_length=150, length_penalty=1.2, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

def get_summary(url):
    page_content = fetch_webpage(url)
    if "Error" in page_content:
        return "Paid content blocking summary generation"
    else:
        return generate_summary(page_content)