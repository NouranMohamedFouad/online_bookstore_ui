import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebsocketService } from '../services/requests/websocket/websocket.service';

@Component({
  selector: 'app-test',
  imports: [],
  template: `
    <h1>WebSocket Example</h1>
    <button (click)="sendMessage()">Send Message</button>
    <p>{{ response }}</p>
  `,
  styleUrl: './test.component.css'

})
export class TestComponent implements OnInit, OnDestroy {
  response = '';
  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    // Listen for messages from the server
    this.websocketService.socket.onmessage = (event) => {
      this.response = event.data;
    };
  }

  sendMessage() {
    this.websocketService.sendMessage('Hello from Angular!');
  }

  ngOnDestroy() {
    this.websocketService.closeConnection();
  }

}
