const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const app = express();

const simpleRequestLogger = (proxyServer, options) => {
  proxyServer.on('proxyReq', (proxyReq, req, res) => {
    // console.log('proxy req', proxyReq);
    console.log(`[HPM] [${req.method}] ${req.url} ${res.body}`); // outputs: [HPM] GET /users
  });
  proxyServer.on('proxyRes', responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const type = res.get('Content-Type');
    console.log('type', type);
    if (type.indexOf('image') === -1) {
        console.log('proxy res', );
        const response = responseBuffer.toString('utf8'); // convert buffer to string
        // console.log('resp', response);
        return response.replace('Hello', 'Goodbye'); // manipulate response and return the result
    } else {
        return responseBuffer;
    }
  }));
};

const exampleProxy = createProxyMiddleware({
    target: 'https://www.google.com',
    changeOrigin: true,
    selfHandleResponse: true,
    // logger: console,
    plugins: [simpleRequestLogger],
    /*
    on: {
        proxyReq: (proxyReq, req, res) => {
            console.log('proxy req', proxyReq, req, res);
      
        },
        proxyRes: (proxyRes, req, res) => {
            console.log('proxy res', proxyRes, req, res);
      
        },
        error: (err, req, res) => {
      
        },
    },
    */
});

app.use('/', exampleProxy);

app.listen(3000);