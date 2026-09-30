declare global {
  interface Window {
    loadPyodide: (opts: { indexURL: string }) => Promise<any>;
  }
}

const PYODIDE_VERSION = "0.26.4";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise: Promise<any> | null = null;

function loadScriptTag(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export function getPyodide(onStatus?: (s: string) => void): Promise<any> {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      onStatus?.("Booting Python runtime (first run only)…");
      if (!window.loadPyodide) {
        await loadScriptTag(INDEX_URL + "pyodide.js");
      }
      const pyodide = await window.loadPyodide({ indexURL: INDEX_URL });
      onStatus?.("Ready");
      return pyodide;
    })();
  }
  return pyodidePromise;
}

const TEST_HARNESS = `
import json, sys, io

results = {}
ns = {}
buf = io.StringIO()
old_stdout = sys.stdout
sys.stdout = buf
try:
    exec(user_code, ns)
    sys.stdout = old_stdout
except Exception as e:
    sys.stdout = old_stdout
    results = {"error": f"{type(e).__name__}: {e}", "stdout": buf.getvalue()}
else:
    tests = json.loads(tests_json)
    func = ns.get(func_name)
    if func is None:
        results = {"error": f"Function '{func_name}' not found. Did you rename it or forget to define it?", "stdout": buf.getvalue()}
    else:
        test_results = []
        for t in tests:
            entry = {"args": t["args"], "expected": t["expected"]}
            tb = io.StringIO()
            sys.stdout = tb
            try:
                actual = func(*t["args"])
                entry["actual"] = actual
                entry["passed"] = actual == t["expected"]
            except Exception as e:
                entry["error"] = f"{type(e).__name__}: {e}"
                entry["passed"] = False
            sys.stdout = old_stdout
            entry["stdout"] = tb.getvalue()
            test_results.append(entry)
        results = {"tests": test_results, "stdout": buf.getvalue()}

json.dumps(results)
`;

const RUN_HARNESS = `
import sys, io, json

buf = io.StringIO()
old_stdout = sys.stdout
sys.stdout = buf
result = {}
try:
    exec(user_code, {})
    result["stdout"] = buf.getvalue()
except Exception as e:
    result["stdout"] = buf.getvalue()
    result["error"] = f"{type(e).__name__}: {e}"
finally:
    sys.stdout = old_stdout

json.dumps(result)
`;

export interface TestEntry {
  args: unknown[];
  expected: unknown;
  actual?: unknown;
  error?: string;
  passed: boolean;
  stdout: string;
}

export interface TestRunResult {
  error?: string;
  stdout?: string;
  tests?: TestEntry[];
}

export async function runTests(
  pyodide: any,
  code: string,
  funcName: string,
  tests: unknown[]
): Promise<TestRunResult> {
  pyodide.globals.set("user_code", code);
  pyodide.globals.set("func_name", funcName);
  pyodide.globals.set("tests_json", JSON.stringify(tests));
  const raw = await pyodide.runPythonAsync(TEST_HARNESS);
  return JSON.parse(raw);
}

export interface PlainRunResult {
  stdout: string;
  error?: string;
}

export async function runPlain(pyodide: any, code: string): Promise<PlainRunResult> {
  pyodide.globals.set("user_code", code);
  const raw = await pyodide.runPythonAsync(RUN_HARNESS);
  return JSON.parse(raw);
}
