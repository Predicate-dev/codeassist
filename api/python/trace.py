import json
import sys
from http.server import BaseHTTPRequestHandler
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))
from scripts.python_trace import run_trace


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self):
        try:
            length = int(self.headers.get("content-length", "0"))
            body = json.loads(self.rfile.read(length) or b"{}")
            if not body.get("code"):
                self._send_json(400, {"error": "A Python function code block is required."})
                return

            self._send_json(200, {"trace": run_trace(body)})
        except Exception as exc:
            self._send_json(500, {"error": str(exc)})
