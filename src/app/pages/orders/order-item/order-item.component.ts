import { Component, Input } from '@angular/core';
import { BookItem } from '../../../interfaces/order';

@Component({
  selector: 'app-order-item',
  imports: [],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.css'
})
export class OrderItemComponent {
  @Input() orderItem!:BookItem;
  
}