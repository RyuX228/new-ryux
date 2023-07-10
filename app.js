const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const axios = require('axios');


var key = 'AIzaSyCPQEPxbW_jv6N_XSOUMBIThX3DlAjqddY';
var cx = '50873707364714151';


const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const pathname = reqUrl.pathname;
  const query = reqUrl.query;

  if (pathname === '/main'){
    const question = query.question;
    MainData(question, res)
  }
  else if (pathname === '/data') {
    const question = query.question;
    GetData(question, res);
  } else {
    let filePath = '.' + req.url;
    if (filePath === './') {
      filePath = './index.html';
  }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
    };

    const contentTypeHeader = contentType[extname] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        if (err.code === 'ENOENT') {
          res.writeHead(404);
          res.end('404 Not Found');
        } else {
          res.writeHead(500);
          res.end('500 Internal Server Error');
        }
      } else {
        res.writeHead(200, { 'Content-Type': contentTypeHeader });
        res.end(content, 'utf-8');
      }
    });
  }
});

function MainData(question, res) {
  axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${question}`)
    .then(response => {
      const data = response.data;
      const answer = data.extract;
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      console.log(`Berhasil mengirim data dari pertanyaan:(${question}) ke client`);
      res.end(`${answer}`);
    })
    .catch(error => {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
    });
}


function GetData(question, res){
  axios.get(`https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${question}`)
  .then(response => {
    const data = response.data;
    const items = data.items;
    let answerText = '';

    if (items && items.length < 1) {
      answerText = `There is no data about ${question}`;
    } else {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let snippet = item.snippet;

        // Remove date from snippet
        snippet = snippet.replace(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g, '');
        snippet = snippet.replace(/\b\d{4}\b/g, '');

        answerText += snippet + '\n';
      }
    }

    res.writeHead(200, { 'Content-Type': 'text/plain' });
    console.log(`Berhasil mengirim data dari pertanyaan:(${question}) ke client`);
    res.end(`${answerText}`);
  })
  .catch(error => {
    console.log(error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('500 Internal Server Error');
  });
}


const port = 3000;
server.listen(port, () => {
  console.log('RyuX Online')
  console.log(`Server berjalan di port ${port}`);
});
