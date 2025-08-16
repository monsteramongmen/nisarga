"use client"

import React, { useState, useMemo } from "react"
import { Calendar, User, Search, PlusCircle, MoreVertical, Pencil, ShoppingCart, Download } from "lucide-react"
import jsPDF from 'jspdf';
import 'jspdf-autotable';


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
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"


type Quotation = Omit<Order, 'status'> & {
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
};

const statusHierarchy: Quotation["status"][] = ["Draft", "Sent", "Accepted", "Declined"]

// Mock data for quotations, can be replaced with API calls
const initialQuotations: Quotation[] = [
    { id: "QUO001", customerName: "Ethan Davis", eventName: "Summer BBQ", eventDate: "2024-09-10", status: "Draft", items: [
        { menuItemId: 'MENU01', name: 'Caprese Skewers', price: 625.50, quantity: 10 },
        { menuItemId: 'MENU02', name: 'Chicken Satay', price: 830.00, quantity: 15 },
    ], orderType: 'Individual'},
    { id: "QUO002", customerName: "Fiona Garcia", eventName: "Product Launch", eventDate: "2024-09-20", status: "Sent", items: [], orderType: 'Individual'},
];

// This is needed to extend the jsPDF interface for the autoTable plugin
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}


export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"All" | Quotation["status"]>("All")
  const [isFormOpen, setFormOpen] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null)
  
  const [tempItems, setTempItems] = useState<OrderItem[]>([])
  const [tempOrderType, setTempOrderType] = useState<Quotation['orderType']>('Individual');
  const [tempPerPlatePrice, setTempPerPlatePrice] = useState<number>(0);
  const [tempNumberOfPlates, setTempNumberOfPlates] = useState<number>(1);

  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState<'All' | 'Veg' | 'Non-Veg'>('All');


  const { toast } = useToast()

  const filteredQuotations = useMemo(() => {
    let items = quotations

    if (statusFilter !== "All") {
      items = items.filter((quotation) => quotation.status === statusFilter)
    }

    if (searchTerm) {
      items = items.filter(quotation =>
        quotation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quotation.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return items.sort((a, b) => statusHierarchy.indexOf(a.status) - statusHierarchy.indexOf(b.status));
  }, [quotations, searchTerm, statusFilter])

  const quotationSummary = useMemo(() => {
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


  const handleOpenForm = (quotation: Quotation | null = null) => {
    setEditingQuotation(quotation)
    if (quotation) {
      setTempItems(quotation.items || [])
      setTempOrderType(quotation.orderType || 'Individual');
      setTempPerPlatePrice(quotation.perPlatePrice || 0);
      setTempNumberOfPlates(quotation.numberOfPlates || 1);
    } else {
      setTempItems([])
      setTempOrderType('Individual');
      setTempPerPlatePrice(0);
      setTempNumberOfPlates(1);
    }
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setEditingQuotation(null)
    setTempItems([])
    setTempOrderType('Individual');
    setTempPerPlatePrice(0);
    setTempNumberOfPlates(1);
    setFormOpen(false)
  }

  const handleSaveQuotation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    if (editingQuotation) {
      const updatedQuotation: Quotation = {
        ...editingQuotation,
        eventName: formData.get("eventName") as string,
        eventDate: format(new Date(formData.get("eventDate") as string), "yyyy-MM-dd"),
        status: formData.get("status") as Quotation["status"],
        orderType: tempOrderType,
        items: tempItems,
        perPlatePrice: tempOrderType === 'Plate' ? tempPerPlatePrice : undefined,
        numberOfPlates: tempOrderType === 'Plate' ? tempNumberOfPlates : undefined,
      }
       
      setQuotations(quotations.map(o => o.id === editingQuotation.id ? updatedQuotation : o))
      toast({ title: "Success", description: "Quotation updated successfully." })
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
       const newQuotation: Quotation = {
         id: `QUO${Date.now()}`,
         customerName: customer!.name,
         eventName: formData.get("eventName") as string,
         eventDate: format(new Date(formData.get("eventDate") as string), "yyyy-MM-dd"),
         status: "Draft",
         items: [],
         orderType: 'Individual',
       }
       setQuotations([newQuotation, ...quotations])
       toast({ title: "Success", description: "New quotation has been added." })
    }

    handleCloseForm()
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

  const handleDownloadPdf = (quotation: Quotation) => {
    const doc = new jsPDF();
    const customer = initialCustomers.find(c => c.name === quotation.customerName);
    
    // Header
    doc.setFontSize(22);
    doc.text("Quotation", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text("Nisarga Catering Services", 105, 28, { align: 'center' });


    // Quotation Details
    doc.setFontSize(10);
    doc.text(`Quotation ID: ${quotation.id}`, 14, 40);
    doc.text(`Date: ${format(new Date(), "PPP")}`, 14, 45);
    
    // Customer and Event Details
    doc.text(`Customer: ${quotation.customerName}`, 14, 55);
    if(customer?.phone) doc.text(`Phone: ${customer.phone}`, 14, 60);
    if(customer?.email) doc.text(`Email: ${customer.email}`, 14, 65);
    
    doc.text(`Event: ${quotation.eventName}`, 140, 55);
    doc.text(`Event Date: ${format(new Date(quotation.eventDate), "PPP")}`, 140, 60);

    const items = quotation.items || [];
    let finalAmount = 0;
    let tableBody: (string | number)[][] = [];

    if (quotation.orderType === 'Individual') {
        finalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        tableBody = items.map(item => [
            item.name,
            item.quantity,
            `₹${item.price.toFixed(2)}`,
            `₹${(item.price * item.quantity).toFixed(2)}`,
        ]);
        doc.autoTable({
            startY: 75,
            head: [['Item', 'Quantity', 'Unit Price', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [33, 150, 243] },
        });
    } else { // Plate based
        finalAmount = (quotation.perPlatePrice || 0) * (quotation.numberOfPlates || 0);
        tableBody = items.map(item => [item.name]);
        doc.autoTable({
            startY: 75,
            head: [['Included Menu Items']],
            body: tableBody,
            theme: 'striped',
            headStyles: { fillColor: [33, 150, 243] },
        });
        
        const plateInfoStartY = doc.autoTable.previous.finalY + 10;
        doc.setFontSize(12);
        doc.text(`Price Per Plate: ₹${(quotation.perPlatePrice || 0).toFixed(2)}`, 14, plateInfoStartY);
        doc.text(`Number of Plates: ${quotation.numberOfPlates || 0}`, 14, plateInfoStartY + 7);
    }
    
    // Total Amount
    const finalY = doc.autoTable.previous.finalY || 75;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount: ₹${finalAmount.toFixed(2)}`, 14, finalY + 15);

    // Footer
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text("Thank you for your business!", 105, doc.internal.pageSize.height - 15, { align: 'center' });

    doc.save(`Quotation-${quotation.id}.pdf`);
  };

  const getStatusClass = (status: Quotation["status"]) => {
    switch (status) {
      case "Draft": return "bg-gray-500/20 text-gray-700 border-gray-500/30"
      case "Sent": return "bg-blue-500/20 text-blue-700 border-blue-500/30"
      case "Accepted": return "bg-green-500/20 text-green-700 border-green-500/30"
      case "Declined": return "bg-red-500/20 text-red-700 border-red-500/30"
    }
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter by Quotation ID, Customer, or Event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(value: "All" | Quotation["status"]) => setStatusFilter(value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Declined">Declined</SelectItem>
                </SelectContent>
            </Select>
            <Button size="sm" onClick={() => handleOpenForm()} className="whitespace-nowrap">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Quotation
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotations.map((quotation) => (
          <Card key={quotation.id} className="flex flex-col">
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                      <CardTitle>{quotation.eventName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 pt-1">
                          <User className="h-4 w-4" /> {quotation.customerName}
                      </CardDescription>
                  </div>
                   <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenForm(quotation)}>
                                    <Pencil className="mr-2 h-4 w-4" /> Update Quotation
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDownloadPdf(quotation)}>
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
               <p className="text-sm text-muted-foreground font-semibold pb-2">Quotation #{quotation.id}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Event on {format(new Date(quotation.eventDate), "PPP")}</span>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
               <Badge className={`${getStatusClass(quotation.status)}`} variant="outline">
                  {quotation.status}
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
              <DialogTitle>{editingQuotation ? `Update Quotation #${editingQuotation.id}` : 'Add New Quotation'}</DialogTitle>
              <DialogDescription>{editingQuotation ? 'Update details for this quotation.' : 'Enter details for the new quotation.'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveQuotation} id="quotationForm" className="flex-grow overflow-hidden flex flex-col gap-4">
                {editingQuotation ? (
                    <Tabs defaultValue="details" className="flex-grow flex flex-col overflow-hidden">
                        <TabsList className="w-full grid grid-cols-3">
                            <TabsTrigger value="details">Details</TabsTrigger>
                            <TabsTrigger value="add_items">Add Items</TabsTrigger>
                            <TabsTrigger value="summary">
                                Summary <Badge variant="secondary" className="ml-2">{quotationSummary.totalItems}</Badge>
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="details" className="flex-grow overflow-y-auto pt-4">
                           <div className="space-y-4 pr-4">
                            <div className="grid gap-2">
                                <Label htmlFor="eventName">Event Name</Label>
                                <Input id="eventName" name="eventName" defaultValue={editingQuotation?.eventName} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="customer">Customer</Label>
                                <Input id="customer" name="customer" value={editingQuotation?.customerName} disabled />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="eventDate">Event Date</Label>
                                <Input type="date" id="eventDate" name="eventDate" defaultValue={editingQuotation?.eventDate} required/>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Quotation Status</Label>
                                <Select name="status" defaultValue={editingQuotation.status}>
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
                                <Label>Quotation Type</Label>
                                <RadioGroup defaultValue={tempOrderType} onValueChange={(v: Quotation['orderType']) => setTempOrderType(v)} className="flex gap-4">
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
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                        </div>
                                         ) : (
                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleItemQuantityChange(item.menuItemId, 0)}>
                                                <Pencil className="h-4 w-4" />
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
                                    <span>₹{quotationSummary.totalAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Total Items</span>
                                    <span>{quotationSummary.totalItems}</span>
                                </div>
                                {tempOrderType === 'Individual' && (
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Total Quantity</span>
                                    <span>{quotationSummary.totalQuantity}</span>
                                </div>
                                )}
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
                    <Button type="submit" form="quotationForm">{editingQuotation ? "Update Quotation" : "Add Quotation"}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
