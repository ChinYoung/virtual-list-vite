import { Socket, io } from "socket.io-client";

export class WsClient {
  socket: undefined | Socket = undefined
  connect() {
    this.socket = io("ws://localhost:888");
    this.socket.on("connect", () => {
      console.log(this.socket?.id);
    });
    this.socket.on("disconnect", () => {
      console.log(this.socket?.id);
    });
  }
}
