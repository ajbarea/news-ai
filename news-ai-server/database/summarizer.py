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

        paragraphs = soup.find_all("p")
        page_content = " ".join([paragraph.get_text() for paragraph in paragraphs])
        return page_content
    except requests.exceptions.RequestException as e:
        return f"Error fetching the webpage: {e}"

def generate_summary(content):
    input = tokenizer.encode(content, return_tensors="pt", max_length=1024, truncation=True)
    summary_ids = model.generate(input, max_length=150, min_length=100, length_penalty=1.2, num_beams=4, early_stopping=True)
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
    return summary

def get_summary(url):
    page_content = fetch_webpage(url)
    if "Error" in page_content:
        return "Paid content blocking summary generation"
    else:
        return generate_summary(page_content)