"use client"

import React, { useState, useMemo } from "react"
import { Calendar, User, Search, PlusCircle, AlertTriangle, MoreVertical } from "lucide-react"

import type { Order, Customer } from "@/lib/data"
import { orders as initialOrders, customers as initialCustomers } from "@/lib/data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | Order["status"]>("All")
  const [isNewOrderDialogOpen, setNewOrderDialogOpen] = useState(false)
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [isStatusDialogOpen, setStatusDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const filteredOrders = useMemo(() => {
    let items = orders

    if (statusFilter !== "All") {
      items = items.filter((order) => order.status === statusFilter)
    }

    if (searchTerm) {
      items = items.filter(order =>
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return items
  }, [orders, searchTerm, statusFilter])

  const handleStatusChange = (order: Order, newStatus: Order["status"]) => {
    if (newStatus === "Cancelled") {
      setCancellingOrder(order)
      setCancelDialogOpen(true)
    } else {
      setOrders(
        orders.map((o) =>
          o.id === order.id ? { ...o, status: newStatus, cancellationReason: undefined } : o
        )
      )
      toast({ title: "Status Updated", description: `Order #${order.id} is now ${newStatus}.` })
    }
    setEditingOrder(null)
    setStatusDialogOpen(false)
  }

  const handleConfirmCancel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!cancellingOrder) return

    const formData = new FormData(e.currentTarget)
    const reason = formData.get("reason") as string

    setOrders(
      orders.map((order) =>
        order.id === cancellingOrder.id
          ? { ...order, status: "Cancelled", cancellationReason: reason }
          : order
      )
    )
    toast({ title: "Order Cancelled", description: `Order #${cancellingOrder.id} has been cancelled.` })
    setCancelDialogOpen(false)
    setCancellingOrder(null)
  }

  const handleAddNewOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const customerId = formData.get("customer") as string
    const eventDate = formData.get("eventDate") as string
    const eventName = formData.get("eventName") as string
    
    if (!customerId || !eventDate || !eventName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill out all required fields.",
      })
      return
    }

    const customer = initialCustomers.find(c => c.id === customerId)
    if (!customer) return

    const newOrder: Order = {
      id: `ORD${Date.now()}`,
      customerName: customer.name,
      eventName: eventName,
      eventDate: format(new Date(eventDate), "yyyy-MM-dd"),
      status: "Pending",
    }
    setOrders([newOrder, ...orders])
    toast({ title: "Success", description: "New order has been added." })
    setNewOrderDialogOpen(false)
  }
  
  const openStatusDialog = (order: Order) => {
    setEditingOrder(order)
    setStatusDialogOpen(true)
  }

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "In Progress":
        return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "Completed":
        return "bg-green-500/20 text-green-700 border-green-500/30"
      case "Cancelled":
        return "bg-red-500/20 text-red-700 border-red-500/30"
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter by Order ID, Customer, or Event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(value: "All" | Order["status"]) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setNewOrderDialogOpen(true)} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Order
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>{order.eventName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 pt-1">
                          <User className="h-4 w-4" /> {order.customerName}
                      </CardDescription>
                  </div>
                   <div className="flex items-center gap-2">
                        {order.cancellationReason && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-red-500 h-8 w-8">
                                    <AlertTriangle className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <h4 className="font-medium leading-none">Cancellation Reason</h4>
                                        <p className="text-sm text-muted-foreground">
                                            {order.cancellationReason}
                                        </p>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openStatusDialog(order)}>
                                    Update Status
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
               <p className="text-sm text-muted-foreground font-semibold pb-2">Order #{order.id}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Event on {format(new Date(order.eventDate), "PPP")}</span>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
               <Badge className={`${getStatusClass(order.status)}`} variant="outline">
                  {order.status}
                </Badge>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isNewOrderDialogOpen} onOpenChange={setNewOrderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Order</DialogTitle>
            <DialogDescription>Enter the details for the new order.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddNewOrder}>
            <div className="grid gap-4 py-4">
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventName" className="text-right">Event Name</Label>
                <Input id="eventName" name="eventName" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="customer" className="text-right">Customer</Label>
                 <Select name="customer">
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a customer" />
                    </SelectTrigger>
                    <SelectContent>
                        {initialCustomers.map(customer => (
                            <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventDate" className="text-right">Event Date</Label>
                <Input type="date" id="eventDate" name="eventDate" className="col-span-3" required/>
              </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewOrderDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCancelDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setCancellingOrder(null)
          setCancelDialogOpen(isOpen)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling order #{cancellingOrder?.id}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmCancel}>
            <div className="grid gap-4 py-4">
                <Label htmlFor="reason">Reason for Cancellation</Label>
                <Textarea id="reason" name="reason" placeholder="e.g., Customer request, scheduling conflict..." required />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>Back</Button>
                <Button type="submit" variant="destructive">Confirm Cancellation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isStatusDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setEditingOrder(null)
          setStatusDialogOpen(isOpen)
      }}>
          <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Order Status</DialogTitle>
                <DialogDescription>Select the new status for order #{editingOrder?.id}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Select
                    value={editingOrder?.status}
                    onValueChange={(value: Order["status"]) => {
                        if (editingOrder) {
                            handleStatusChange(editingOrder, value)
                        }
                    }}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancel</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </DialogContent>
      </Dialog>
    </>
  )
}
