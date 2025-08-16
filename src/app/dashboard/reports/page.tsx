"use client"

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
} from "recharts"

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

const revenueData = [
  { month: "Jan", revenue: 4000 },
  { month: "Feb", revenue: 3000 },
  { month: "Mar", revenue: 5000 },
  { month: "Apr", revenue: 4500 },
  { month: "May", revenue: 6000 },
  { month: "Jun", revenue: 5500 },
  { month: "Jul", revenue: 7000 },
]

const ordersData = [
  { month: "Jan", orders: 240 },
  { month: "Feb", orders: 189 },
  { month: "Mar", orders: 320 },
  { month: "Apr", orders: 280 },
  { month: "May", orders: 400 },
  { month: "Jun", orders: 350 },
  { month: "Jul", orders: 450 },
]

export default function ReportsPage() {
  return (
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={{}} className="h-[350px] w-full">
            <BarChart accessibilityLayer data={revenueData}>
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
                tickFormatter={(value) => `$${value / 1000}K`}
              />
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
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
          <ChartContainer config={{}} className="h-[350px] w-full">
            <LineChart
              accessibilityLayer
              data={ordersData}
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
