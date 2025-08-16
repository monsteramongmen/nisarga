"use client"

import React, { useState, useMemo } from "react"
import { Calendar, User, Search, PlusCircle, AlertTriangle, MoreVertical, Pencil, FileText, View } from "lucide-react"
import { useRouter } from "next/navigation"
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

if (pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
}


import type { Order, Customer, MenuItem, OrderItem } from "@/lib/data"
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
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"


const statusHierarchy: Order["status"][] = ["Pending", "Confirmed", "In Progress", "Completed", "Cancelled"]

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | Order["status"]>("All")
  const [isFormOpen, setFormOpen] = useState(false)
  const [cancellingOrder, setCancellingOrder] = useState<Order | null>(null)
  
  const { toast } = useToast()
  const router = useRouter();


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

  const handleOpenForm = (order: Order | null = null) => {
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
  }

  const handleSaveOrder = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
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
         eventName: formData.get("eventName") as string,
         eventDate: format(new Date(formData.get("eventDate") as string), "yyyy-MM-dd"),
         status: "Pending",
         items: [],
         orderType: 'Individual',
         lastUpdated: new Date().toISOString(),
       }
       setOrders([newOrder, ...orders])
       toast({ title: "Success", description: "New order has been added." })

    handleCloseForm()
  }

  const handleGenerateInvoice = (order: Order) => {
    const customer = initialCustomers.find(c => c.name === order.customerName);
    const items = order.items || [];
    let finalAmount = 0;

    const tableBody: any[] = [];
    
    if (order.orderType === 'Individual') {
        finalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        tableBody.push(['Item', 'Quantity', 'Unit Price', 'Total']);
        items.forEach(item => {
            tableBody.push([
                item.name,
                item.quantity,
                `₹${item.price.toFixed(2)}`,
                `₹${(item.price * item.quantity).toFixed(2)}`,
            ]);
        });
    } else { // Plate based
        finalAmount = (order.perPlatePrice || 0) * (order.numberOfPlates || 0);
        tableBody.push(['Included Menu Items']);
        items.forEach(item => {
            tableBody.push([item.name]);
        });
    }

    const docDefinition: any = {
        content: [
            { text: 'Invoice', style: 'header', alignment: 'center' },
            { text: 'Nisarga Catering Services', style: 'subheader', alignment: 'center', margin: [0, 0, 0, 20] },
            
            {
                columns: [
                    {
                        width: '*',
                        text: [
                            { text: 'Invoice ID: ', bold: true }, `${order.id.replace("ORD", "INV")}\n`,
                            { text: 'Date: ', bold: true }, `${format(new Date(), "PPP")}`,
                        ]
                    },
                    {
                        width: 'auto',
                        text: ''
                    }
                ],
                columnGap: 10,
                margin: [0, 0, 0, 10]
            },
            {
                columns: [
                    {
                        width: '*',
                        text: [
                            { text: 'Customer: ', bold: true }, `${order.customerName}\n`,
                            ...(customer?.phone ? [{ text: 'Phone: ', bold: true }, `${customer.phone}\n`] : []),
                            ...(customer?.email ? [{ text: 'Email: ', bold: true }, `${customer.email}`] : []),
                        ]
                    },
                    {
                        width: '*',
                         alignment: 'right',
                        text: [
                            { text: 'Event: ', bold: true }, `${order.eventName}\n`,
                            { text: 'Event Date: ', bold: true }, `${format(new Date(order.eventDate), "PPP")}`,
                        ]
                    }
                ],
                margin: [0, 0, 0, 20]
            },
            {
                table: {
                    headerRows: 1,
                    widths: order.orderType === 'Individual' ? ['*', 'auto', 'auto', 'auto'] : ['*'],
                    body: tableBody,
                },
                layout: {
                  fillColor: function (rowIndex: number) {
                    return (rowIndex === 0) ? '#337ab7' : null;
                  },
                  hLineWidth: function (i: number, node: any) {
                    return (i === 0 || i === node.table.body.length) ? 2 : 1;
                  },
                  vLineWidth: function (i: number, node: any) {
                    return (i === 0 || i === node.table.widths.length) ? 2 : 1;
                  },
                  hLineColor: function (i: number, node: any) {
                    return (i === 0 || i === node.table.body.length) ? 'black' : 'gray';
                  },
                  vLineColor: function (i: number, node: any) {
                    return (i === 0 || i === node.table.widths.length) ? 'black' : 'gray';
                  },
                  paddingLeft: function(i: number, node: any) { return 5; },
                  paddingRight: function(i: number, node: any) { return 5; },
                  paddingTop: function(i: number, node: any) { return 5; },
                  paddingBottom: function(i: number, node: any) { return 5; },
                }
            },
            ...(order.orderType === 'Plate' ? [
              { text: `Price Per Plate: ₹${(order.perPlatePrice || 0).toFixed(2)}`, margin: [0, 10, 0, 5]},
              { text: `Number of Plates: ${order.numberOfPlates || 0}`, margin: [0, 0, 0, 10]}
            ] : []),
            {
              text: `Total Amount: ₹${finalAmount.toFixed(2)}`,
              style: 'total',
              alignment: 'right',
              margin: [0, 20, 0, 0]
            },
            {
                style: 'tableExample',
                table: {
                    widths: ['*', 'auto'],
                    body: [
                        [
                            {text: 'Order Status', bold: true},
                            {text: order.status, alignment: 'right'}
                        ],
                        [
                            {text: 'Last Updated', bold: true},
                            {text: format(new Date(order.lastUpdated), "PPP p"), alignment: 'right'}
                        ],
                         ...(order.status === 'Cancelled' ? [[
                            {text: 'Cancellation Reason', bold: true},
                            {text: order.cancellationReason || 'N/A', alignment: 'right'}
                        ]] : [])
                    ]
                },
                layout: 'noBorders',
                margin: [0, 20, 0, 0]
            },
            {
              text: 'Thank you for your business!',
              style: 'footer',
              alignment: 'center',
              italics: true,
              margin: [0, 40, 0, 0]
            }
        ],
        styles: {
            header: {
                fontSize: 22,
                bold: true
            },
            subheader: {
                fontSize: 12
            },
            total: {
                fontSize: 14,
                bold: true,
            },
            footer: {
                fontSize: 10
            }
        }
    };

    pdfMake.createPdf(docDefinition).download(`Invoice-${order.id}.pdf`);
  };

  const getStatusClass = (status: Order["status"]) => {
    switch (status) {
      case "Pending": return "bg-yellow-500/20 text-yellow-700 border-yellow-500/30"
      case "Confirmed": return "bg-cyan-500/20 text-cyan-700 border-cyan-500/30"
      case "In Progress": return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "Completed": return "bg-green-500/20 text-green-700 border-green-500/30"
      case "Cancelled": return "bg-red-500/20 text-red-700 border-red-500/30"
    }
  }
  
  const handleCardClick = (orderId: string) => {
    router.push(`/dashboard/orders/${orderId}`);
  };

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
          <Card key={order.id} className="flex flex-col hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleCardClick(order.id)}>
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
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Update Order
                                </DropdownMenuItem>
                                {order.status !== 'Pending' && (
                                   <DropdownMenuItem onClick={() => handleGenerateInvoice(order)}>
                                      <FileText className="mr-2 h-4 w-4" /> Generate Invoice
                                   </DropdownMenuItem>
                                )}
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
        <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Order</DialogTitle>
              <DialogDescription>Enter details for the new order.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveOrder} id="orderForm" className="flex-grow overflow-hidden flex flex-col gap-4">
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
                <DialogFooter className="mt-auto pt-4 border-t">
                    <Button type="button" variant="outline" onClick={handleCloseForm}>Cancel</Button>
                    <Button type="submit" form="orderForm">Add Order</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
