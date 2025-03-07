import { Component } from '@angular/core';
import { HttpRequestsService } from '../../services/requests/http-requests.service';

@Component({
  selector: 'app-order-history',
  imports: [],
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})

export class OrderHistoryComponent {
  constructor(private httpRequest: HttpRequestsService){}

  orders!:any[];

  ngOnInit()
  {    
    console.log("2");

    this.httpRequest.getOrdersList().subscribe(res=>this.orders=res);
    console.log(this.orders);
  }
}
