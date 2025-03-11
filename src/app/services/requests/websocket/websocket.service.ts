import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socket: WebSocket;
  private readonly serverUrl = 'ws://localhost:8080'; // WebSocket server URL

  constructor() {
    this.socket = new WebSocket(this.serverUrl);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }

  sendMessage(message: string) {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.error('WebSocket is not open.');
    }
  }

  closeConnection() {
    this.socket.close();
  }
}