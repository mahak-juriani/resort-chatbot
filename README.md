Got it! Here's a polished version of your README with the provided instructions:

---

# RESORT CHATBOT

## Installation Instructions

1. **Run `npm install`**

   At the base of the project directory, run the following command to install all necessary dependencies:

   ```bash
   npm install
   ```

2. **Generate OpenAI API Key**

   - Generate an OpenAI API key from [here](https://www.openai.com/api/).

3. **Create a `.env` File**

   At the base of the project, create a `.env` file and add the following line, replacing `<YOUR_OPENAI_API_KEY>` with your actual OpenAI API key:

   ```env
   OPENAI_API_KEY=<YOUR_OPENAI_API_KEY>
   ```

## Running the Project

To run the project, use the following command:

```bash
node startup.js
```

## Postman Collection

1. **Update Postman Collection**

   Make sure your Postman collection is updated with the appropriate endpoints.

2. **Hit Chat API from Postman Collection**

   To initiate a chat, send a request to the chat API. Example request:

   ```json
   {
       "query": "Hi"
   }
   ```

   On the first response, you will receive a `conversationId`, which will be used for subsequent requests. Example:

   ```json
   {
       "query": "I want to book a room",
       "conversationId": "b0ff22ad-8cab-4cbf-ba70-9afa94eb4a2"
   }
   ```

## Example API Requests and Responses

### Initial Request

```json
{
    "query": "Hi"
}
```

### Subsequent Request

```json
{
    "query": "I want to book a room",
    "conversationId": "b0ff22ad-8cab-4cbf-ba70-9afa94eb4a2"
}
```

