import { Component } from '@angular/core';
import { HttpRequestsService } from '../../../services/requests/http-requests.service';
import { Order } from '../../../interfaces/order';
import { OrdersRequestsService } from '../../../services/requests/orders/orders-requests.service';
import { OrderItemComponent } from "../order-item/order-item.component";

@Component({
  selector: 'app-order-history',
  imports: [OrderItemComponent],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})

export class OrderHistoryComponent {
  constructor(private httpRequest: OrdersRequestsService){}

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
