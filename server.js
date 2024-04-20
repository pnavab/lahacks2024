//entrypoint of the app
import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

const LOBBIES = new Map();

function generateLobbyId() {
    return Math.floor(Math.random()*90000) + 10000;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on('hello', (data) => {
        console.log('Client said:', data); // 'Client said: world'
        // Emit a response back to the client
        socket.emit('serverResponse', 'Hello from the server!');
    });

    socket.on('createLobby', () => {
      const id = generateLobbyId(); // Generate a unique lobby ID
      const lobby = { id: id, clients: [] };
      LOBBIES.set(id, lobby);
      socket.join(id);
      socket.emit('lobbyCreated', id);
    });
      
    socket.on('joinLobby', (username, lobbyId, avatarUrl) => {
      let id = parseInt(lobbyId);
      if (lobbyId == null) {
        id = generateLobbyId(); // Generate a unique lobby ID
        const lobby = { id: id, clients: [] };
        LOBBIES.set(id, lobby);
        socket.emit('lobbyCreated', id);
      }
      const lobby = LOBBIES.get(id);
      if (lobby) {
        const client = {'socketId': socket.id, 'username': username, 'avatar': ''}
        lobby.clients.push(client);
        socket.join(id);
        
        console.log(io.of('/').adapter.rooms); //see all the rooms and socket ids connected
        socket.emit('lobbyJoined', id);
        
        // broadcast the updated list of connected clients
        const usernames = lobby.clients.map((client) => client.username);
        console.log("usernames are", usernames);
        io.in(id).emit('lobbyUpdate', usernames);
      } else {
        console.log("lobby not found");
        socket.emit('joinError', 'Lobby not found');
      }
    });

    socket.on('updateAvatar', (username, lobbyId, avatarUrl) => {
      let id = parseInt(lobbyId);
      const lobby = LOBBIES.get(id);
      if (lobby) {
        console.log("updating avatar", username, avatarUrl);
        io.in(id).emit('lobbyAvatarUpdate', username, avatarUrl);
      } else {
        console.log("lobby not found");
        socket.emit('joinError', 'Lobby not found');
      }
    });

    socket.on('updateStory', (username, lobbyId, updateText) => {
      let id = parseInt(lobbyId);
      const lobby = LOBBIES.get(id);
      if (lobby) {
        console.log("updating story", updateText);
        io.in(id).emit('lobbyStoryUpdate', updateText);
      } else {
        console.log("lobby not found");
        socket.emit('joinError', 'Lobby not found');
      }
    });
    
    socket.on('checkLobbyExists', (lobbyId) => {
      let id = parseInt(lobbyId);
      const lobby = LOBBIES.get(id);
      if (lobby) {
        socket.emit('lobbyFound', true);
        socket.join(id);
      } else {
        console.log(`lobby ${id} not found`);
        socket.emit('lobbyFound', false);
      }
    });
    
    // ALL COLLABORATIVE CANVAS SOCKET LOGIC
    socket.on('checkCollaborativeCanvasLobbyExists', (lobbyId) => {
      let id = parseInt(lobbyId);
      const lobby = LOBBIES.get(id);
      if (lobby) {
        socket.emit('lobbyFound', true);
      } else {
        console.log(`lobby ${id} not found`);
        socket.emit('lobbyFound', false);
      }
    });
    
    socket.on('createCollaborativeCanvasLobby', () => {
      const id = generateLobbyId(); // Generate a unique lobby ID
      const lobby = { id: id, clients: [], drawing: "" };
      LOBBIES.set(id, lobby);
      socket.join(id);
      socket.emit('collaborativeCanvasLobbyCreated', id);
    });
    
    socket.on('joinCollaborativeCanvas', (username, lobbyId) => {
      let id = parseInt(lobbyId);
      let lobby = LOBBIES.get(id);
      if(lobby) {
        const client = {'socketId': socket.id, 'username': username};
        const existingClient = lobby.clients.find(c => c.socketId === socket.id);
        if (!existingClient) {
          lobby.clients.push(client);
          socket.join(id);
          console.log(io.of('/').adapter.rooms); //see all the rooms and socket ids connected
          socket.emit("joinedCollaborativeCanvas", lobby.drawing);
          
          const usernames = lobby.clients.map((client) => client.username);
          console.log('users are', usernames);
          io.in(id).emit('collaborativeCanvasUserUpdate', usernames);
        }
      }
    });
    
    socket.on('drawingData', (data, canvas, lobbyId) => {
      let id = parseInt(lobbyId);
      let lobby = LOBBIES.get(id);
      const existingClient = lobby.clients.find(c => c.socketId === socket.id);
      if (lobby && existingClient) {
        lobby.drawing = canvas;
        // console.log(io.of('/').adapter.rooms); //see all the rooms and socket ids connected
        io.in(id).emit('updateCollaborativeCanvas', data);
      }
    });
    
    socket.on('clearCanvas', (lobbyId) => {
      console.log('clearing canvas');
      let id = parseInt(lobbyId);
      let lobby = LOBBIES.get(id);
      if (lobby) {
        lobby.drawing = "";
        io.in(id).emit('clearCanvasForAll');
      }
    });
    
    // ALL SOLO CANVAS SOCKET LOGIC
    socket.on('checkSoloCanvasLobbyExists', (lobbyId) => {
      let id = parseInt(lobbyId);
      const lobby = LOBBIES.get(id);
      if (lobby) {
        socket.emit('lobbyFound', true);
      } else {
        console.log(`lobby ${id} not found`);
        socket.emit('lobbyFound', false);
      }
    });
    
    socket.on('createSoloCanvasLobby', () => {
      const id = generateLobbyId(); // Generate a unique lobby ID
      const lobby = { id: id, clients: [] };
      LOBBIES.set(id, lobby);
      socket.join(id);
      socket.emit('soloCanvasLobbyCreated', id);
    });
    
    socket.on('joinSoloCanvas', (username, lobbyId) => {
      let id = parseInt(lobbyId);
      let lobby = LOBBIES.get(id);
      if(lobby) {
        const client = {'socketId': socket.id, 'username': username, 'drawing': ""};
        console.log("cur client is", client);
        // const existingClient = lobby.client_to_drawing.get(username);
        const existingClient = lobby.clients.find(c => c.socketId === socket.id);
        if (!existingClient) {
          // lobby.client_to_drawing[username] = client;
          lobby.clients.push(client);
          socket.join(id);
          console.log(io.of('/').adapter.rooms); //see all the rooms and socket ids connected
          socket.emit("joinedSoloCanvas", lobby.drawing);
          
          // const users = {};
          // lobby.clients.forEach((client) => {
          //   users[client.username] = client.drawing;
          // });
          const usernames = lobby.clients.map((client) => client.username);
          console.log('users are', usernames);
          io.in(id).emit('soloCanvasUserUpdate', usernames);
        }
      }
    });
    
    socket.on('drawingSoloData', (data, username, canvas, lobbyId) => {
      let id = parseInt(lobbyId);
      let lobby = LOBBIES.get(id);
      const existingClient = lobby.clients.find(c => c.socketId === socket.id);
      if (lobby && existingClient) {
        existingClient.drawing = canvas;
        // console.log("drawing data is", data, username, canvas, lobbyId);
        // console.log(io.of('/').adapter.rooms); //see all the rooms and socket ids connected
        io.in(id).emit('updateSoloCanvas', username, data, canvas);
      }
    });

    socket.on('clearSoloCanvas', (lobbyId) => {
      console.log('clearing canvas');
      let id = parseInt(lobbyId);
      let lobby = LOBBIES.get(id);
      if (lobby) {
        io.in(id).emit('clearCanvasForAll');
      }
    });

    // ALL GARTIC PHONE RIPOFF LOGIC
    socket.on('createPhoneLobby', () => {
      const id = generateLobbyId(); // Generate a unique lobby ID
      const lobby = { id: id, clients: [] };
      LOBBIES.set(id, lobby);
      socket.join(id);
      socket.emit('phoneLobbyCreated', id);
    });
      
    socket.on('joinPhoneLobby', (username, lobbyId) => {
      let id = parseInt(lobbyId);
      if (lobbyId == null) {
        id = generateLobbyId(); // Generate a unique lobby ID
        const lobby = { id: id, clients: [] };
        LOBBIES.set(id, lobby);
        socket.emit('phoneLobbyCreated', id);
      }
      const lobby = LOBBIES.get(id);
      if (lobby) {
        const client = {'socketId': socket.id, 'username': username}
        lobby.clients.push(client);
        socket.join(id);
        
        console.log(io.of('/').adapter.rooms); //see all the rooms and socket ids connected
        socket.emit('phoneLobbyJoined', id);
        
        // broadcast the updated list of connected clients
        const usernames = lobby.clients.map((client) => client.username);
        console.log("usernames are", usernames);
        io.in(id).emit('phoneLobbyUpdate', usernames);
      } else {
        console.log("lobby not found");
        socket.emit('joinError', 'Lobby not found');
      }
    });


  });
  
  httpServer
  .once("error", (err) => {
    console.error(err);
    process.exit(1);
  })
  .listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});