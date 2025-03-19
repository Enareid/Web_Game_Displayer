
import http from 'http';/* client*/
import IOController from './controllers/ioController.js';
import {Server as IOServer} from 'socket.io';
import RequestController from './controllers/requestController.js';
import { networkInterfaces } from 'os';

function getIPAddresses() {

  var ipAddresses = [];

  var interfaces = networkInterfaces();
  for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
          var alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
              ipAddresses.push(alias.address);
          }
      }
  }
  return ipAddresses;
}


// Create an HTTP server
const server = http.createServer(
	(request, response) => new RequestController(request, response).handleRequest()
);

  
  // Attach socket.io to the HTTP server
const io = new IOServer(server);
const ioController = new IOController(io);
io.on('connection', ioController.registerSocket.bind(ioController));

console.log(getIPAddresses[0]);
server.address(getIPAddresses[0]);
server.listen(9000);
