import ast
import io
import json
import signal
import sys
import traceback
from contextlib import redirect_stdout


SAFE_BUILTINS = {
    "abs": abs,
    "all": all,
    "any": any,
    "bool": bool,
    "dict": dict,
    "enumerate": enumerate,
    "float": float,
    "int": int,
    "len": len,
    "list": list,
    "max": max,
    "min": min,
    "range": range,
    "set": set,
    "str": str,
    "sum": sum,
    "tuple": tuple,
    "zip": zip,
}


def timeout_handler(_signum, _frame):
    raise TimeoutError("Python trace exceeded the execution limit.")


def to_jsonable(value):
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if isinstance(value, (list, tuple)):
        return [to_jsonable(item) for item in value]
    if isinstance(value, set):
        return sorted(to_jsonable(item) for item in value)
    if isinstance(value, dict):
        return {str(key): to_jsonable(item) for key, item in value.items()}
    return repr(value)


def validate_code(source):
    tree = ast.parse(source)
    blocked_nodes = (
        ast.Import,
        ast.ImportFrom,
        ast.Global,
        ast.Nonlocal,
        ast.With,
        ast.AsyncWith,
        ast.AsyncFunctionDef,
        ast.ClassDef,
        ast.Lambda,
    )
    blocked_calls = {"eval", "exec", "open", "compile", "__import__", "input"}

    for node in ast.walk(tree):
        if isinstance(node, blocked_nodes):
            raise ValueError("Unsupported Python construct in sandboxed trace.")
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in blocked_calls:
            raise ValueError(f"Call to {node.func.id} is not allowed.")

    functions = [node.name for node in tree.body if isinstance(node, ast.FunctionDef)]
    if not functions:
      raise ValueError("Provide at least one Python function.")
    return functions[0]


def run_trace(payload):
    source = payload["code"]
    requested_name = payload.get("functionName")
    default_name = validate_code(source)
    function_name = requested_name or default_name

    globals_scope = {"__builtins__": SAFE_BUILTINS}
    locals_scope = {}
    compiled = compile(source, "<codeassist-user>", "exec")
    exec(compiled, globals_scope, locals_scope)
    function = locals_scope.get(function_name) or globals_scope.get(function_name)
    if not callable(function):
        raise ValueError(f"Function {function_name!r} was not found.")

    raw_input = payload.get("input", [])
    if isinstance(raw_input, dict) and "args" in raw_input:
        args = raw_input["args"]
    elif isinstance(raw_input, list):
        args = [raw_input]
    else:
        args = [raw_input]

    trace = []
    stdout_buffer = io.StringIO()

    def tracer(frame, event, _arg):
        if event != "line" or frame.f_code.co_name != function_name:
            return tracer

        step = {
            "stepIndex": len(trace),
            "lineNumber": frame.f_lineno,
            "explanation": f"Executed line {frame.f_lineno} inside {function_name}.",
            "variables": {
                key: to_jsonable(value)
                for key, value in frame.f_locals.items()
                if not key.startswith("__")
            },
            "stdout": stdout_buffer.getvalue().splitlines(),
            "pointerChanges": {},
        }
        trace.append(step)
        return tracer

    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(2)
    try:
        sys.settrace(tracer)
        with redirect_stdout(stdout_buffer):
            result = function(*args)
        sys.settrace(None)
        signal.alarm(0)
    finally:
        sys.settrace(None)
        signal.alarm(0)

    if trace:
        final_step = dict(trace[-1])
        final_step["stepIndex"] = len(trace)
        final_step["variables"] = dict(final_step["variables"])
        final_step["variables"]["result"] = to_jsonable(result)
        final_step["stdout"] = stdout_buffer.getvalue().splitlines()
        final_step["explanation"] = f"{function_name} returned {to_jsonable(result)!r}."
        trace.append(final_step)

    return trace[:400]


def normalize_args(raw_input):
    if isinstance(raw_input, dict) and "args" in raw_input:
        return raw_input["args"]
    if isinstance(raw_input, list):
        return [raw_input]
    return [raw_input]


def load_function(source, requested_name=None):
    default_name = validate_code(source)
    function_name = requested_name or default_name
    globals_scope = {"__builtins__": SAFE_BUILTINS}
    locals_scope = {}
    compiled = compile(source, "<codeassist-user>", "exec")
    exec(compiled, globals_scope, locals_scope)
    function = locals_scope.get(function_name) or globals_scope.get(function_name)
    if not callable(function):
        raise ValueError(f"Function {function_name!r} was not found.")
    return function_name, function


def run_tests(payload):
    source = payload["code"]
    _function_name, function = load_function(source, payload.get("functionName"))
    tests = payload.get("tests", [])
    if not isinstance(tests, list):
        raise ValueError("tests must be a list.")

    results = []
    for index, test in enumerate(tests[:20]):
        name = test.get("name") or f"Case {index + 1}"
        expected = to_jsonable(test.get("expected"))
        stdout_buffer = io.StringIO()
        try:
            args = normalize_args(test.get("input", {}))
            with redirect_stdout(stdout_buffer):
                actual = function(*args)
            normalized_actual = to_jsonable(actual)
            results.append(
                {
                    "id": test.get("id") or f"case-{index + 1}",
                    "name": name,
                    "passed": normalized_actual == expected,
                    "input": to_jsonable(test.get("input", {})),
                    "expected": expected,
                    "actual": normalized_actual,
                    "stdout": stdout_buffer.getvalue().splitlines(),
                    "error": None,
                }
            )
        except Exception as exc:
            results.append(
                {
                    "id": test.get("id") or f"case-{index + 1}",
                    "name": name,
                    "passed": False,
                    "input": to_jsonable(test.get("input", {})),
                    "expected": expected,
                    "actual": None,
                    "stdout": stdout_buffer.getvalue().splitlines(),
                    "error": str(exc),
                }
            )

    return results


def main():
    try:
        payload = json.loads(sys.stdin.read())
        if payload.get("mode") == "tests":
            print(json.dumps({"results": run_tests(payload)}))
            return
        print(json.dumps({"trace": run_trace(payload)}))
    except Exception as exc:
        print(json.dumps({"trace": [], "error": str(exc), "details": traceback.format_exc()}))
        sys.exit(1)


if __name__ == "__main__":
    main()
