"use client"

import React, { useState, useMemo, useEffect } from "react"
import { Home, Phone, Search, PlusCircle, Pencil, Loader2 } from "lucide-react"
import { getAvatarColor, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { addCustomer, getCustomers, updateCustomer } from "@/services/customerService"
import type { Customer } from "@/lib/data"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const customersData = await getCustomers()
        setCustomers(customersData)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not fetch customers.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCustomers()
  }, [toast])

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, customers])

  const handleOpenDialog = (customer: Customer | null = null) => {
    setEditingCustomer(customer)
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phone = formData.get("phone") as string

    const isPhoneUnique = customers.every(
      (c) => c.phone !== phone || (editingCustomer && c.id === editingCustomer.id)
    )

    if (!isPhoneUnique) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Phone number already exists for another customer.",
      })
      return
    }

    const customerData = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: phone,
      address: formData.get("address") as string,
    }

    try {
      if (editingCustomer) {
        const updatedCustomer = { ...editingCustomer, ...customerData }
        await updateCustomer(updatedCustomer.id, updatedCustomer)
        setCustomers(
          customers.map((c) => (c.id === editingCustomer.id ? updatedCustomer : c))
        )
        toast({ title: "Success", description: "Customer updated." })
      } else {
        const newCustomer = await addCustomer({ ...customerData, totalOrders: 0 })
        setCustomers([newCustomer, ...customers])
        toast({ title: "Success", description: "New customer added." })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save customer.",
      })
    }

    setDialogOpen(false)
    setEditingCustomer(null)
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter by name, address, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button size="sm" onClick={() => handleOpenDialog()} className="ml-4">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                  <Avatar
                    className="w-10 h-10"
                    style={{ backgroundColor: getAvatarColor(customer.name) }}
                  >
                    <AvatarFallback className="text-white bg-transparent">
                      {getInitials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-base">{customer.name}</CardTitle>
               </div>
               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(customer)}>
                  <Pencil className="h-4 w-4" />
               </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
               <div className="flex items-start gap-2">
                <Home className="h-4 w-4 mt-1 shrink-0" />
                <span>{customer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{customer.phone}</span>
              </div>
              <div className="pt-2">
                <Badge variant="outline">
                  {customer.totalOrders}{" "}
                  {customer.totalOrders === 1 ? "Order" : "Orders"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(isOpen) => {
          setDialogOpen(isOpen)
          if (!isOpen) {
              setEditingCustomer(null)
          }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingCustomer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
            <DialogDescription>
              {editingCustomer ? "Update the customer's details." : "Enter the details of the new customer."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={editingCustomer?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={editingCustomer?.email} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">Phone</Label>
                <Input id="phone" name="phone" defaultValue={editingCustomer?.phone} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="address" className="text-right pt-2">Address</Label>
                <Textarea id="address" name="address" defaultValue={editingCustomer?.address} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editingCustomer ? "Save Changes" : "Add Customer"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
