#!/usr/bin/env python3
"""Yerel sunucuyu baslatir ve saati varsayilan tarayicida acar.

    python3 baslat.py            # bos bir port secer, tarayiciyi acar
    python3 baslat.py 8080       # belirtilen portu kullanir
"""
import http.server
import socket
import socketserver
import sys
import threading
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt, *args):  # sessiz calis
        pass


def free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


def main() -> int:
    port = int(sys.argv[1]) if len(sys.argv) > 1 else free_port()
    url = f"http://127.0.0.1:{port}/index.html"

    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
        print(f"Sunucu calisiyor: {url}")
        print("Durdurmak icin Ctrl+C")
        threading.Timer(0.4, lambda: webbrowser.open_new_tab(url)).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nKapatildi.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
