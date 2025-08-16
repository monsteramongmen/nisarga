import { Mail, Phone } from "lucide-react"
import { customers } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function CustomersPage() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardHeader className="flex flex-col items-center text-center">
            <Avatar className="w-20 h-20 mb-4">
              <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-lg">{customer.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-2 text-sm text-muted-foreground">
             <div className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4" />
              <span>{customer.phone}</span>
            </div>
            <div className="pt-2">
              <Badge variant="outline">
                {customer.totalOrders} {customer.totalOrders === 1 ? 'Order' : 'Orders'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
