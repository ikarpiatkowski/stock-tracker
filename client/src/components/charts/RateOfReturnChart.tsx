"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  sp500: {
    label: "S&P 500",
    color: "hsl(var(--chart-1))",
  },
  nasdaq: {
    label: "NASDAQ 100",
    color: "hsl(var(--chart-2))",
  },
  wig: {
    label: "WIG",
    color: "hsl(var(--chart-3))",
  },
  wig20: {
    label: "WIG20",
    color: "hsl(var(--chart-4))",
  },
  mwig40: {
    label: "mWIG40",
    color: "hsl(var(--chart-5))",
  },
  swig80: {
    label: "sWIG80",
    color: "#8855DD",
  },
} satisfies ChartConfig;

const chartData = [
  {
    month: "January",
    sp500: 15.2,
    nasdaq: 18.5,
    wig: 12.3,
    wig20: 8.7,
    mwig40: 10.5,
    swig80: 13.8,
  },
  {
    month: "February",
    sp500: 22.4,
    nasdaq: 25.8,
    wig: 15.6,
    wig20: 12.4,
    mwig40: 14.2,
    swig80: 16.9,
  },
  {
    month: "March",
    sp500: 18.7,
    nasdaq: 20.3,
    wig: -5.4,
    wig20: -8.2,
    mwig40: -3.1,
    swig80: -1.5,
  },
  {
    month: "April",
    sp500: 25.6,
    nasdaq: 28.9,
    wig: 8.9,
    wig20: 5.6,
    mwig40: 9.8,
    swig80: 11.2,
  },
  {
    month: "May",
    sp500: 28.4,
    nasdaq: 30.1,
    wig: 14.5,
    wig20: 10.8,
    mwig40: 15.6,
    swig80: 17.8,
  },
  {
    month: "June",
    sp500: 24.8,
    nasdaq: 26.5,
    wig: 11.2,
    wig20: 7.5,
    mwig40: 12.4,
    swig80: 14.6,
  },
];

export function RateOfReturnChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Indices Performance</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{ left: 12, right: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}%`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="sp500"
              type="monotone"
              stroke={chartConfig.sp500.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="nasdaq"
              type="monotone"
              stroke={chartConfig.nasdaq.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="wig"
              type="monotone"
              stroke={chartConfig.wig.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="wig20"
              type="monotone"
              stroke={chartConfig.wig20.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="mwig40"
              type="monotone"
              stroke={chartConfig.mwig40.color}
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="swig80"
              type="monotone"
              stroke={chartConfig.swig80.color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex flex-wrap gap-4 text-sm">
          {Object.entries(chartConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              <span>{config.label}</span>
            </div>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}
