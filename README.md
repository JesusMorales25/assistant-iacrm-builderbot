WhatsApp AI Assistant Bot
<p align="center"> <img src="https://raw.githubusercontent.com/your-org/your-repo/main/assets/logo.png" height="80"> </p>

This project creates a WhatsApp bot that integrates with an AI assistant using OpenAI's API. It enables automated conversations and intelligent responses.

Features
Automated conversation flows for WhatsApp
Integration with OpenAI's Assistant API
Works with any WhatsApp provider (e.g., Baileys, Twilio, etc.)
Auto-responses to frequently asked questions
Real-time message handling
User interaction tracking
Expandable logic through custom triggers

Getting Started
Clone this repository:

git clone https://github.com/JesusMorales25/assistant-ianegbot-reference-builderbot.git
cd assistant-ianegbot-reference-builderbot.git
Install dependencies:

pnpm install
Set up your environment variables in a .env file:

PORT=3008
ASSISTANT_ID=your_openai_assistant_id
Run the development server:

pnpm run dev
Using Docker (Recommended)
This project includes a Dockerfile for streamlined deployment. To use Docker:

Build the Docker image:

docker build -t whatsapp-ai-assistant .
Run the container:

docker run -p 3008:3008 --env-file .env whatsapp-ai-assistant
Usage
The main logic is in src/app.ts. You can customize the flow logic, AI prompts, and handling of user messages as needed.

Documentation
For implementation guidance, environment setup, and integration examples, refer to the documentation inside the /docs directory or your provider’s official documentation.

Contributing
Contributions are welcome! Open a Pull Request or an Issue if you'd like to help improve the project.

License
This project is open-source and available under the MIT License.

Contact
For questions or support, feel free to reach out via Issues or create a discussion in the repository.

Empowering intelligent WhatsApp conversations with OpenAI.

