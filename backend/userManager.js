import { RoomManager } from "./roomManager.js";

export class User{
    name;
    socket;
    constructor(name,socket){
        this.name=name;
        this.socket=socket;
    }
}
export class UserManager{
    users;
    queue;
    roomManager;
    lastRecentlyMet;
    constructor(){
       this.users=[];
       this.queue=[];
       this.roomManager=new RoomManager();
       this.lastRecentlyMet=new Map();
    }

    addUser=(name="randomUser",socket)=>{
       const user= new User(name,socket);
       this.users.push(user);
       this.queue.push(user);
       socket.emit("lobby")
       console.log("user added to users ");
       this.clearQueue();
       this.initHandlers(socket);
       
    }

    
    removeUser(socketId) {
        const user = this.users.find(x => x.socket.id === socketId);
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x.socket.id !== socketId);
    }

    clearQueue(){
        if(this.queue.length<2) return;

        const user1=this.queue.pop()
        const user2=this.queue.pop()
        // if(user2===this.lastRecentlyMet(user1))
        // console.log(user1.socket.id,user2.socket.id);
        
        if(!user1 || !user2) return;
        this.roomManager.createRoom(user1,user2)
        console.log("created room ++");
       
        
        this.clearQueue()
    }

    initHandlers(socket){

        //  add ice-candidate
        // offer
        // answer
        socket.on("offer",({sdp,room_id})=>{
            // console.log("hello");
            
            const user= this.users.find(x=>x.socket===socket)
            this.roomManager.onOffer(sdp,room_id,user)
        })

        socket.on("answer",({sdp,room_id})=>{
            // console.log("hello2");

            const user= this.users.find(x=>x.socket===socket)
            this.roomManager.onAnswer(sdp,room_id,user)
        })

        socket.on("add-ice-candidate", ({candidate, roomId, type}) => {
            // console.log(roomId,candidate,type);
            
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        });

        socket.on("skip",({roomId})=>{
            const candidate= this.users.find(x=>x.socket===socket)
            // const room=this.roomManager.rooms.find(x=>x.user1.socketId)
            this.roomManager.skip(candidate,roomId);
            this.queue.push(candidate)
            this.clearQueue();
        })
        socket.on("skip-accept",()=>{
            // console.log(12345678);
            
            const candidate= this.users.find(x=>x.socket===socket)
            // this.roomManager.skip(candidate,roomId);
            this.queue.push(candidate)
            this.clearQueue();
        })

    }

}