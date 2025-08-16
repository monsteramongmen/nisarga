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
  eventDate: string
  status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled"
  cancellationReason?: string
  items?: OrderItem[]
  orderType: "Individual" | "Plate"
  perPlatePrice?: number
  numberOfPlates?: number
  lastUpdated: string
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

export const orders: Order[] = [
  { id: "ORD001", customerName: "Alice Johnson", eventName: "Birthday Party", eventDate: "2024-08-15", status: "Completed", items: [{ menuItemId: "MENU01", name: "Caprese Skewers", quantity: 2, price: 625.50 }, { menuItemId: "MENU02", name: "Chicken Satay", quantity: 3, price: 830.00 }], orderType: "Individual", lastUpdated: "2024-08-15T10:00:00Z" },
  { id: "ORD002", customerName: "Bob Williams", eventName: "Corporate Lunch", eventDate: "2024-08-20", status: "In Progress", items: [{ menuItemId: "MENU03", name: "Mushroom Vol-au-vents", quantity: 5, price: 665.00 }], orderType: "Individual", lastUpdated: "2024-08-20T11:00:00Z" },
  { id: "ORD003", customerName: "Charlie Brown", eventName: "Wedding Anniversary", eventDate: "2024-09-01", status: "Pending", orderType: "Individual", lastUpdated: "2024-08-22T12:00:00Z" },
  { id: "ORD004", customerName: "Diana Miller", eventName: "Graduation Celebration", eventDate: "2024-08-10", status: "Completed", items: [{ menuItemId: "MENU05", name: "Stuffed Bell Peppers", quantity: 10, price: 1000.00 }], orderType: "Individual", lastUpdated: "2024-08-10T13:00:00Z" },
  { id: "ORD005", customerName: "Ethan Davis", eventName: "Team Outing", eventDate: "2024-09-05", status: "Pending", orderType: "Individual", lastUpdated: "2024-08-25T14:00:00Z" },
  { id: "ORD006", customerName: "Fiona Garcia", eventName: "Holiday Feast", eventDate: "2024-08-25", status: "Confirmed", items: [{ menuItemId: "MENU06", name: "Lamb Koftas", quantity: 4, price: 1165.00 }], orderType: "Individual", lastUpdated: "2024-08-25T15:00:00Z" },
]

export const menuItems: MenuItem[] = [
  { id: "MENU01", name: "Caprese Skewers", category: "Veg", price: 625.50 },
  { id: "MENU02", name: "Chicken Satay", category: "Non-Veg", price: 830.00 },
  { id: "MENU03", name: "Mushroom Vol-au-vents", category: "Veg", price: 665.00 },
  { id: "MENU04", name: "Mini Quiche Lorraine", category: "Non-Veg", price: 790.50 },
  { id: "MENU05", name: "Stuffed Bell Peppers", category: "Veg", price: 1000.00 },
  { id: "MENU06", name: "Lamb Koftas", category: "Non-Veg", price: 1165.00 },
]

export const customers: Customer[] = [
  { id: "CUST01", name: "Alice Johnson", phone: "123-456-7890", email: "alice@example.com", address: "123 Maple St, Springfield", totalOrders: 2 },
  { id: "CUST02", name: "Bob Williams", phone: "234-567-8901", email: "bob@example.com", address: "456 Oak Ave, Shelbyville", totalOrders: 1 },
  { id: "CUST03", name: "Charlie Brown", phone: "345-678-9012", email: "charlie@example.com", address: "789 Pine Ln, Capital City", totalOrders: 5 },
  { id: "CUST04", name: "Diana Miller", phone: "456-789-0123", email: "diana@example.com", address: "101 Birch Rd, Ogdenville", totalOrders: 3 },
  { id: "CUST05", name: "Ethan Davis", phone: "567-890-1234", email: "ethan@example.com", address: "212 Cedar Blvd, North Haverbrook", totalOrders: 8 },
  { id: "CUST06", name: "Fiona Garcia", phone: "678-901-2345", email: "fiona@example.com", address: "333 Elm Ct, Brockway", totalOrders: 4 },
]

export const sevenDayRevenue = [
  { date: "7 days ago", revenue: 100000 },
  { date: "6 days ago", revenue: 125000 },
  { date: "5 days ago", revenue: 110000 },
  { date: "4 days ago", revenue: 150000 },
  { date: "3 days ago", revenue: 135000 },
  { date: "2 days ago", revenue: 160000 },
  { date: "Yesterday", revenue: 175000 },
];

    