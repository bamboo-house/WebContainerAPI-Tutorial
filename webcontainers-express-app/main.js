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

  webcontainerInstance.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });

  startShell(terminal);
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

/** @param {string} content */
async function writeIndexJS(content) {
  await webcontainerInstance.fs.writeFile("/index.js", content);
}

/**
 * @param {Terminal} terminal
 */
async function startShell(terminal) {
  const shellProcess = await webcontainerInstance.spawn("jsh");
  shellProcess.output.pipeTo(
    new WritableStream({
      write(data) {
        terminal.write(data);
      },
    })
  );

  const input = shellProcess.input.getWriter();
  terminal.onData((data) => {
    input.write(data);
  });
  return shellProcess;
}
