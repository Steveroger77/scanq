import os
import json
import requests
from dotenv import load_dotenv
from prompts import SYSTEM_PROMPT, SUGGESTION_PROMPT

dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(dotenv_path)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def generate_pandas_code(schema: str, sample_rows: str, question: str) -> dict:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_api_key_here":
        raise ValueError("OPENROUTER_API_KEY is not set or invalid.")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "scanq"
    }

    user_prompt = f"""
Dataset Schema:
{schema}

Sample Rows:
{sample_rows}

Question: {question}
"""

    payload = {
        "model": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    }

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=30
    )

    if response.status_code == 429:
        raise ValueError("The AI model is currently rate-limited (Too Many Requests). Please wait a moment and try again.")
    
    response.raise_for_status()
    data = response.json()
    content = data["choices"][0]["message"]["content"]

    try:
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
            content = content[:content.rfind("```")].strip()
        elif content.startswith("```"):
            content = content[3:]
            content = content[:content.rfind("```")].strip()
        return json.loads(content)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse LLM response as JSON. Response: " + content)

def generate_suggested_questions(schema: str, sample_rows: str) -> list:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_api_key_here":
        return ["What is the total count?", "Show me the top 5 rows", "Are there any missing values?"]

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "scanq"
    }

    user_prompt = f"Dataset Schema:\n{schema}\n\nSample Rows:\n{sample_rows}"

    payload = {
        "model": "nvidia/nemotron-3-ultra-550b-a55b:free",
        "messages": [
            {"role": "system", "content": SUGGESTION_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=15
        )
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            content = content.strip()
            if content.startswith("```json"):
                content = content[7:]
                content = content[:content.rfind("```")].strip()
            elif content.startswith("```"):
                content = content[3:]
                content = content[:content.rfind("```")].strip()
            suggestions = json.loads(content)
            if isinstance(suggestions, list) and len(suggestions) > 0:
                return suggestions[:3]
    except Exception as e:
        print(f"Failed to generate suggestions: {e}")
    
    return ["What is the total count?", "Show me the top 5 rows", "Summarize this dataset"]
