'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import VisibilityIcon from '@mui/icons-material/Visibility'
import DeleteIcon from '@mui/icons-material/Delete'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import DescriptionIcon from '@mui/icons-material/Description'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
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
            <Box sx={{ p: { xs: 2, md: 3 } }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} sx={{ bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Skeleton variant="text" width={80} height={14} sx={{ mb: 0.5 }} />
                                <Skeleton variant="text" width={120} height={24} />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" component="h1" fontWeight="bold" color="white">
                    Sales History
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Track daily sales and analyze historical performance
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(161, 161, 170, 0.2)' }}>
                                <AttachMoneyIcon sx={{ color: 'grey.300', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">{formatCurrency(stats.totalRevenue)}</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.2)' }}>
                                <TrendingUpIcon sx={{ color: '#22c55e', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#86efac' }}>Net Profit (After Tax)</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#22c55e' }}>{formatCurrency(stats.totalProfit)}</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(139, 92, 246, 0.2)' }}>
                                <DescriptionIcon sx={{ color: '#a78bfa', fontSize: 22 }} />
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Net Margin</Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">{stats.avgMargin.toFixed(1)}%</Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Profit Trend Chart */}
            {chartData.length > 0 && (
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" fontWeight="semibold" color="white" sx={{ mb: 1.5 }}>Profit Trend</Typography>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="date" stroke="#666" fontSize={10} />
                                <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `₹${v/1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
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
                    </CardContent>
                </Card>
            )}

            {/* Records Table */}
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, mt: 4 }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" fontWeight="semibold" color="white" sx={{ mb: 1.5 }}>Transaction History</Typography>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: 10, py: 1 }}>DATE</TableCell>
                                    <TableCell sx={{ fontSize: 10, py: 1, display: { xs: 'none', md: 'table-cell' } }}>FILE</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, py: 1, display: { xs: 'none', sm: 'table-cell' } }}>ORDERS</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, py: 1 }}>REVENUE</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, py: 1, display: { xs: 'none', md: 'table-cell' } }}>TAX</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, py: 1 }}>NET PROFIT</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, py: 1 }}>MARGIN</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, py: 1 }}>ACTIONS</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {records.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            <Box sx={{ py: 4 }}>
                                                <DescriptionIcon sx={{ fontSize: 36, color: 'grey.700', mb: 1 }} />
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>No sales records yet.</Typography>
                                                <Link href="/upload">
                                                    <Button variant="contained" size="small" sx={{ bgcolor: 'grey.200', color: 'grey.900', '&:hover': { bgcolor: 'grey.100' } }}>
                                                        Upload First File
                                                    </Button>
                                                </Link>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    records.map((record) => {
                                        const netProfit = record.totalProfit - (record.totalTax || 0)
                                        const netMargin = record.totalRevenue > 0 ? (netProfit / record.totalRevenue) * 100 : 0
                                        return (
                                            <TableRow key={record.id} hover>
                                                <TableCell sx={{ py: 1 }}>
                                                    <div className="flex items-center gap-1">
                                                        <CalendarTodayIcon sx={{ fontSize: 12, color: 'grey.500' }} />
                                                        <Typography variant="caption" fontWeight="medium" color="white">{formatDate(record.date)}</Typography>
                                                    </div>
                                                </TableCell>
                                                <TableCell sx={{ py: 1, display: { xs: 'none', md: 'table-cell' } }}><Typography variant="caption" color="text.secondary">{record.fileName}</Typography></TableCell>
                                                <TableCell align="right" sx={{ py: 1, display: { xs: 'none', sm: 'table-cell' } }}><Typography variant="caption" color="text.secondary">{record.totalOrders}</Typography></TableCell>
                                                <TableCell align="right" sx={{ py: 1 }}><Typography variant="caption" fontWeight="medium" color="white">{formatCurrency(record.totalRevenue)}</Typography></TableCell>
                                                <TableCell align="right" sx={{ py: 1, display: { xs: 'none', md: 'table-cell' } }}><Typography variant="caption" sx={{ color: '#f59e0b' }}>{formatCurrency(record.totalTax || 0)}</Typography></TableCell>
                                                <TableCell align="right" sx={{ py: 1 }}><Typography variant="caption" fontWeight="semibold" sx={{ color: '#22c55e' }}>{formatCurrency(netProfit)}</Typography></TableCell>
                                                <TableCell align="right" sx={{ py: 1 }}>
                                                    <Chip
                                                        label={`${netMargin.toFixed(1)}%`}
                                                        size="small"
                                                        color={netMargin > 50 ? 'success' : netMargin > 40 ? 'warning' : 'error'}
                                                        sx={{ height: 18, '& .MuiChip-label': { px: 0.75, fontSize: 10 } }}
                                                    />
                                                </TableCell>
                                                <TableCell align="right" sx={{ py: 1 }}>
                                                    <Link href={`/reports?id=${record.id}`}>
                                                        <IconButton size="small" sx={{ p: 0.5 }}>
                                                            <VisibilityIcon sx={{ fontSize: 16, color: 'grey.400' }} />
                                                        </IconButton>
                                                    </Link>
                                                    <IconButton size="small" sx={{ p: 0.5 }} onClick={() => handleDelete(record.id)}>
                                                        <DeleteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    )
}
