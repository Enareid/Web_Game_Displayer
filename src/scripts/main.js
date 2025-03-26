import http from "http";
import { Server as IOServer } from "socket.io";
import IOController from './controllers/ioController.js';
import RequestController from "./controllers/requestController.js";
import ServerGestion from "./serverGestion.js";

const serv = new ServerGestion();
const server = http.createServer(
	(request, response) => new RequestController(request, response).handleRequest()
);

  
  // Attach socket.io to the HTTP server
const io = new IOServer(server);
const ioController = new IOController(io);
io.on('connection', (socket) => connection(socket));

let httpServer = serv.returnAddress()

function connection(socket) {
  ioController.registerSocket(socket);
  socket.emit('get-address', httpServer);
}

console.log(httpServer);

server.address(httpServer);
server.listen(9000);
