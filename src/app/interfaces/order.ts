export interface Order {
    orderId?: number; 
    userId: string;  
    books:BookItem[];
    totalPrice?: number;
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled';  
    createdAt?: string; 
}

export interface BookItem{
      bookId: string;
      quantity: number;
      bookDetails:BookDetails;
}

export interface BookDetails{
    title: string;
    price:number;
    image:string;
    bookId:number;
}
  