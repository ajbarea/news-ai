import requests
from bs4 import BeautifulSoup

def fetch_webpage(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, "html.parser")
        return soup
    except requests.exceptions.RequestException as e:
        return f"Error fetching the webpage: {e}"

def check_paywall(soup):
    results = []
    try:
        free_keywords = ["create a free account", "sign up for free", "register for free"]
        for keyword in free_keywords:
            if keyword in soup.text.lower():
                results.append(f"Potential mandatory free account sign up detected: '{keyword}' found in page text.")

        paywall_keywords = ["paywall", "subscription", "premium", "membership", "login"]
        for keyword in paywall_keywords:
            if keyword in soup.text.lower():
                results.append(f"Potential paywall detected: '{keyword}' found in page text.")
    
        paywall_classes = ["paywall", "metered", "subscription", "premium-content", "gated"]
        for class_name in paywall_classes:
            if soup.find(class_=class_name):
                results.append(f"Paywall detected: Found '{class_name}' in page elements.")

        if not(results):
            results.append("No paywall detected.")
        
        return results
    
    except requests.exceptions.RequestException as e:
        return f"Error fetching the webpage: {e}"

url = input("Enter a news article URL: ")
soup = fetch_webpage(url)
print(check_paywall(soup))
