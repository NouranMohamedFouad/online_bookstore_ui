export interface Cart {
  _id?: string;
  userId: string;
  items: CartItem[];
  total_price: number;
}

export interface CartItem {
  bookId: string;
  quantity: number;
  price: number;
  book?: any; // Will be populated with book details when needed
  updating?: boolean; // Flag to track if this item is being updated
}
