import promptSync from 'prompt-sync';

const prompt = promptSync();
export default class IOController { // Server
    #io;
    #clients;

    constructor(io,socket) {
      this.#io = io;
      this.#clients = new Array();
    }
  
    registerSocket(socket) {
      this.setupListeners(socket);
      console.log(`new connection with ${socket.id}`);
    }
  
    setupListeners(socket) {
        this.#clients.push(socket);
        this.connect(socket);
        socket.on('message', (msg)=> this.#io.emit('chat message',msg));
        this.gettingBoard(socket);
        socket.on('disconnect',()=> this.leave(socket));
        this.updateBoard(socket);
    }
    
    gettingBoard(socket){
      socket.on('view board',(socketid) => this.#io.emit('send board',socketid));
      socket.on("sended board",(board,socketid, id) => {
        let socketToSendTo = this.#clients.find((element) => element.id === socketid);
        socketToSendTo.emit('print board',board, id);
    })
    }

    updateBoard(socket){
      socket.on('update board',(board,id) =>{this.#io.emit('sended update board',board,id)})
    }

    leave(socket) {
        console.log(`disconnection with ${socket.id}`);
        this.#clients.splice(this.#clients.indexOf(socket),1);
    }

    connect(socket) {
        socket.emit('identification');
    }

  }