
import http from 'http';/* client*/
import IOController from './controllers/ioController.js';
import {Server as IOServer} from 'socket.io';
import RequestController from './controllers/requestController.js';
import { networkInterfaces } from 'os';


var
    // Local IP address that we're trying to calculate
    address
    // Provides a few basic operating-system related utility functions (built-in)
    // Network interfaces
    ,ifaces = networkInterfaces();


// Iterate over interfaces ...
for (var dev in ifaces) {

    // ... and find the one that matches the criteria
    var iface = ifaces[dev].filter(function(details) {
        return details.family === 'IPv4' && details.internal === false;
    });

    if(iface.length > 0)
        address = iface[0].address;
}

// Print the result
console.log(address); // 10.25.10.147

// Create an HTTP server
const server = http.createServer(
	(request, response) => new RequestController(request, response).handleRequest()
);

  
  // Attach socket.io to the HTTP server
const io = new IOServer(server);
const ioController = new IOController(io);
io.on('connection', ioController.registerSocket.bind(ioController));

server.address(address);
server.listen(9000);
