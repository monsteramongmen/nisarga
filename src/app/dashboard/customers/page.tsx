"use client"

import React, { useState, useMemo } from "react"
import { Home, Phone, Search } from "lucide-react"
import { customers as initialCustomers, Customer } from "@/lib/data"
import { getAvatarColor, getInitials } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return initialCustomers

    return initialCustomers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.address.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  return (
    <div>
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Filter by name, address, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar
                className="w-10 h-10"
                style={{ backgroundColor: getAvatarColor(customer.name) }}
              >
                <AvatarFallback className="text-white bg-transparent">
                  {getInitials(customer.name)}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">{customer.name}</CardTitle>
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
    </div>
  )
}
