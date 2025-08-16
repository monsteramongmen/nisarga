"use client"

import { useState, useEffect } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts"
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { Timestamp } from "firebase/firestore";

import { getOrders } from "@/services/orderService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Loader2 } from "lucide-react";


export default function ReportsPage() {
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const orders = await getOrders();
        
        const completedOrders = orders.filter(o => o.status === 'Completed');

        const sixMonthsAgo = subMonths(new Date(), 5);
        const today = new Date();
        const interval = { start: startOfMonth(sixMonthsAgo), end: endOfMonth(today) };
        const months = eachMonthOfInterval(interval);

        const data = months.map(monthStart => {
            const monthEnd = endOfMonth(monthStart);
            
            const monthlyRevenue = completedOrders
                .filter(order => {
                    const completedDate = order.lastUpdated instanceof Timestamp ? order.lastUpdated.toDate() : new Date(order.lastUpdated);
                    return completedDate >= monthStart && completedDate <= monthEnd;
                })
                .reduce((acc, order) => {
                    if (order.orderType === 'Individual') {
                        return acc + (order.items?.reduce((itemAcc, item) => itemAcc + item.price * item.quantity, 0) || 0);
                    } else {
                        return acc + (order.perPlatePrice || 0) * (order.numberOfPlates || 0);
                    }
                }, 0);

            const monthlyOrders = completedOrders.filter(order => {
                const completedDate = order.lastUpdated instanceof Timestamp ? order.lastUpdated.toDate() : new Date(order.lastUpdated);
                return completedDate >= monthStart && completedDate <= monthEnd;
            }).length;

            return {
                month: format(monthStart, 'MMM'),
                revenue: monthlyRevenue,
                orders: monthlyOrders
            };
        });
        
        setChartData(data);
      } catch (error) {
        console.error("Failed to fetch report data:", error)
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] sm:h-[350px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis 
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => `₹${Number(value) / 1000}k`}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" formatter={(value) => `₹${Number(value).toLocaleString()}`} />}
              />
              <Bar
                dataKey="revenue"
                fill="hsl(var(--primary))"
                radius={8}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Order Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[300px] sm:h-[350px] w-full">
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 12,
                right: 12,
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
               <YAxis 
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                dataKey="orders"
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
  )
}
