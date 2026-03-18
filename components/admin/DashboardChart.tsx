'use client';

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts" // 1. Added YAxis import

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "../ui/chart"


const dataSets = {
    "30d": [
        { label: "Week 1", vendors: 40 },
        { label: "Week 2", vendors: 80 },
        { label: "Week 3", vendors: 45 },
        { label: "Week 4", vendors: 110 },
    ],
    "6m": [
        { label: "January", vendors: 186 },
        { label: "February", vendors: 305 },
        { label: "March", vendors: 237 },
        { label: "April", vendors: 73 },
        { label: "May", vendors: 209 },
        { label: "June", vendors: 214 },
    ],
    "1y": [
        { label: "2024", vendors: 450 },
        { label: "2025", vendors: 890 },
    ]
}

const chartConfig = {
    vendors: {
        label: "Vendors",
        color: "var(--chart-3)",
    },
} satisfies ChartConfig

export function DashboardChart() {
    const [timeframe, setTimeframe] = React.useState<keyof typeof dataSets>("6m")
    const currentData = dataSets[timeframe]

    return (
        <Card className="border-2 border-gray-300 lg:w-[60%] md:w-[60%] h-115  ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 ">
                <div className="space-y-1.5">
                    <CardTitle>Vendor Growth</CardTitle>
                </div>

                <div className="relative">
                    <select
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value as keyof typeof dataSets)}
                        className="appearance-none bg-transparent border border-gray-200 rounded-md px-3 py-1 align-middle
                        pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                        <option value="30d">Last 30 days</option>
                        <option value="6m">Last 6 months</option>
                        <option value="1y">Last 1 year</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-gray-500" />
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig} className="h-92 w-full">
                    <LineChart
                        data={currentData}
                        margin={{ left: 0, right: 20, top: 10, bottom: 10 }} // Adjusted margins
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.5} />

                        {/* 2. ADDED Y-AXIS (The Side Bar) */}
                        <YAxis
                            tickLine={true}
                            axisLine={true}
                            tickMargin={8}
                            fontSize={12}
                            tickFormatter={(value) => `${value}`} // You can add units like `$${value}`
                        />

                        <XAxis
                            dataKey="label"
                            tickLine={true}
                            axisLine={true}
                            tickMargin={12}
                            padding={{ left: 20, right: 20 }} // 3. ADDED PADDING to prevent Jan from clipping
                            fontSize={12}
                        />

                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />

                        <Line
                            dataKey="vendors"
                            type="monotone"
                            stroke="var(--color-vendors)"
                            strokeWidth={2}
                            dot={{ fill: "var(--color-vendors)", r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}