"""Command line interface for the Client Channel API."""

from __future__ import annotations

import json
from pathlib import Path

import click

from .client_session import ClientSession

SESSION_FILE = Path.home() / ".dms_session"


def load_session_id() -> str | None:
    if SESSION_FILE.exists():
        return SESSION_FILE.read_text().strip() or None
    return None


def save_session_id(session_id: str) -> None:
    SESSION_FILE.write_text(session_id)


def clear_session_id() -> None:
    if SESSION_FILE.exists():
        SESSION_FILE.unlink()


@click.group()
def cli() -> None:
    """Interact with the Client Channel API."""


@cli.command()
def init_session() -> None:
    """Initialize a new chat session."""
    session = ClientSession()
    session_id = session.init_session()
    save_session_id(session_id)
    click.echo(f"Session started: {session_id}")


@cli.command()
@click.argument("text")
def send_message(text: str) -> None:
    """Send a message in the current session."""
    session_id = load_session_id()
    if not session_id:
        raise click.ClickException("No active session. Run 'init-session' first.")
    session = ClientSession(session_id=session_id)
    response = session.send_message(text)
    click.echo(json.dumps(response, indent=2))


@cli.command()
def get_messages() -> None:
    """Fetch messages for the current session."""
    session_id = load_session_id()
    if not session_id:
        raise click.ClickException("No active session. Run 'init-session' first.")
    session = ClientSession(session_id=session_id)
    messages = session.get_messages()
    click.echo(json.dumps(messages, indent=2))


@cli.command()
def end_session() -> None:
    """Terminate the current session."""
    session_id = load_session_id()
    if not session_id:
        raise click.ClickException("No active session to end.")
    session = ClientSession(session_id=session_id)
    session.end_session()
    clear_session_id()
    click.echo("Session ended")


def main() -> None:
    cli()


if __name__ == "__main__":
    main()
