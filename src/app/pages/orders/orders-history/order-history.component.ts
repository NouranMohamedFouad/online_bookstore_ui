import { Component } from '@angular/core';
import { HttpRequestsService } from '../../../services/requests/http-requests.service';
import { Order } from '../../../interfaces/order';
import { OrdersRequestsService } from '../../../services/requests/orders/orders-requests.service';
import { OrderItemComponent } from "../order-item/order-item.component";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-history',
  imports: [OrderItemComponent,DatePipe],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css',
  providers: [DatePipe] 

})

export class OrderHistoryComponent {
  constructor(private httpRequest: OrdersRequestsService,private datePipe: DatePipe){}
  orders!:Order[];

  ngOnInit()
  {    
    console.log("orders got collected");
    this.httpRequest.getOrdersList().subscribe(res=> {
      this.orders=res;
      console.log(this.orders);
      return this.orders;
    }); 
  }
}
