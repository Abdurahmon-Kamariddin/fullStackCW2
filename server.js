const http = require('http');
const express = require('express');
const app = express();


function requestHandler(request, response) {
    console.log('In comes a request to: ' + request.url);
    response.end('Hello, world!');
}

const server = http.createServer(requestHandler);

server.listen(3000);

