export type Order = {
  id: string
  customerName: string
  eventDate: string
  status: "Pending" | "In Progress" | "Completed"
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
  totalOrders: number
}

export const orders: Order[] = [
  { id: "ORD001", customerName: "Alice Johnson", eventDate: "2024-08-15", status: "Completed" },
  { id: "ORD002", customerName: "Bob Williams", eventDate: "2024-08-20", status: "In Progress" },
  { id: "ORD003", customerName: "Charlie Brown", eventDate: "2024-09-01", status: "Pending" },
  { id: "ORD004", customerName: "Diana Miller", eventDate: "2024-08-10", status: "Completed" },
  { id: "ORD005", customerName: "Ethan Davis", eventDate: "2024-09-05", status: "Pending" },
  { id: "ORD006", customerName: "Fiona Garcia", eventDate: "2024-08-25", status: "In Progress" },
]

export const menuItems: MenuItem[] = [
  { id: "MENU01", name: "Caprese Skewers", category: "Veg", price: 7.50 },
  { id: "MENU02", name: "Chicken Satay", category: "Non-Veg", price: 10.00 },
  { id: "MENU03", name: "Mushroom Vol-au-vents", category: "Veg", price: 8.00 },
  { id: "MENU04", name: "Mini Quiche Lorraine", category: "Non-Veg", price: 9.50 },
  { id: "MENU05", name: "Stuffed Bell Peppers", category: "Veg", price: 12.00 },
  { id: "MENU06", name: "Lamb Koftas", category: "Non-Veg", price: 14.00 },
]

export const customers: Customer[] = [
  { id: "CUST01", name: "Alice Johnson", phone: "123-456-7890", email: "alice@example.com", totalOrders: 2 },
  { id: "CUST02", name: "Bob Williams", phone: "234-567-8901", email: "bob@example.com", totalOrders: 1 },
  { id: "CUST03", name: "Charlie Brown", phone: "345-678-9012", email: "charlie@example.com", totalOrders: 5 },
  { id: "CUST04", name: "Diana Miller", phone: "456-789-0123", email: "diana@example.com", totalOrders: 3 },
  { id: "CUST05", name: "Ethan Davis", phone: "567-890-1234", email: "ethan@example.com", totalOrders: 8 },
  { id: "CUST06", name: "Fiona Garcia", phone: "678-901-2345", email: "fiona@example.com", totalOrders: 4 },
]

export const sevenDayRevenue = [
  { date: "7 days ago", revenue: 1200 },
  { date: "6 days ago", revenue: 1500 },
  { date: "5 days ago", revenue: 1300 },
  { date: "4 days ago", revenue: 1800 },
  { date: "3 days ago", revenue: 1600 },
  { date: "2 days ago", revenue: 1900 },
  { date: "Yesterday", revenue: 2100 },
];
