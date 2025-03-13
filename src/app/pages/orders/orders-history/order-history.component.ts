import { Component } from '@angular/core';
import { HttpRequestsService } from '../../../services/requests/http-requests.service';
import { Order } from '../../../interfaces/order';
import { OrdersRequestsService } from '../../../services/requests/orders/orders-requests.service';
import { OrderItemComponent } from "../order-item/order-item.component";
import { DatePipe } from '@angular/common';
import { WebsocketService } from '../../../services/requests/websocket/websocket.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-order-history',
  imports: [OrderItemComponent,DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
  providers: [DatePipe] 
})

export class OrderHistoryComponent {

  constructor(
    private oredrsHttpRequest: OrdersRequestsService,
    private datePipe: DatePipe,
    private websocketService: WebsocketService,
    private httpRequestsService:HttpRequestsService
  ){}

  orders!:Order[];
  response = '';
  storedUser!:User;

  ngOnInit()
  {    
    this.storedUser = this.httpRequestsService.getUserData();
    this.oredrsHttpRequest.getOrdersList(this.storedUser.userId).subscribe(res=> {
      this.orders=res;
      //this.sendMessage();
      return this.orders;
    }); 

    this.websocketService.socket.onmessage = (event) => {
      this.response = event.data;
    };
  }
  sendMessage() {
    const orderDetails = {
      orderId: this.orders[0].orderId,
      totalPrice: this.orders[0].totalPrice,
      createdAt: this.orders[0].createdAt
    };

    const data = {
      user: this.storedUser,
      order: orderDetails
    };
    this.websocketService.sendMessage(JSON.stringify(data));
  }
  ngOnDestroy() {
    this.websocketService.closeConnection();
  }
}
