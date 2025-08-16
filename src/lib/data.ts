import { Timestamp } from "firebase/firestore";

export type OrderItem = {
  menuItemId: string
  name: string
  quantity: number
  price: number
}

export type Order = {
  id: string
  customerName: string
  eventName: string
  eventDate: string | Timestamp
  status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled"
  cancellationReason?: string
  items?: OrderItem[]
  orderType: "Individual" | "Plate"
  perPlatePrice?: number
  numberOfPlates?: number
  lastUpdated: string | Timestamp
  createdAt: Timestamp
}

export type MenuItem = {
  id: string
  name: string
  category: "Veg" | "Non-Veg"
  price: number
}

export type Customer = {
  id: string
  name: string
  phone: string
  email: string
  address: string
  totalOrders: number
}

export type Quotation = Omit<Order, 'status' | 'id' | 'createdAt'> & {
  id: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Ordered';
  createdAt: Timestamp
};
