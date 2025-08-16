"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Calendar, User, Search, PlusCircle, AlertTriangle, MoreVertical, Pencil, Trash2, ShoppingCart, Download, FileText, ArrowLeft } from "lucide-react"
import { useParams, useRouter } from 'next/navigation'
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

if (pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}


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
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const statusHierarchy: Order["status"][] = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"]

export default function OrderDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params

  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [order, setOrder] = useState<Order | null>(null)
  
  const [isCancelDialogOpen, setCancelDialogOpen] = useState(false)
  
  const [tempItems, setTempItems] = useState<OrderItem[]>([])
  const [tempOrderType, setTempOrderType] = useState<Order['orderType']>('Individual');
  const [tempPerPlatePrice, setTempPerPlatePrice] = useState<number>(0);
  const [tempNumberOfPlates, setTempNumberOfPlates] = useState<number>(1);

  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState<'All' | 'Veg' | 'Non-Veg'>('All');

  const { toast } = useToast()
  
  useEffect(() => {
    if (id) {
        const foundOrder = orders.find(o => o.id === id);
        if (foundOrder) {
            setOrder(foundOrder);
            setTempItems(foundOrder.items || []);
            setTempOrderType(foundOrder.orderType || 'Individual');
            setTempPerPlatePrice(foundOrder.perPlatePrice || 0);
            setTempNumberOfPlates(foundOrder.numberOfPlates || 1);
        } else {
            toast({ variant: "destructive", title: "Error", description: "Order not found."})
            router.push('/dashboard/orders');
        }
    }
  }, [id, orders, router, toast]);


  const orderSummary = useMemo(() => {
    const totalItems = tempItems.length
    const totalQuantity = tempItems.reduce((sum, item) => sum + item.quantity, 0)
    
    let totalAmount = 0;
    if (tempOrderType === 'Individual') {
      totalAmount = tempItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    } else {
      totalAmount = (tempPerPlatePrice || 0) * (tempNumberOfPlates || 0);
    }
    
    return { totalItems, totalAmount, totalQuantity }
  }, [tempItems, tempOrderType, tempPerPlatePrice, tempNumberOfPlates])

  const filteredMenuItems = useMemo(() => {
    const selectedItemIds = new Set(tempItems.map(item => item.menuItemId));
    return menuItems
      .filter(item => !selectedItemIds.has(item.id))
      .filter(item => menuCategory === 'All' || item.category === menuCategory)
      .filter(item => item.name.toLowerCase().includes(menuSearch.toLowerCase()));
  }, [menuSearch, menuCategory, tempItems]);


  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!order) return;

    const formData = new FormData(e.currentTarget)
    
    const updatedOrder: Order = {
        ...order,
        eventName: formData.get("eventName") as string,
        eventDate: format(new Date(formData.get("eventDate") as string), "yyyy-MM-dd"),
        status: formData.get("status") as Order["status"],
        orderType: tempOrderType,
        items: tempItems,
        perPlatePrice: tempOrderType === 'Plate' ? tempPerPlatePrice : undefined,
        numberOfPlates: tempOrderType === 'Plate' ? tempNumberOfPlates : undefined,
        lastUpdated: new Date().toISOString(),
    }
    if (updatedOrder.status === "Cancelled" && updatedOrder.status !== order.status) {
        setCancelDialogOpen(true)
        return
    }
    
    const newOrders = orders.map(o => o.id === order.id ? updatedOrder : o)
    setOrders(newOrders)
    // In a real app, you'd persist this change to your backend.
    // For this prototype, we can update localStorage or just rely on state.
    setOrder(updatedOrder); 
    toast({ title: "Success", description: "Order updated successfully." })
  }
  
  const handleConfirmCancel = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!order) return

    const formData = new FormData(e.currentTarget)
    const reason = formData.get("reason") as string

    const updatedOrder = { ...order, status: "Cancelled" as const, cancellationReason: reason, lastUpdated: new Date().toISOString() };
    
    setOrders(
      orders.map((o) =>
        o.id === order.id
          ? updatedOrder
          : o
      )
    )
    setOrder(updatedOrder);
    toast({ title: "Order Cancelled", description: `Order #${order.id} has been cancelled.` })
    setCancelDialogOpen(false)
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

  if (!order) {
    return (
        <div className="flex h-full w-full items-center justify-center">
             <Pencil className="h-8 w-8 animate-spin text-primary" />
        </div>
    )
  }


  return (
    <>
        <div className="mb-4">
            <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
            </Button>
        </div>
        <Card>
            <CardHeader>
              <CardTitle>{`Update Order #${order.id}`}</CardTitle>
              <CardDescription>Update details for this order.</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleSaveOrder} id="orderForm" className="flex-grow overflow-hidden flex flex-col gap-4">
                <Tabs defaultValue="details" className="flex-grow flex flex-col overflow-hidden">
                    <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="add_items">Add Items</TabsTrigger>
                        <TabsTrigger value="summary">
                            Summary <Badge variant="secondary" className="ml-2">{orderSummary.totalItems}</Badge>
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="details" className="flex-grow overflow-y-auto pt-6">
                       <div className="space-y-4 pr-4 max-w-lg mx-auto">
                        <div className="grid gap-2">
                            <Label htmlFor="eventName">Event Name</Label>
                            <Input id="eventName" name="eventName" defaultValue={order?.eventName} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="customer">Customer</Label>
                            <Input id="customer" name="customer" value={order?.customerName} disabled />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="eventDate">Event Date</Label>
                            <Input type="date" id="eventDate" name="eventDate" defaultValue={order?.eventDate} required/>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Order Status</Label>
                            <Select name="status" defaultValue={order.status}>
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
                         <div className="grid gap-2">
                            <Label>Order Type</Label>
                            <RadioGroup value={tempOrderType} onValueChange={(v: Order['orderType']) => setTempOrderType(v)} className="flex gap-4">
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Individual" id="individual" />
                                <Label htmlFor="individual">Individual Items</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="Plate" id="plate" />
                                <Label htmlFor="plate">Plate Based</Label>
                              </div>
                            </RadioGroup>
                         </div>
                       </div>
                    </TabsContent>
                    <TabsContent value="add_items" className="flex-grow flex flex-col overflow-hidden pt-6">
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
                    <TabsContent value="summary" className="flex-grow flex flex-col overflow-hidden pt-6">
                        <div className="flex-grow overflow-y-auto">
                            <ScrollArea className="h-full pr-4 -mr-4">
                            <div className="space-y-2">
                                {tempItems.length > 0 ? tempItems.map(item => (
                                <div key={item.menuItemId} className="flex justify-between items-center bg-muted p-2 rounded-md">
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        {tempOrderType === 'Individual' && <p className="text-sm text-muted-foreground">@ ₹{item.price.toFixed(2)}</p>}
                                    </div>
                                    {tempOrderType === 'Individual' ? (
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
                                     ) : (
                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleItemQuantityChange(item.menuItemId, 0)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                    {tempOrderType === 'Individual' && (
                                        <div className="w-24 text-right font-semibold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                        </div>
                                    )}
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
                            {tempOrderType === 'Plate' && (
                              <div className="flex items-center gap-4">
                                  <div className="grid gap-1.5 flex-1">
                                      <Label htmlFor="perPlatePrice">Price Per Plate (₹)</Label>
                                      <Input id="perPlatePrice" type="number" value={tempPerPlatePrice} onChange={(e) => setTempPerPlatePrice(Number(e.target.value))} />
                                  </div>
                                  <div className="grid gap-1.5 flex-1">
                                      <Label htmlFor="numberOfPlates">Number of Plates</Label>
                                      <Input id="numberOfPlates" type="number" value={tempNumberOfPlates} onChange={(e) => setTempNumberOfPlates(Number(e.target.value))} />
                                  </div>
                              </div>
                            )}
                            <div className="flex justify-between text-lg font-bold">
                                <span>Final Amount</span>
                                <span>₹{orderSummary.totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Total Items</span>
                                <span>{orderSummary.totalItems}</span>
                            </div>
                            {tempOrderType === 'Individual' && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Total Quantity</span>
                                <span>{orderSummary.totalQuantity}</span>
                            </div>
                            )}
                        </div>
                        )}
                    </TabsContent>
                </Tabs>
                <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" form="orderForm">Update Order</Button>
                </div>
            </form>
            </CardContent>
        </Card>
      
      <Dialog open={isCancelDialogOpen} onOpenChange={(isOpen) => {
          if (!isOpen) setCancelDialogOpen(false)
          setCancelDialogOpen(isOpen)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling order #{order?.id}.
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
