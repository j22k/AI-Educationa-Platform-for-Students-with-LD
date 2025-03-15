import base64
import os
import re
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()



def markdown_to_json(markdown_text):
    """
    Remove Markdown code block markers (```json and ```) from a string
    and convert the remaining JSON text into a Python dictionary.
    """
    # Pattern matches the JSON content inside the triple backticks
    pattern = r"```(?:json)?\s*([\s\S]*?)\s*```"
    match = re.search(pattern, markdown_text)
    if match:
        json_text = match.group(1)
    else:
        json_text = markdown_text  # Use entire text if no Markdown markers found
    try:
        json_obj = json.loads(json_text)
        return json_obj
    except json.JSONDecodeError as e:
        print("Error decoding JSON:", e)
        return None
    
def identify(data):
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.0-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text=data),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        temperature=1,
        top_p=0.95,
        top_k=40,
        max_output_tokens=8192,
        response_mime_type="text/plain",
        system_instruction=[
            types.Part.from_text(text="""You are an advanced AI model designed to assess and analyze learning disabilities and emotional states in students. Your task is to generate a structured JSON output based on provided input, ensuring completeness, clarity, and adherence to the specified format. Your response must follow this exact JSON schema:

{
  \"studentProfile\": {
    \"userID\": \"<unique_identifier>\",
    \"name\": \"<student_name>\",
    \"age\": <age>,
    \"relationship\": \"<Parent/Guardian/Teacher>\",
    \"preferredLearningStyle\": [\"<Visual/Auditory/Kinesthetic>\"],
    \"strengths\": \"<key strengths>\",
    \"struggles\": \"<key struggles>\",
    \"previousDiagnosis\": \"<any prior diagnosis>\",
    \"mainConcerns\": \"<primary concerns>\",
    \"previousSupport\": \"<any prior support received>\"
  },
  \"learningDisabilities\": {
    \"Dyslexia\": {
      \"confidenceScore\": <float between 0 and 1>,
      \"indicators\": [
        \"<symptom_1>\",
        \"<symptom_2>\",
        ...
      ]
    },
    \"Dysgraphia\": {
      \"confidenceScore\": <float between 0 and 1>,
      \"indicators\": [
        \"<symptom_1>\",
        \"<symptom_2>\",
        ...
      ]
    },
    \"Dyscalculia\": {
      \"confidenceScore\": <float between 0 and 1>,
      \"indicators\": [
        \"<symptom_1>\",
        \"<symptom_2>\",
        ...
      ]
    }
  },
  \"emotionAnalysis\": {
    \"dominantEmotions\": [\"<emotion_1>\", \"<emotion_2>\", ...],
    \"emotionOccurrences\": {
      \"<emotion_1>\": <count>,
      \"<emotion_2>\": <count>,
      ...
    },
    \"graphData\": [
      { \"emotion\": \"<emotion_name>\", \"count\": <integer> },
      { \"emotion\": \"<emotion_name>\", \"count\": <integer> }
    ]
  }
}

### **Instructions for Response Generation:**
1. **Ensure Accuracy**  
   - Use clear and structured reasoning to assess the student's learning disabilities based on provided input.  
   - Assign **confidence scores** between `0.0` and `1.0` based on symptom strength and frequency.

2. **Emotion Analysis**  
   - Extract dominant emotions and provide a **count of occurrences** for each detected emotion.  
   - Represent emotional states in **graphData** as JSON objects with `\"emotion\"` and `\"count\"` fields.

3. **Consistent Formatting**  
   - Always adhere to the given JSON structure.  
   - All string values must be enclosed in quotes.  
   - Ensure lists (`[]`) and dictionaries (`{}`) are correctly formatted.

4. **Avoid Placeholder Text**  
   - Do not use generic terms like `<emotion_1>` or `<symptom_1>`.  
   - Instead, populate with **real, relevant data** extracted from the given input.

Your primary goal is to generate structured, readable, and **insightful** JSON outputs that can be directly parsed and used for further analysis. Ensure completeness, clarity, and adherence to the format strictly.
"""),
        ],
    )
    string = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")
        string += chunk.text
    print("\n\nData :\n", string)
    print("\nType of data:", type(string))
    
    # Remove Markdown formatting and convert to a JSON object
    json_object = markdown_to_json(string)
    print("\nConverted JSON Object:")
    print(json_object)
    print("\nType of JSON Object:", type(json_object))
    
    return json_object
