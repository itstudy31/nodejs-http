'use strict';
const http = require('node:http');
const pug = require('pug');
const auth = require('http-auth');

const basic = auth.basic(
  { realm: 'Enquetes Area.' },
  (username, password, callback) => {
    callback(username === 'guest' && password === 'xaXZJQmE');
  }
);

const server = http
  .createServer(basic.check((req, res) => {
    const now = new Date();
    console.info(`[${now}] Requested by ${req.socket.remoteAddress}`);
    
    if (req.url === '/logout') {
      res.writeHead(401, {
        'Content-Type': 'text/plain; charset=utf-8'
      });
      res.end('ログアウトしました');
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8'
    });

    switch (req.method) {
      case 'GET':
        if (req.url === '/') {
          res.write('<!DOCTYPE html><html lang="ja"><body>' +
            '<h1>アンケートフォーム</h1>' +
            '<a href="/enquetes">アンケート一覧</a>' +
            '</body></html>');
        } else if (req.url === '/enquetes') {
          res.write('<!DOCTYPE html><html lang="ja"><body>' +
            '<h1>アンケート一覧</h1><ul>' +
            '<li><a href="/enquetes/yaki-tofu">焼き豆腐・湯豆腐</a></li>' +
            '<li><a href="/enquetes/rice-bread">ごはん・パン</a></li>' +
            '<li><a href="/enquetes/sushi-pizza">寿司・ピザ</a></li>' +
            '</ul></body></html>');
        } else if (req.url === '/enquetes/yaki-tofu') {
          res.write(
            pug.renderFile('./form.pug', {
              path: req.url,
              firstItem: '焼き肉',
              secondItem: '湯豆腐'
            })
          );
        } else if (req.url === '/enquetes/rice-bread') {
          res.write(
            pug.renderFile('./form.pug', {
              path: req.url,
              firstItem: 'ごはん',
              secondItem: 'パン'
            })
          );
        }
        res.end();
        break;
      case 'POST': {
        let rawData = '';
        req
          .on('data', chunk => {
            rawData += chunk;
          })
          .on('end', () => {
            const answer = new URLSearchParams(rawData);
            const body = `${answer.get('name')}さんは${answer.get('favorite')}を選択しました`;
            console.info(`[${now}] ${body}`);
            res.write(
              `<!DOCTYPE html><html lang="ja"><body><h1>${body}</h1></body></html>`
            );
            res.end();
          });
        break;
      }
      default:
        // res.statusCode = 404;
        // res.end('Not Found');
        break;
    }
  }))
  .on('error', e => {
    console.error(`[${new Date()}] Server Error`, e);
  })
  .on('clientError', e => {
    console.error(`[${new Date()}] Client Error`, e);
  });

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.info(`[${new Date()}] Listening on ${port}`);
});
