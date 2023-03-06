import "./style.css";
import { WebContainer } from "@webcontainer/api";
import { files } from "./files.js";

/** @type {import('@webcontainer/api').WebContainer}  */
let webcontainerInstance;

window.addEventListener("load", async () => {
  textareaEl.value = files["index.js"].file.contents;

  // WebContainerを起動する
  webcontainerInstance = await WebContainer.boot();
  // WebContainerにファイルをマウントして、ファイルの読み取りを可能にする
  await webcontainerInstance.mount(files);

  const exitCode = await installDependencies();
  if (exitCode !== 0) {
    throw new Error("Installation failed");
  }
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
`;

/** @type {HTMLIFrameElement | null} */
const iframeEl = document.querySelector("iframe");

/** @type {HTMLTextAreaElement | null} */
const textareaEl = document.querySelector("textarea");

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
  await webcontainerInstance.spawn("npm", ["run", "start"]);

  webcontainerInstance.on("server-ready", (port, url) => {
    iframeEl.src = url;
  });
}
