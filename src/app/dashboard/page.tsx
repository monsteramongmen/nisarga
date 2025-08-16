"use client"

import { useEffect, useState } from "react"
import {
  Calendar,
  DollarSign,
  Package,
  Users,
  Loader2,
} from "lucide-react"
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import { format, subDays, startOfDay } from 'date-fns';
import { Timestamp } from "firebase/firestore";

import type { Order } from "@/lib/data"
import { getOrders } from "@/services/orderService"
import { getCustomers } from "@/services/customerService"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrdersToday: 0,
    totalCustomers: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  })
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [orders, customers] = await Promise.all([getOrders(), getCustomers()])
        
        const today = startOfDay(new Date());
        
        const totalOrdersToday = orders.filter(order => {
            const orderDate = order.createdAt instanceof Timestamp ? order.createdAt.toDate() : new Date(order.createdAt);
            return startOfDay(orderDate).getTime() === today.getTime() && order.status !== 'Cancelled';
        }).length;

        const totalCustomers = customers.length;
        
        const totalRevenue = orders
          .filter(order => order.status === 'Completed')
          .reduce((acc, order) => {
            if (order.orderType === 'Individual') {
                return acc + (order.items?.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0) || 0);
            } else {
                return acc + (order.perPlatePrice || 0) * (order.numberOfPlates || 0);
            }
        }, 0);

        const upcomingEvents = orders.filter(order => {
          const eventDate = typeof order.eventDate === 'string' ? new Date(order.eventDate) : order.eventDate.toDate();
          return eventDate > new Date() && (order.status === 'Pending' || order.status === 'Confirmed' || order.status === 'In Progress');
        }).length;
        
        setStats({ totalOrdersToday, totalCustomers, totalRevenue, upcomingEvents });
        
        // --- Process revenue for the last 7 days ---
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(today, i)).reverse();
        
        const dailyRevenue = last7Days.map(day => {
          const revenue = orders
            .filter(order => {
              if (order.status !== 'Completed') return false;
              const completedDate = typeof order.lastUpdated === 'string' ? new Date(order.lastUpdated) : order.lastUpdated.toDate();
              return startOfDay(completedDate).getTime() === startOfDay(day).getTime();
            })
            .reduce((acc, order) => {
               if (order.orderType === 'Individual') {
                   return acc + (order.items?.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0) || 0);
               } else {
                   return acc + (order.perPlatePrice || 0) * (order.numberOfPlates || 0);
               }
            }, 0);
            
          return {
            date: format(day, 'MMM d'),
            revenue: revenue / 1000, // For display in K
          };
        });

        setRevenueData(dailyRevenue);
        
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])
  
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Today</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrdersToday}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Revenue - Last 7 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px] sm:h-[350px] w-full">
               <LineChart
                data={revenueData}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                   tickLine={false}
                   axisLine={false}
                   tickMargin={8}
                   tickFormatter={(value) => `₹${value}k`}
                />
                <Tooltip cursor={false} content={<ChartTooltipContent indicator="dot" formatter={(value) => `₹${Number(value).toFixed(2)}k`} />} />
                <Line
                  dataKey="revenue"
                  type="natural"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
