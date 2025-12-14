'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardBody, Button, Skeleton } from '@heroui/react'
import {
    Upload,
    TrendingUp,
    DollarSign,
    ShoppingCart,
    FileSpreadsheet,
    ArrowUpRight,
    Package
} from 'lucide-react'
import Link from 'next/link'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts'

interface DashboardData {
    stats: {
        totalRecords: number
        totalRevenue: number
        totalProfit: number
        totalTax: number
        totalOrders: number
        inventoryCount: number
    }
    recentRecords: {
        id: number
        fileName: string
        date: string
        totalProfit: number
        totalOrders: number
    }[]
}

const COLORS = ['#D4440D', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6']

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [categoryData, setCategoryData] = useState<any[]>([])

    useEffect(() => {
        loadDashboard()
    }, [])

    async function loadDashboard() {
        try {
            const [dashRes, inventoryRes] = await Promise.all([
                fetch('/api/dashboard'),
                fetch('/api/inventory?stats=true')
            ])

            const dashJson = await dashRes.json()
            const invJson = await inventoryRes.json()

            if (dashJson.success) {
                setData(dashJson)
            }

            if (invJson.success && invJson.stats?.byCategory) {
                const catData = Object.entries(invJson.stats.byCategory).map(([name, count]) => ({
                    name: name.split(' ').slice(0, 2).join(' '),
                    value: count as number
                }))
                setCategoryData(catData)
            }
        } catch (err) {
            console.error('Failed to load dashboard:', err)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString('en-IN')}`

    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="bg-neutral-900 border-neutral-800">
                            <CardBody className="p-4">
                                <Skeleton className="w-20 h-4 rounded mb-2" />
                                <Skeleton className="w-32 h-8 rounded" />
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    const stats = data?.stats || {
        totalRecords: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalTax: 0,
        totalOrders: 0,
        inventoryCount: 0
    }

    // Calculate after-tax profit
    const afterTaxProfit = stats.totalProfit - (stats.totalTax || 0)

    const revenueChartData = data?.recentRecords?.map(r => ({
        date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        profit: r.totalProfit,
        orders: r.totalOrders
    })) || []

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
                    <p className="text-neutral-500 mt-1">Overview of your sales performance</p>
                </div>
                <Link href="/upload">
                    <Button
                        className="w-full sm:w-auto bg-gray-800 text-white border border-gray-700 rounded-xl hover:bg-gray-700"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Sales Data
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wide">Revenue</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                                    {formatCurrency(stats.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500/20 rounded-2xl">
                                <DollarSign className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wide">Profit</p>
                                <p className="text-xl md:text-2xl font-bold text-green-400 mt-1">
                                    {formatCurrency(afterTaxProfit)}
                                </p>
                                <p className="text-sm text-gray-500 mt-0.5">After Tax</p>
                            </div>
                            <div className="p-3 bg-green-500/20 rounded-2xl">
                                <TrendingUp className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wide">Orders</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                                    {stats.totalOrders}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500/20 rounded-2xl">
                                <ShoppingCart className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wide">Inventory</p>
                                <p className="text-xl md:text-2xl font-bold text-white mt-1">
                                    {stats.inventoryCount} items
                                </p>
                            </div>
                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                <Package className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardHeader className="px-6 pt-6 pb-0">
                        <h3 className="text-lg font-semibold text-white">Profit Trend</h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        {revenueChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                    <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Profit']}
                                    />
                                    <Bar dataKey="profit" fill="#D4440D" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-neutral-500">
                                <div className="text-center">
                                    <FileSpreadsheet className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                                    <p>No data yet. Upload sales to see trends.</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Category Distribution */}
                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardHeader className="px-6 pt-6 pb-0">
                        <h3 className="text-lg font-semibold text-white">Inventory by Category</h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    />
                                    <Legend
                                        formatter={(value) => <span className="text-neutral-300 text-sm">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[250px] flex items-center justify-center text-neutral-500">
                                <div className="text-center">
                                    <Package className="w-12 h-12 mx-auto mb-3 text-neutral-700" />
                                    <p>Inventory categories will appear here.</p>
                                </div>
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <CardHeader className="px-6 pt-6 pb-0">
                    <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link href="/upload" className="block">
                            <div className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-red-500/20 rounded-2xl">
                                        <Upload className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Upload Data</p>
                                        <p className="text-sm text-gray-400">Import daily Excel</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/inventory" className="block">
                            <div className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-purple-500/20 rounded-2xl">
                                        <Package className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Inventory</p>
                                        <p className="text-sm text-gray-400">Manage cost prices</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/reports" className="block">
                            <div className="p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-green-500/20 rounded-2xl">
                                        <FileSpreadsheet className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Reports</p>
                                        <p className="text-sm text-gray-400">View profit analysis</p>
                                    </div>
                                    <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </CardBody>
            </Card>

            {/* Recent Records */}
            {data?.recentRecords && data.recentRecords.length > 0 && (
                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardHeader className="px-6 pt-6 pb-0">
                        <h3 className="text-lg font-semibold text-white">Recent Uploads</h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        <div className="space-y-3">
                            {data.recentRecords.slice(0, 5).map((record) => (
                                <Link key={record.id} href={`/reports?id=${record.id}`}>
                                    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-red-400" />
                                            <div>
                                                <p className="font-medium text-white text-sm">{record.fileName}</p>
                                                <p className="text-sm text-gray-400">
                                                    {new Date(record.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-green-400">{formatCurrency(record.totalProfit)}</p>
                                            <p className="text-sm text-gray-400">{record.totalOrders} orders</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            )}
        </div>
    )
}
