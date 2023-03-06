import "./style.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files.js";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

window.addEventListener("load", async () => {
  textareaEl.value = files["index.js"].file.contents;
  // textareaの内容が変更されたら、index.jsを書き換える
  textareaEl.addEventListener("input", (e) => {
    writeIndexJS(e.target.value);
  });

  const terminal = new Terminal({
    convertEol: true,
  });
  terminal.open(terminalEl);

  // WebContainerを起動する
  webcontainerInstance = await WebContainer.boot();
  // WebContainerにファイルをマウントして、ファイルの読み取りを可能にする
  await webcontainerInstance.mount(files);

  const exitCode = await installDependencies();
  if (exitCode !== 0) {
    throw new Error("Installation failed");
  }

  // WebContainerのexpressサーバーを起動する
  startDevServer();
});

document.querySelector("#app").innerHTML = `
  <div class="container">
    <div class="editor">
      <textarea>I am a textarea</textarea>
    </div>
    <div class="preview">
      <iframe src="loading.html"></iframe>
    </div>
  </div>
  <div class="terminal"></div>
`;

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector("iframe");

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector("textarea");

/** @type {HTMLTextAreaElement | null} */
const terminalEl = document.querySelector(".terminal");

async function installDependencies() {
  const installProcess = await webcontainerInstance.spawn("npm", ["install"]);
  // npm install の結果をコンソールに出力する
  // installProcess.output.pipeTo(
  //   new WritableStream({
  //     write(data) {
  //       console.log(data);
  //     },
  //   })
  // );
  return installProcess.exit;
}

async function startDevServer() {
  const startProcess = await webcontainerInstance.spawn("npm", [
    "run",
    "start",
  ]);

  // startProcess.output.pipeTo(
  //   new WritableStream({
  //     write(data) {
  //       console.log(data);
  //     },
  //   })
  // );

  webcontainerInstance.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });
}

/** @param {string} content */

async function writeIndexJS(content) {
  await webcontainerInstance.fs.writeFile("/index.js", content);
}
