import { mkdir } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const isWindows = process.platform === "win32";
const python = path.join(projectRoot, ".venv", isWindows ? "Scripts/python.exe" : "bin/python");
const systemPython = isWindows ? "python" : "python3";

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectRoot, stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} 執行失敗（代碼 ${code}）。`));
    });
  });
}

await mkdir(path.join(projectRoot, "models"), { recursive: true });
await run(systemPython, ["-m", "venv", ".venv"]);
await run(python, ["-m", "pip", "install", "--upgrade", "pip", "setuptools", "wheel"]);
await run(python, ["-m", "pip", "install", "-r", "requirements.txt"]);
await run(python, [
  "scripts/download_model.py",
  "--model",
  process.env.WHISPER_MODEL || "small",
  "--model-dir",
  path.join(projectRoot, "models")
]);

console.log("\n本機 Whisper 已設定完成，可以執行 npm start。" );
