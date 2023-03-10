import request from "request";

const options = {
  url: "https://983a-133-83-91-149.jp.ngrok.io/",
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
};
request.get(options, (error, response, body) => {
  // エラーチェック
  if (error !== null) {
    console.error("error:", error);
    return false;
  }

  // レスポンスコードとHTMLを表示
  console.log("statusCode:", response && response.statusCode);
  console.log("body:", body);
});
