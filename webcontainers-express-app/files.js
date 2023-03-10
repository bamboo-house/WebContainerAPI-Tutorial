/** @satisfies {import('@webcontainer/api').FileSystemTree} */

// ファイルを文字列としてcontentsに記述する
export const files = {
  "index.js": {
    file: {
      contents: `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
  res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
  console.log(\`App is live at http://localhost:\${port}\`);
});`,
    },
  },
  "request.js": {
    file: {
      contents: `
        import request from 'request';

        const options = {
          url: 'https://983a-133-83-91-149.jp.ngrok.io/',
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        };
        request.get(options, (error, response, body) => {
          // エラーチェック
          if( error !== null ){
            console.error('error:', error);
            return(false);
          }

          // レスポンスコードとHTMLを表示
          console.log('statusCode:', response && response.statusCode);
          console.log('body:', body);
        });
      `,
    },
  },
  "package.json": {
    file: {
      contents: `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest",
    "request": "^2.88.2"
  },
  "scripts": {
    "start": "nodemon --watch './' index.js"
  }
}`,
    },
  },
};
