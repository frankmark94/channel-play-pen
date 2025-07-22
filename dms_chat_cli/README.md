# DMS Chat CLI

A simple command line interface for interacting with the Pega Digital Messaging Client Channel API. It allows developers and testers to start a session, send messages, retrieve chat history and end a session without needing a full front end.

## Installation

Create a Python virtual environment and install dependencies:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Configuration

Set the following environment variables or create a `.env` file:

- `DMS_API_URL` – Base URL of the backend API (default `http://localhost:3001/api`)
- `DMS_JWT` – Optional JWT token for authentication
- `DMS_CHANNEL_ID` – Channel ID used when starting sessions

## Usage

```bash
# Start a new session
python -m dms_chat_cli init-session

# Send a message
python -m dms_chat_cli send-message "Hello from the CLI"

# Fetch messages
python -m dms_chat_cli get-messages

# End the session
python -m dms_chat_cli end-session
```

The current session ID is stored in `~/.dms_session` while active.
