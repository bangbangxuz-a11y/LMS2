"""Local backend for running project Python with the host interpreter.

This server is intended for local development. It accepts code only from the
same local application and binds to 127.0.0.1 by default.
"""

from __future__ import annotations

import hashlib
import json
import os
import signal
import subprocess
import tempfile
import threading
import venv
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path, PurePosixPath, PureWindowsPath
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent
HOST = os.environ.get("CODEPLAYGROUND_HOST", "127.0.0.1")
PORT = int(os.environ.get("CODEPLAYGROUND_PORT", "8000"))
MAX_BODY_SIZE = 8 * 1024 * 1024
RUN_TIMEOUT_SECONDS = 30
INSTALL_TIMEOUT_SECONDS = 180
MAX_OUTPUT_SIZE = 4 * 1024 * 1024
VENV_DIR = ROOT / ".codeplayground-venv"
DEFAULT_LOCAL_ORIGINS = {"http://localhost", "http://127.0.0.1", "http://[::1]", "null"}
CONFIGURED_ORIGINS = {
    origin.strip().rstrip("/")
    for origin in os.environ.get("CODEPLAYGROUND_ALLOWED_ORIGINS", "").split(",")
    if origin.strip()
}

venv_lock = threading.Lock()
requirements_lock = threading.Lock()
venv_python: Path | None = None
installed_requirements_hash = ""


def json_response(handler: SimpleHTTPRequestHandler, status: int, payload: dict) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    handler.end_headers()
    handler.wfile.write(body)


def is_safe_relative_path(value: object) -> bool:
    if not isinstance(value, str) or not value or "\x00" in value:
        return False
    normalized = value.replace("\\", "/")
    path = PurePosixPath(normalized)
    if PureWindowsPath(normalized).drive:
        return False
    return not path.is_absolute() and ".." not in path.parts and str(path) == normalized


def read_request_body(handler: SimpleHTTPRequestHandler) -> dict:
    try:
        length = int(handler.headers.get("Content-Length", "0"))
    except ValueError as error:
        raise ValueError("Content-Length tidak valid") from error
    if length <= 0 or length > MAX_BODY_SIZE:
        raise ValueError("Ukuran request tidak valid")
    try:
        payload = json.loads(handler.rfile.read(length))
    except json.JSONDecodeError as error:
        raise ValueError("Payload JSON tidak valid") from error
    if not isinstance(payload, dict):
        raise ValueError("Payload harus berupa object")
    return payload


def validate_payload(payload: dict) -> tuple[str, dict[str, str], str]:
    entry_file = payload.get("entryFile")
    raw_files = payload.get("files")
    if not is_safe_relative_path(entry_file) or not str(entry_file).lower().endswith(".py"):
        raise ValueError("File Python utama tidak valid")
    if not isinstance(raw_files, dict) or len(raw_files) > 100:
        raise ValueError("Daftar file tidak valid")

    files: dict[str, str] = {}
    for file_name, content in raw_files.items():
        if not is_safe_relative_path(file_name) or not isinstance(content, str):
            raise ValueError("Path atau isi file tidak valid")
        if len(content.encode("utf-8")) > 2 * 1024 * 1024:
            raise ValueError(f"File terlalu besar: {file_name}")
        if file_name.lower().endswith(".py") or file_name.lower() == "requirements.txt":
            files[file_name] = content

    if entry_file not in files:
        raise ValueError("File Python utama tidak ditemukan")
    requirements = next(
        (content for file_name, content in files.items() if file_name.lower() == "requirements.txt"),
        "",
    )
    return entry_file, files, requirements


def create_virtualenv() -> Path:
    global venv_python
    with venv_lock:
        if venv_python and venv_python.exists():
            return venv_python
        candidate = VENV_DIR / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        if not candidate.exists():
            venv.EnvBuilder(with_pip=True, clear=VENV_DIR.exists()).create(VENV_DIR)
        if not candidate.exists():
            raise RuntimeError("Virtual environment Python tidak ditemukan")
        venv_python = candidate
        return candidate


def run_subprocess(command: list[str], *, cwd: Path, timeout: int, env: dict[str, str]) -> subprocess.CompletedProcess[str]:
    process_options: dict[str, object] = {
        "cwd": cwd,
        "env": env,
        "stdout": subprocess.PIPE,
        "stderr": subprocess.PIPE,
        "text": True,
        "encoding": "utf-8",
        "errors": "replace",
    }
    if os.name == "nt":
        process_options["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP
    else:
        process_options["start_new_session"] = True

    with tempfile.TemporaryFile() as stdout_file, tempfile.TemporaryFile() as stderr_file:
        process_options["stdout"] = stdout_file
        process_options["stderr"] = stderr_file
        process = subprocess.Popen(command, **process_options)
        try:
            process.communicate(timeout=timeout)
        except subprocess.TimeoutExpired as error:
            if os.name == "nt":
                process.kill()
            else:
                os.killpg(process.pid, signal.SIGKILL)
            process.communicate()
            raise subprocess.TimeoutExpired(command, timeout) from error

        def read_tail(stream: tempfile._TemporaryFileWrapper) -> str:
            stream.seek(0, os.SEEK_END)
            stream.seek(max(0, stream.tell() - MAX_OUTPUT_SIZE))
            return stream.read().decode("utf-8", errors="replace")

        return subprocess.CompletedProcess(
            command,
            process.returncode,
            read_tail(stdout_file),
            read_tail(stderr_file),
        )


def install_requirements(requirements: str) -> Path:
    global installed_requirements_hash
    with requirements_lock:
        python = create_virtualenv()
        normalized = requirements.replace("\r\n", "\n").strip()
        digest = hashlib.sha256(normalized.encode("utf-8")).hexdigest()
        if not normalized or digest == installed_requirements_hash:
            return python

        with tempfile.NamedTemporaryFile("w", encoding="utf-8", suffix=".txt", delete=False) as file:
            file.write(normalized + "\n")
            requirements_path = Path(file.name)
        try:
            try:
                result = run_subprocess(
                    [
                        str(python),
                        "-m",
                        "pip",
                        "install",
                        "--disable-pip-version-check",
                        "--no-input",
                        "-r",
                        str(requirements_path),
                    ],
                    cwd=ROOT,
                    timeout=INSTALL_TIMEOUT_SECONDS,
                    env={**os.environ, "PIP_NO_INPUT": "1"},
                )
            except subprocess.TimeoutExpired as error:
                raise RuntimeError("Instalasi requirements melebihi batas 180 detik") from error
            if result.returncode != 0:
                detail = (result.stderr or result.stdout).strip()[-4000:]
                raise RuntimeError(f"Instalasi requirements gagal: {detail}")
            installed_requirements_hash = digest
            return python
        finally:
            requirements_path.unlink(missing_ok=True)


def run_python(payload: dict) -> dict:
    entry_file, files, requirements = validate_payload(payload)
    python = install_requirements(requirements)
    with tempfile.TemporaryDirectory(prefix="codeplayground-") as temp_dir:
        project_dir = Path(temp_dir)
        for file_name, content in files.items():
            destination = project_dir / Path(file_name)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(content, encoding="utf-8")
        entry_parts = PurePosixPath(entry_file).parts
        entry_module_parts = (*entry_parts[:-1], PurePosixPath(entry_parts[-1]).stem)
        can_run_as_module = len(entry_parts) > 1 and all(part.isidentifier() for part in entry_module_parts)
        if can_run_as_module:
            for depth in range(1, len(entry_parts)):
                package_init = project_dir.joinpath(*entry_parts[:depth], "__init__.py")
                package_init.parent.mkdir(parents=True, exist_ok=True)
                package_init.touch(exist_ok=True)
            command = [str(python), "-m", ".".join(entry_module_parts)]
        else:
            command = [str(python), entry_file]
        result = run_subprocess(
            command,
            cwd=project_dir,
            timeout=RUN_TIMEOUT_SECONDS,
            env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        )
        return {
            "ok": result.returncode == 0,
            "stdout": result.stdout[-MAX_OUTPUT_SIZE:],
            "stderr": result.stderr[-MAX_OUTPUT_SIZE:],
            "exitCode": result.returncode,
        }


class CodePlaygroundHandler(SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        origin = self.headers.get("Origin", "").rstrip("/")
        parsed_origin = urlparse(origin)
        is_local_origin = parsed_origin.hostname in {"localhost", "127.0.0.1", "::1"}
        if origin in CONFIGURED_ORIGINS or origin in DEFAULT_LOCAL_ORIGINS or is_local_origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.end_headers()

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path != "/api/python/run":
            json_response(self, 404, {"ok": False, "error": "Endpoint tidak ditemukan"})
            return
        try:
            result = run_python(read_request_body(self))
            json_response(self, 200 if result["ok"] else 422, result)
        except subprocess.TimeoutExpired:
            json_response(self, 408, {"ok": False, "error": "Eksekusi Python melebihi batas 30 detik"})
        except (ValueError, RuntimeError) as error:
            json_response(self, 400, {"ok": False, "error": str(error)})
        except Exception as error:  # Keep API errors readable without exposing a traceback.
            json_response(self, 500, {"ok": False, "error": f"Backend Python gagal: {error}"})

    def log_message(self, format: str, *args: object) -> None:
        print(f"[{self.log_date_time_string()}] {format % args}")


if __name__ == "__main__":
    os.chdir(ROOT)
    with ThreadingHTTPServer((HOST, PORT), CodePlaygroundHandler) as server:
        print(f"CodePlayground running at http://{HOST}:{PORT}")
        print("Python execution backend is enabled.")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped")
        finally:
            server.server_close()
