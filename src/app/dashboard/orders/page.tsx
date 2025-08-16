"use client"

import React, { useState } from "react"
import { Calendar, User } from "lucide-react"

import type { Order } from "@/lib/data"
import { orders as initialOrders } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)

  const handleStatusChange = (orderId: string, newStatus: Order["status"]) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    )
  }

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "In Progress":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "Completed":
        return "bg-green-500/20 text-green-700 border-green-500/30"
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Recent Orders</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {orders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <CardTitle>Order #{order.id}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-1">
                <User className="h-4 w-4" /> {order.customerName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Event on {order.eventDate}</span>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Select
                value={order.status}
                onValueChange={(value: Order["status"]) =>
                  handleStatusChange(order.id, value)
                }
              >
                <SelectTrigger className="w-fit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
               <Badge className={`${getStatusClass(order.status)}`} variant="outline">
                  {order.status}
                </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
