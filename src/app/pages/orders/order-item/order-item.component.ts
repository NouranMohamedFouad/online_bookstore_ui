import { Component, Input, SimpleChanges } from '@angular/core';
import { BookItem } from '../../../interfaces/order';
import { OrdersRequestsService } from '../../../services/requests/orders/orders-requests.service';

@Component({
  selector: 'app-order-item',
  imports: [],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.css'
})
export class OrderItemComponent {
  @Input() orderItem!: BookItem;
  @Input() userRole: any;
  @Input() orderId: any;
  @Input() orderStatus!: string;

  selectedStatus: string = '';
  disabled:boolean=true;

  constructor(private oredrsHttpRequest: OrdersRequestsService){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderStatus'] && changes['orderStatus'].currentValue) {
      this.selectedStatus = changes['orderStatus'].currentValue;
    }
  }

  selectCardType(status: string): void {
    console.log("status:",this.orderStatus);
    if(status == this.selectedStatus){
      this.disabled=true;
    }
    else{
      this.disabled=false;
    }
    this.selectedStatus = status;
  } 
  updateStatus(status:string){
    this.disabled=true;
    this.oredrsHttpRequest.updateOrderStatus(this.orderId,status).subscribe(
      response => {
        console.log("Order status updated:", response);
      },
      error => {
        console.error("Error updating order status:", error);
      }
    ); 

  }
}