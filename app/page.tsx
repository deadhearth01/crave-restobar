'use client'

import { useEffect, useState } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import DescriptionIcon from '@mui/icons-material/Description'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import InventoryIcon from '@mui/icons-material/Inventory'
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

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4']

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
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} sx={{ bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 2 }}>
                                <Skeleton variant="text" width={60} height={16} sx={{ mb: 0.5 }} />
                                <Skeleton variant="text" width={100} height={24} />
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
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
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box>
                    <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                        Dashboard
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Overview of your sales performance
                    </Typography>
                </Box>
                <Link href="/upload">
                    <Button
                        variant="contained"
                        startIcon={<CloudUploadIcon sx={{ fontSize: 18 }} />}
                        size="small"
                        sx={{
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            borderRadius: 2,
                            px: 2,
                            fontWeight: 600,
                            boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)',
                        }}
                    >
                        Upload Sales Data
                    </Button>
                </Link>
            </Box>

            {/* Stats Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 2 }}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                                    Revenue
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">
                                    {formatCurrency(stats.totalRevenue)}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'rgba(239, 68, 68, 0.15)', borderRadius: 2 }}>
                                <AttachMoneyIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                                    Profit
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ color: '#22c55e' }}>
                                    {formatCurrency(afterTaxProfit)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                    After Tax
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'rgba(34, 197, 94, 0.15)', borderRadius: 2 }}>
                                <TrendingUpIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                                    Orders
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">
                                    {stats.totalOrders}
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'rgba(59, 130, 246, 0.15)', borderRadius: 2 }}>
                                <ShoppingCartIcon sx={{ color: '#3b82f6', fontSize: 18 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 10 }}>
                                    Inventory
                                </Typography>
                                <Typography variant="subtitle1" fontWeight="bold" color="white">
                                    {stats.inventoryCount} items
                                </Typography>
                            </Box>
                            <Box sx={{ p: 1, bgcolor: 'rgba(139, 92, 246, 0.15)', borderRadius: 2 }}>
                                <InventoryIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Charts Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                {/* Revenue Chart */}
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="white" sx={{ mb: 1.5 }}>
                            Profit Trend
                        </Typography>
                        {revenueChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={revenueChartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="date" stroke="#666" fontSize={10} />
                                    <YAxis stroke="#666" fontSize={10} tickFormatter={(v) => `₹${v/1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: 12 }}
                                        labelStyle={{ color: '#fff' }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Profit']}
                                    />
                                    <Bar dataKey="profit" fill="#22c55e" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <DescriptionIcon sx={{ fontSize: 36, color: 'grey.700', mb: 1 }} />
                                    <Typography variant="caption" color="text.secondary">No data yet. Upload sales to see trends.</Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="white" sx={{ mb: 1.5 }}>
                            Inventory by Category
                        </Typography>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={65}
                                        paddingAngle={2}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: 12 }}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: 11 }}
                                        formatter={(value) => <span style={{ color: '#ffffff' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <InventoryIcon sx={{ fontSize: 36, color: 'grey.700', mb: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Inventory categories will appear here.</Typography>
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Quick Actions */}
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
                <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} color="white" sx={{ mb: 1.5 }}>
                        Quick Actions
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                        <Link href="/upload" style={{ textDecoration: 'none' }}>
                            <Box sx={{ p: 1.5, bgcolor: 'grey.800', borderRadius: 2, '&:hover': { bgcolor: 'grey.700' }, transition: 'all 0.2s', cursor: 'pointer' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(239, 68, 68, 0.15)', borderRadius: 1.5 }}>
                                        <CloudUploadIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500} color="white">Upload Data</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Import daily Excel</Typography>
                                    </Box>
                                    <ArrowOutwardIcon sx={{ color: 'grey.600', fontSize: 14 }} />
                                </Box>
                            </Box>
                        </Link>

                        <Link href="/inventory" style={{ textDecoration: 'none' }}>
                            <Box sx={{ p: 1.5, bgcolor: 'grey.800', borderRadius: 2, '&:hover': { bgcolor: 'grey.700' }, transition: 'all 0.2s', cursor: 'pointer' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(139, 92, 246, 0.15)', borderRadius: 1.5 }}>
                                        <InventoryIcon sx={{ color: '#8b5cf6', fontSize: 18 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500} color="white">Inventory</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>Manage cost prices</Typography>
                                    </Box>
                                    <ArrowOutwardIcon sx={{ color: 'grey.600', fontSize: 14 }} />
                                </Box>
                            </Box>
                        </Link>

                        <Link href="/reports" style={{ textDecoration: 'none' }}>
                            <Box sx={{ p: 1.5, bgcolor: 'grey.800', borderRadius: 2, '&:hover': { bgcolor: 'grey.700' }, transition: 'all 0.2s', cursor: 'pointer' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ p: 1, bgcolor: 'rgba(34, 197, 94, 0.15)', borderRadius: 1.5 }}>
                                        <DescriptionIcon sx={{ color: '#22c55e', fontSize: 18 }} />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={500} color="white">Reports</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>View profit analysis</Typography>
                                    </Box>
                                    <ArrowOutwardIcon sx={{ color: 'grey.600', fontSize: 14 }} />
                                </Box>
                            </Box>
                        </Link>
                    </Box>
                </CardContent>
            </Card>

            {/* Recent Records */}
            {data?.recentRecords && data.recentRecords.length > 0 && (
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="white" sx={{ mb: 1.5 }}>
                            Recent Uploads
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {data.recentRecords.slice(0, 5).map((record) => (
                                <Link key={record.id} href={`/reports?id=${record.id}`} style={{ textDecoration: 'none' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1.5, bgcolor: 'grey.800', borderRadius: 2, '&:hover': { bgcolor: 'grey.700' }, transition: 'all 0.2s', cursor: 'pointer' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <DescriptionIcon sx={{ color: '#ef4444', fontSize: 18 }} />
                                            <Box>
                                                <Typography variant="body2" fontWeight={500} color="white">{record.fileName}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                                                    {new Date(record.date).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Typography variant="body2" fontWeight={600} sx={{ color: '#22c55e' }}>{formatCurrency(record.totalProfit)}</Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>{record.totalOrders} orders</Typography>
                                        </Box>
                                    </Box>
                                </Link>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            )}
        </Box>
    )
}
