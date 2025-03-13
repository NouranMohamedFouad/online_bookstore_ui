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
    private httpRequestsService:HttpRequestsService
  ){}

  orders!:Order[];
  response = '';
  storedUser!:User;

  ngOnInit()
  {    
    this.storedUser = this.httpRequestsService.getUserData();
    if(this.storedUser.role=='admin'){
      this.oredrsHttpRequest.getAllOrders().subscribe(res=> {
        this.orders=res;
        return this.orders;
      }); 
    }
    else if(this.storedUser.role=='customer'){
      this.oredrsHttpRequest.getOrdersList(this.storedUser.userId).subscribe(res=> {
        this.orders=res;
        return this.orders;
      }); 
    }
  }
 
}
