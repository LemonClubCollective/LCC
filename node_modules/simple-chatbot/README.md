````markdown
# Simple Chatbot

A simple and customizable React chatbot component that allows you to easily integrate a chatbot UI into your application. This package is designed to be flexible, allowing developers to manage message handling and API requests externally.

## Installation

You can install `simple-chatbot` via npm or yarn:

```bash
npm install simple-chatbot
```
````

or

```bash
yarn add simple-chatbot
```

## Usage

Below is a basic example of how to use the simple-chatbot component in your React application.

```typescript
import React, { useState } from "react";
import Chatbot from "simple-chatbot";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (userMessage: string) => {
    // Add the user's message to the message history
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "user", text: userMessage },
    ]);

    // Simulate an API call to fetch the bot's response
    const botResponse = await fetchBotResponse(userMessage);

    // Add the bot's response to the message history
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "bot", text: botResponse },
    ]);
  };

  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    // Simulate an API call with a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("This is a simulated bot response.");
      }, 1000);
    });
  };

  return (
    <div>
      <Chatbot
        botName="My Bot"
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default App;
```

## Props

The Chatbot component accepts the following props:

| Prop Name     | Type                      | Description                                                                                                                                                                                                                              |
| ------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| botName       | string                    | The name of the chatbot. This will be displayed as the title of the chatbot window. Default is "Chatbot".                                                                                                                                |
| messages      | Message[]                 | An array of message objects that represent the conversation history. Each message object should have a sender ("user" or "bot") and text (the message content).                                                                          |
| onSendMessage | (message: string) => void | A callback function that is called when the user sends a message. The function receives the user's message as a parameter, and it's up to the parent component to handle the message, e.g., by making an API call to get a bot response. |

### Message Object

The `messages` prop is an array of objects with the following structure:

```typescript
interface Message {
  sender: "user" | "bot";
  text: string;
}
```

- `sender`: Indicates who sent the message, either "user" or "bot".
- `text`: The content of the message.

## Example

```typescript
import React, { useState } from "react";
import Chatbot, { Message } from "simple-chatbot";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSendMessage = async (userMessage: string) => {
    setMessages([...messages, { sender: "user", text: userMessage }]);
    const botResponse = await fetchBotResponse(userMessage);
    setMessages([
      ...messages,
      { sender: "user", text: userMessage },
      { sender: "bot", text: botResponse },
    ]);
  };

  const fetchBotResponse = async (userMessage: string): Promise<string> => {
    return "This is a simulated bot response.";
  };

  return (
    <div>
      <Chatbot
        botName="My Bot"
        messages={messages}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default App;
```

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
