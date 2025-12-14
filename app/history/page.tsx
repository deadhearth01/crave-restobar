'use client'

import { useEffect, useState } from 'react'
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Skeleton
} from '@heroui/react'
import {
    Calendar,
    Eye,
    Trash2,
    TrendingUp,
    DollarSign,
    FileSpreadsheet,
    ShoppingCart
} from 'lucide-react'
import Link from 'next/link'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts'

interface SalesRecord {
    id: number
    fileName: string
    date: string
    totalRevenue: number
    totalCost: number
    totalProfit: number
    totalTax: number
    totalOrders: number
    netMargin: number
}

export default function HistoryPage() {
    const [records, setRecords] = useState<SalesRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalProfit: 0,
        totalTax: 0,
        avgMargin: 0,
        totalRecords: 0
    })

    useEffect(() => {
        loadHistory()
    }, [])

    async function loadHistory() {
        try {
            const res = await fetch('/api/sales')
            const data = await res.json()

            if (data.success) {
                setRecords(data.records)

                // Calculate aggregate stats
                const totalRevenue = data.records.reduce((s: number, r: SalesRecord) => s + r.totalRevenue, 0)
                const totalProfit = data.records.reduce((s: number, r: SalesRecord) => s + r.totalProfit, 0)
                const totalTax = data.records.reduce((s: number, r: SalesRecord) => s + (r.totalTax || 0), 0)
                const netProfit = totalProfit - totalTax
                const avgMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

                setStats({
                    totalRevenue,
                    totalProfit: netProfit, // Store after-tax profit
                    totalTax,
                    avgMargin,
                    totalRecords: data.records.length
                })
            }
        } catch (err) {
            console.error('Failed to load history:', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this record?')) return

        try {
            await fetch(`/api/sales/${id}`, { method: 'DELETE' })
            loadHistory()
        } catch (err) {
            console.error('Failed to delete record:', err)
        }
    }

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const chartData = (records || []).slice().reverse().map(r => ({
        date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        profit: r.totalProfit,
        revenue: r.totalRevenue
    }))

    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="bg-neutral-900 border-neutral-800">
                            <CardBody className="p-6">
                                <Skeleton className="w-24 h-4 rounded mb-2" />
                                <Skeleton className="w-32 h-8 rounded" />
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Sales History</h1>
                <p className="text-neutral-500 mt-1">Track daily sales and analyze historical performance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card 
                    className="bg-neutral-900 border-neutral-800"
                    style={{ backgroundColor: '#171717', borderColor: '#262626', borderWidth: 1, borderRadius: 12 }}
                >
                    <CardBody className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(212, 68, 13, 0.2)' }}>
                                <DollarSign className="w-6 h-6" style={{ color: '#D4440D' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#737373' }}>Total Revenue</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{formatCurrency(stats.totalRevenue)}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card 
                    className="bg-neutral-900 border-neutral-800"
                    style={{ backgroundColor: '#171717', borderColor: '#22c55e', borderWidth: 2, borderRadius: 12 }}
                >
                    <CardBody className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                                <TrendingUp className="w-6 h-6" style={{ color: '#22c55e' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#22c55e', fontWeight: 600 }}>Net Profit (After Tax)</p>
                                <p className="text-2xl font-bold" style={{ color: '#22c55e' }}>{formatCurrency(stats.totalProfit)}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card 
                    className="bg-neutral-900 border-neutral-800"
                    style={{ backgroundColor: '#171717', borderColor: '#262626', borderWidth: 1, borderRadius: 12 }}
                >
                    <CardBody className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                                <FileSpreadsheet className="w-6 h-6" style={{ color: '#a855f7' }} />
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#737373' }}>Net Margin</p>
                                <p className="text-2xl font-bold" style={{ color: '#ffffff' }}>{stats.avgMargin.toFixed(1)}%</p>
                                <p className="text-xs" style={{ color: '#525252' }}>After Tax</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Profit Trend Chart */}
            {chartData.length > 0 && (
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="px-6 pt-6 pb-0">
                        <h3 className="text-lg font-semibold text-white">Profit Trend</h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                                <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `₹${v/1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                    labelStyle={{ color: '#fff' }}
                                    formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="profit"
                                    stroke="#22c55e"
                                    strokeWidth={2}
                                    fill="url(#profitGradient)"
                                    name="Profit"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardBody>
                </Card>
            )}

            {/* Records Table */}
            <Card 
                className="bg-neutral-900 border-neutral-800"
                style={{ backgroundColor: '#171717', borderColor: '#262626', borderWidth: 1, borderRadius: 12 }}
            >
                <CardHeader className="px-6 pt-6 pb-0">
                    <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Transaction History</h3>
                </CardHeader>
                <CardBody className="p-0 overflow-x-auto">
                    <Table
                        aria-label="Sales history table"
                        classNames={{
                            base: 'min-w-full',
                            th: 'bg-neutral-800 text-neutral-400',
                            td: 'py-3'
                        }}
                        style={{ backgroundColor: 'transparent' }}
                    >
                        <TableHeader>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px' }}>DATE</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px' }}>FILE</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px', textAlign: 'right' }}>ORDERS</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px', textAlign: 'right' }}>REVENUE</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px', textAlign: 'right' }}>TAX</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px', textAlign: 'right' }}>NET PROFIT</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px', textAlign: 'right' }}>MARGIN</TableColumn>
                            <TableColumn style={{ backgroundColor: '#262626', color: '#a1a1a1', padding: '12px 16px', textAlign: 'right' }}>ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent={
                            <div className="py-12 text-center">
                                <FileSpreadsheet className="w-12 h-12 mx-auto mb-3" style={{ color: '#404040' }} />
                                <p style={{ color: '#737373' }}>No sales records yet.</p>
                                <Link href="/upload">
                                    <button 
                                        className="mt-4 px-4 py-2 rounded-lg font-medium"
                                        style={{ backgroundColor: '#D4440D', color: '#ffffff' }}
                                    >
                                        Upload First File
                                    </button>
                                </Link>
                            </div>
                        }>
                            {records.map((record) => {
                                const netProfit = record.totalProfit - (record.totalTax || 0)
                                const netMargin = record.totalRevenue > 0 ? (netProfit / record.totalRevenue) * 100 : 0
                                return (
                                    <TableRow key={record.id} style={{ borderBottom: '1px solid #262626' }}>
                                        <TableCell style={{ padding: '12px 16px' }}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" style={{ color: '#737373' }} />
                                                <span style={{ color: '#ffffff', fontWeight: 500 }}>{formatDate(record.date)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px' }}>
                                            <span style={{ color: '#a1a1a1', fontSize: '14px' }}>{record.fileName}</span>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <span style={{ color: '#d4d4d4' }}>{record.totalOrders}</span>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <span style={{ color: '#ffffff', fontWeight: 500 }}>{formatCurrency(record.totalRevenue)}</span>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <span style={{ color: '#f59e0b' }}>{formatCurrency(record.totalTax || 0)}</span>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <span style={{ color: '#22c55e', fontWeight: 600 }}>{formatCurrency(netProfit)}</span>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <span 
                                                style={{ 
                                                    padding: '4px 8px', 
                                                    borderRadius: '9999px', 
                                                    fontSize: '12px',
                                                    fontWeight: 500,
                                                    backgroundColor: netMargin > 50 ? 'rgba(34, 197, 94, 0.2)' : netMargin > 40 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                                    color: netMargin > 50 ? '#22c55e' : netMargin > 40 ? '#f59e0b' : '#ef4444'
                                                }}
                                            >
                                                {netMargin.toFixed(1)}%
                                            </span>
                                        </TableCell>
                                        <TableCell style={{ padding: '12px 16px', textAlign: 'right' }}>
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/reports?id=${record.id}`}>
                                                    <button 
                                                        className="p-2 rounded-lg hover:bg-neutral-800"
                                                        style={{ color: '#a1a1a1' }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    className="p-2 rounded-lg hover:bg-red-500/20"
                                                    style={{ color: '#ef4444' }}
                                                    onClick={() => handleDelete(record.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    )
}
