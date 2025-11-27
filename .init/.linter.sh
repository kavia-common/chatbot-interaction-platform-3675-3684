#!/bin/bash
cd /home/kavia/workspace/code-generation/chatbot-interaction-platform-3675-3684/frontend_chatbot_app
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

