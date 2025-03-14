import { Injectable } from '@angular/core';

interface MockWebSocket {
  readyState: number;
  send: (message: string) => void;
  close: () => void;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null;
  onopen: ((this: WebSocket, ev: Event) => any) | null;
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null;
  onerror: ((this: WebSocket, ev: Event) => any) | null;
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  public socket!: WebSocket | MockWebSocket;
  private readonly serverUrl = 'wss://4d159b85bafde32829655fa3b417cf80.serveo.net';
  private _connected: boolean = false;

  constructor() {
    this.initWebSocket();
  }

  private initWebSocket() {
    try {
      console.log('Attempting to connect to WebSocket server:', this.serverUrl);
      this.socket = new WebSocket(this.serverUrl);

      this.socket.onopen = (event) => {
        console.log('WebSocket connection established', event);
        this._connected = true;
      };

      this.socket.onmessage = (event) => {
        console.log('Message from server:', event.data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this._connected = false;
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket connection closed:', event);
        this._connected = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.createMockSocket();
    }
  }

  private createMockSocket() {
    console.warn('Creating mock WebSocket due to connection failure');
    this.socket = {
      readyState: WebSocket.CLOSED,
      send: (message: string) => console.warn('WebSocket not connected, message not sent:', message),
      close: () => console.warn('WebSocket already closed'),
      onmessage: null,
      onopen: null,
      onclose: null,
      onerror: null
    };
    this._connected = false;
  }

  isConnected(): boolean {
    return this._connected && this.socket.readyState === WebSocket.OPEN;
  }

  sendMessage(message: string) {
    if (this.isConnected()) {
      try {
        this.socket.send(message);
        console.log('Message sent:', message);
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      console.warn('WebSocket is not open. Current state:', this.socket.readyState);
      return false;
    }
  }
  
  closeConnection() {
    if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
      try {
        this.socket.close();
        console.log('WebSocket connection closed');
      } catch (error) {
        console.error('Error closing WebSocket connection:', error);
      }
    }
    this._connected = false;
  }

  reconnect() {
    this.closeConnection();
    this.initWebSocket();
  }
}