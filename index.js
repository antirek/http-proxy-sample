const express = require('express');
const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');

const { LogRequest } = require('./models');

const app = express();

const simpleRequestLogger = (proxyServer, options) => {
  proxyServer.on('proxyReq', (proxyReq, req, res) => {
    // console.log('proxy req', proxyReq);
    console.log(`[HPM] [${req.method}] ${req.url} ${res.body}`); // outputs: [HPM] GET /users
  });

  proxyServer.on('proxyRes', responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
    const type = res.get('Content-Type');
    const logData = {
      requestMethod: req.method,
      requestUrl: req.url,
      requestBody: '',
      responseStatus: res.statusCode,
      responseBody: responseBuffer ? responseBuffer.toString('utf8') : null,
    }
    console.log('type', type);
    console.log('log', logData);

    if (type.indexOf('image') !== -1) {
      return responseBuffer;
    } else if (type.indexOf('json') !== -1) {
      await LogRequest.create(logData);
      return responseBuffer;
    } else {
      console.log('proxy res', proxyRes);
      // const response = responseBuffer.toString('utf8'); // convert buffer to string
      // console.log('resp', response);
      return responseBuffer; //.replace('Hello', 'Goodbye'); // manipulate response and return the result
    }
  }));
};

const exampleProxy = createProxyMiddleware({
    // target: 'https://www.google.com',
    router: function(req) {
      return 'https://www.google.com';
    },
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
