export interface Order {
    orderId?: number; 
    userId: string;  
    books: {
      bookId: string;
      quantity: number;
    }[];
    totalPrice?: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';  
    createdAt?: string; 
  }
  