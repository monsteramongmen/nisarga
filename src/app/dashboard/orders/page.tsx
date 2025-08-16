"use client"

import React, { useState, useMemo } from "react"
import { Calendar, User, Search, PlusCircle, AlertTriangle, MoreVertical, Pencil, Trash2, ShoppingCart } from "lucide-react"

import type { Order, Customer, MenuItem, OrderItem } from "@/lib/data"
import { orders as initialOrders, customers as initialCustomers, menuItems } from "@/lib/data"
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
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const statusHierarchy: Order["status"][] = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | Order["status"]>("All")
  const [isFormOpen, setFormOpen] = useState(false)
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  const [tempItems, setTempItems] = useState<OrderItem[]>([])
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState<'All' | 'Veg' | 'Non-Veg'>('All');


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
    
    return items.sort((a, b) => statusHierarchy.indexOf(a.status) - statusHierarchy.indexOf(b.status));
  }, [orders, searchTerm, statusFilter])

  const orderSummary = useMemo(() => {
    const totalItems = tempItems.length
    const totalQuantity = tempItems.reduce((sum, item) => sum + item.quantity, 0)
    const totalAmount = tempItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    return { totalItems, totalAmount, totalQuantity }
  }, [tempItems])

  const filteredMenuItems = useMemo(() => {
    const selectedItemIds = new Set(tempItems.map(item => item.menuItemId));
    return menuItems
      .filter(item => !selectedItemIds.has(item.id))
      .filter(item => menuCategory === 'All' || item.category === menuCategory)
      .filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase()));
  }, [menuSearch, menuCategory, tempItems]);


  const handleOpenForm = (order: Order | null = null) => {
    setEditingOrder(order)
    setTempItems(order?.items || [])
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setEditingOrder(null)
    setTempItems([])
    setFormOpen(false)
  }

  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const baseOrderData = {
      eventName: formData.get("eventName") as string,
      eventDate: format(new Date(formData.get("eventDate") as string), "yyyy-MM-dd"),
    }

    if (editingOrder) {
      const updatedOrder: Order = {
        ...editingOrder,
        ...baseOrderData,
        status: formData.get("status") as Order["status"],
        items: tempItems,
      }
       if (updatedOrder.status === "Cancelled") {
          handleCloseForm()
          setCancellingOrder(updatedOrder)
          setCancelDialogOpen(true)
          return
       }
       
      setOrders(orders.map(o => o.id === editingOrder.id ? updatedOrder : o))
      toast({ title: "Success", description: "Order updated successfully." })
    } else {
       const customerId = formData.get("customer") as string
       if (!customerId) {
         toast({ variant: "destructive", title: "Error", description: "Please select a customer." })
         return
       }
       const customer = initialCustomers.find(c => c.id === customerId)
       if (!customer) {
        toast({ variant: "destructive", title: "Error", description: "Customer not found." })
        return
       }
       const newOrder: Order = {
         id: `ORD${Date.now()}`,
         customerName: customer!.name,
         ...baseOrderData,
         status: "Pending",
         items: [],
       }
       setOrders([newOrder, ...orders])
       toast({ title: "Success", description: "New order has been added." })
    }

    handleCloseForm()
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

  const handleItemAdd = (menuItem: MenuItem) => {
    const existingItem = tempItems.find(i => i.menuItemId === menuItem.id)
    if (existingItem) {
      handleItemQuantityChange(menuItem.id, existingItem.quantity + 1)
    } else {
      const newItem: OrderItem = {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
      }
      setTempItems([...tempItems, newItem])
    }
  }

  const handleItemQuantityChange = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setTempItems(tempItems.filter(i => i.menuItemId !== menuItemId))
    } else {
      setTempItems(tempItems.map(i => i.menuItemId === menuItemId ? { ...i, quantity } : i))
    }
  }

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "Confirmed": return "bg-cyan-500/20 text-cyan-700 border-cyan-500/30"
      case "In Progress": return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "Completed": return "bg-green-500/20 text-green-700 border-green-500/30"
      case "Cancelled": return "bg-red-500/20 text-red-700 border-red-500/30"
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
                    <SelectItem value="Confirmed">Confirmed</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleOpenForm()} className="whitespace-nowrap">
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
                                <DropdownMenuItem onClick={() => handleOpenForm(order)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Update Order
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
      
      <Dialog open={isFormOpen} onOpenChange={(open) => {
        if (!open) handleCloseForm()
        else setFormOpen(open)
      }}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingOrder ? `Update Order #${editingOrder.id}` : 'Add New Order'}</DialogTitle>
              <DialogDescription>{editingOrder ? 'Update details for this order.' : 'Enter details for the new order.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveOrder} className="flex-grow overflow-hidden flex flex-col gap-4">
                {editingOrder ? (
                    <Tabs defaultValue="details" className="flex-grow flex flex-col overflow-hidden">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="add_items">Add Items</TabsTrigger>
                            <TabsTrigger value="summary">
                                Summary <Badge variant="secondary" className="ml-2">{orderSummary.totalItems}</Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="flex-grow overflow-y-auto pt-4">
                           <div className="space-y-4 pr-4">
                            <div className="grid gap-2">
                                <Label htmlFor="eventName">Event Name</Label>
                                <Input id="eventName" name="eventName" defaultValue={editingOrder?.eventName} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer">Customer</Label>
                                <Input id="customer" name="customer" value={editingOrder?.customerName} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="eventDate">Event Date</Label>
                                <Input type="date" id="eventDate" name="eventDate" defaultValue={editingOrder?.eventDate} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Order Status</Label>
                                <Select name="status" defaultValue={editingOrder.status}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusHierarchy.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                            </div>
                           </div>
                        </TabsContent>
                        <TabsContent value="add_items" className="flex-grow flex flex-col overflow-hidden pt-4">
                            <div className="flex gap-4 mb-4 pr-4 shrink-0">
                                <Input placeholder="Search items..." value={menuSearch} onChange={e => setMenuSearch(e.target.value)} />
                                <Select value={menuCategory} onValueChange={(v: 'All' | 'Veg' | 'Non-Veg') => setMenuCategory(v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All</SelectItem>
                                        <SelectItem value="Veg">Veg</SelectItem>
                                        <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <ScrollArea className="flex-grow pr-4 -mr-4">
                                <div className="space-y-2">
                                    {filteredMenuItems.map(item => (
                                        <Card key={item.id} className="p-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold">{item.name}</p>
                                                <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)}</p>
                                            </div>
                                            <Button type="button" size="sm" onClick={() => handleItemAdd(item)}>Add</Button>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="summary" className="flex-grow flex flex-col overflow-hidden pt-4">
                            <div className="flex-grow overflow-y-auto">
                                <ScrollArea className="h-full pr-4 -mr-4">
                                <div className="space-y-2">
                                    {tempItems.length > 0 ? tempItems.map(item => (
                                    <div key={item.menuItemId} className="flex justify-between items-center bg-muted p-2 rounded-md">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">@ ₹{item.price.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                        <Input 
                                            type="number" 
                                            className="w-20 h-8 text-center"
                                            value={item.quantity}
                                            onChange={(e) => handleItemQuantityChange(item.menuItemId, parseInt(e.target.value, 10))}
                                            min="0"
                                        />
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleItemQuantityChange(item.menuItemId, 0)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        </div>
                                        <div className="w-24 text-right font-semibold">
                                         ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    </div>
                                    )) : (
                                    <div className="text-sm text-muted-foreground text-center py-16 h-full flex flex-col justify-center items-center">
                                        <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                                        <h3 className="text-lg font-semibold">No items added yet.</h3>
                                        <p>Head to the 'Add Items' tab to select menu items.</p>
                                    </div>
                                    )}
                                </div>
                                </ScrollArea>
                            </div>
                            {tempItems.length > 0 && (
                            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2 border-t pr-4 shrink-0">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Final Amount</span>
                                    <span>₹{orderSummary.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Total Quantity</span>
                                    <span>{orderSummary.totalQuantity}</span>
                                </div>
                            </div>
                            )}
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="eventName">Event Name</Label>
                            <Input id="eventName" name="eventName" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customer">Customer</Label>
                            <Select name="customer" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a customer" />
                                </SelectTrigger>
                                <SelectContent>
                                    {initialCustomers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="eventDate">Event Date</Label>
                            <Input type="date" id="eventDate" name="eventDate" required/>
                        </div>
                    </div>
                )}
                <DialogFooter className="mt-auto pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                    <Button type="submit">{editingOrder ? "Update Order" : "Add Order"}</Button>
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
    </>
  )
}

    