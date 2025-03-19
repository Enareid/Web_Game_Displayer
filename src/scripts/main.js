import http from 'http';
import IOController from './controllers/ioController.js';
import {Server as IOServer} from 'socket.io';
import RequestController from './controllers/requestController.js';
import ServerGestion from './serverGestion.js';


const serv = new ServerGestion();
// Create an HTTP server
const server = http.createServer(
	(request, response) => new RequestController(request, response).handleRequest()
);

  
  // Attach socket.io to the HTTP server
const io = new IOServer(server);
const ioController = new IOController(io);
io.on('connection', ioController.registerSocket.bind(ioController));

server.address(serv.returnAddress());
server.listen(9000);
