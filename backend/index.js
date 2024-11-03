import { Socket } from "socket.io";
import http from "http";
import { Server } from 'socket.io';
import { UserManager } from "./userManager.js";
// import { UserManager } from "./userManager";
// import { UserManager } from "./userManger.js";

// const app = express();
const server = http.createServer(http);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

const userManager = new UserManager();

io.on("connect",(socket)=>{
    userManager.addUser("user1",socket)
    socket.on("disconnect",(socket)=>{
        userManager.removeUser(socket.id)
    })

})


server.listen(3000, () => {
    console.log('listening on *:3000');
});