'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Chip from '@mui/material/Chip'
import Skeleton from '@mui/material/Skeleton'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import InputAdornment from '@mui/material/InputAdornment'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import DownloadIcon from '@mui/icons-material/Download'
import SearchIcon from '@mui/icons-material/Search'
import DescriptionIcon from '@mui/icons-material/Description'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import InventoryIcon from '@mui/icons-material/Inventory'
import FilterListIcon from '@mui/icons-material/FilterList'
import ReceiptIcon from '@mui/icons-material/Receipt'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import TablePagination from '@mui/material/TablePagination'
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

interface SaleItem {
    itemName: string
    category: string
    quantity: number
    costPrice: number
    netAmount: number
    tax: number
    profit: number
    margin: number
}

interface RecordData {
    id: number
    fileName: string
    date: string
    dateRange: string
    summary: {
        totalRevenue: number
        totalCost: number
        totalProfit: number
        totalTax: number
        totalOrders: number
        netMargin: number
        itemCount: number
    }
    topPerformers: SaleItem[]
    items: SaleItem[]
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6']

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
                <Box sx={{ width: 32, height: 32, border: '2px solid', borderColor: 'grey.500', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } } }} />
            </div>
        }>
            <ReportsContent />
        </Suspense>
    )
}

function ReportsContent() {
    const searchParams = useSearchParams()
    const recordId = searchParams.get('id')

    const [record, setRecord] = useState<RecordData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState<string>('all')
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    // Get unique categories from items
    const categories = record?.items 
        ? ['all', ...new Set(record.items.map(item => item.category))]
        : ['all']

    useEffect(() => {
        loadData()
    }, [recordId])

    async function loadData() {
        setLoading(true)
        setError(null)

        try {
            if (recordId) {
                const res = await fetch(`/api/sales/${recordId}`)
                const data = await res.json()

                if (data.success) {
                    setRecord(data.record)
                } else {
                    setError(data.error || 'Failed to load record')
                }
            } else {
                // Load most recent record
                const res = await fetch('/api/sales')
                const data = await res.json()

                if (data.success && data.records?.length > 0) {
                    const firstRes = await fetch(`/api/sales/${data.records[0].id}`)
                    const firstData = await firstRes.json()
                    if (firstData.success) {
                        setRecord(firstData.record)
                    }
                }
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredItems = (record?.items || []).filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
        return matchesSearch && matchesCategory
    })

    // Calculate after-tax profit
    const afterTaxProfit = record ? record.summary.totalProfit - record.summary.totalTax : 0
    const afterTaxMargin = record && record.summary.totalRevenue > 0 
        ? Math.round((afterTaxProfit / record.summary.totalRevenue) * 100 * 10) / 10
        : 0

    const formatCurrency = (value: number) =>
        `₹${value.toLocaleString('en-IN')}`

    // Category data for pie chart
    const categoryData = record?.items ? 
        Object.entries(
            record.items.reduce((acc: Record<string, number>, item) => {
                acc[item.category] = (acc[item.category] || 0) + item.netAmount
                return acc
            }, {})
        ).map(([name, value]) => ({ name: name.split(' ').slice(0, 2).join(' '), value }))
        : []

    // Top items for bar chart
    const topItemsData = record?.items ?
        [...record.items]
            .sort((a, b) => b.profit - a.profit)
            .slice(0, 8)
            .map(item => ({
                name: item.itemName.length > 15 ? item.itemName.substring(0, 15) + '...' : item.itemName,
                profit: item.profit,
                revenue: item.netAmount
            }))
        : []

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Skeleton variant="text" width={150} height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 1.5 }}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <Card key={i} sx={{ bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 1.5 }}>
                                <Skeleton variant="text" width={60} height={14} sx={{ mb: 0.5 }} />
                                <Skeleton variant="text" width={80} height={20} />
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            </Box>
        )
    }

    if (error) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Card sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                        <Typography variant="body2" color="error.light" sx={{ mb: 1.5 }}>{error}</Typography>
                        <Link href="/upload">
                            <Button variant="contained" size="small" sx={{ bgcolor: 'grey.200', color: 'grey.900', '&:hover': { bgcolor: 'grey.100' } }}>
                                Upload a File
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </Box>
        )
    }

    if (!record) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                        <DescriptionIcon sx={{ fontSize: 48, color: 'grey.700', mb: 1.5 }} />
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 0.5 }}>No Reports Yet</Typography>
                        <Typography variant="caption" color="text.disabled" sx={{ mb: 2, display: 'block' }}>Upload an Excel file to see profit analysis</Typography>
                        <Link href="/upload">
                            <Button variant="contained" size="small" sx={{ bgcolor: 'grey.200', color: 'grey.900', '&:hover': { bgcolor: 'grey.100' } }}>
                                Upload Sales Data
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </Box>
        )
    }

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2 }}>
                <Box>
                    <Typography variant="h5" component="h1" fontWeight="bold" color="white">
                        Profit Report
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Source: {record.fileName}
                    </Typography>
                </Box>
                <Button variant="outlined" size="small" startIcon={<DownloadIcon sx={{ fontSize: 16 }} />} sx={{ borderColor: 'grey.600', color: 'grey.400' }}>
                    Export
                </Button>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', xl: 'repeat(6, 1fr)' }, gap: 1.5, mb: 2 }}>
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>Revenue</Typography>
                                <Typography variant="body2" fontWeight="bold" color="white">{formatCurrency(record.summary.totalRevenue)}</Typography>
                            </Box>
                            <Box sx={{ p: 0.75, bgcolor: 'rgba(239, 68, 68, 0.15)', borderRadius: 1.5 }}>
                                <AttachMoneyIcon sx={{ color: '#ef4444', fontSize: 16 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>Cost</Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#ef4444' }}>{formatCurrency(record.summary.totalCost)}</Typography>
                            </Box>
                            <Box sx={{ p: 0.75, bgcolor: 'rgba(239, 68, 68, 0.15)', borderRadius: 1.5 }}>
                                <InventoryIcon sx={{ color: '#ef4444', fontSize: 16 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>Gross Profit</Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#22c55e' }}>{formatCurrency(record.summary.totalProfit)}</Typography>
                            </Box>
                            <Box sx={{ p: 0.75, bgcolor: 'rgba(34, 197, 94, 0.15)', borderRadius: 1.5 }}>
                                <TrendingUpIcon sx={{ color: '#22c55e', fontSize: 16 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>Tax Paid</Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#f59e0b' }}>{formatCurrency(record.summary.totalTax)}</Typography>
                            </Box>
                            <Box sx={{ p: 0.75, bgcolor: 'rgba(245, 158, 11, 0.15)', borderRadius: 1.5 }}>
                                <ReceiptIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9, color: '#86efac', fontWeight: 600 }}>Net Profit</Typography>
                                <Typography variant="body2" fontWeight="bold" sx={{ color: '#22c55e' }}>{formatCurrency(afterTaxProfit)}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>After Tax</Typography>
                            </Box>
                            <Box sx={{ p: 0.75, bgcolor: 'rgba(34, 197, 94, 0.15)', borderRadius: 1.5 }}>
                                <AccountBalanceWalletIcon sx={{ color: '#22c55e', fontSize: 16 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 9 }}>Net Margin</Typography>
                                <Typography variant="body2" fontWeight="bold" color="white">{afterTaxMargin}%</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9 }}>After Tax</Typography>
                            </Box>
                            <Box sx={{ p: 0.75, bgcolor: 'rgba(139, 92, 246, 0.15)', borderRadius: 1.5 }}>
                                <ShoppingCartIcon sx={{ color: '#8b5cf6', fontSize: 16 }} />
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Charts Row */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' }, gap: 2, mb: 2 }}>
                {/* Top Items Bar Chart */}
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="white" sx={{ mb: 1.5 }}>Top Profitable Items</Typography>
                        {topItemsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={topItemsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#666" fontSize={10} tickFormatter={(v) => `₹${v}`} />
                                    <YAxis type="category" dataKey="name" stroke="#666" fontSize={9} width={80} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                    />
                                    <Bar dataKey="profit" fill="#22c55e" radius={[0, 3, 3, 0]} name="Profit" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">No data available</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Category Pie Chart */}
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                    <CardContent sx={{ p: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="white" sx={{ mb: 1.5 }}>Revenue by Category</Typography>
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
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
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: 11 }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                    />
                                    <Legend
                                        wrapperStyle={{ fontSize: 10 }}
                                        formatter={(value) => <span style={{ color: '#a1a1aa' }}>{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography variant="caption" color="text.secondary">No data available</Typography>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Box>

            {/* Items Table */}
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                <CardContent sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, justifyContent: 'space-between', gap: 2, mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight={600} color="white">All Items ({filteredItems.length})</Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 } }}>
                                <InputLabel sx={{ fontSize: 13 }}>Category</InputLabel>
                                <Select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    label="Category"
                                    startAdornment={<FilterListIcon sx={{ mr: 0.5, color: 'grey.500', fontSize: 16 }} />}
                                    sx={{ fontSize: 13 }}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat} value={cat} sx={{ fontSize: 13 }}>{cat === 'all' ? 'All Categories' : cat}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                size="small"
                                sx={{ minWidth: { xs: '100%', sm: 180 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon sx={{ color: 'grey.500', fontSize: 18 }} />
                                        </InputAdornment>
                                    ),
                                    sx: { fontSize: 13 }
                                }}
                            />
                        </Box>
                    </Box>
                    <TableContainer>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontSize: 10, fontWeight: 600 }}>ITEM</TableCell>
                                    <TableCell sx={{ fontSize: 10, fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>CATEGORY</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>QTY</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, fontWeight: 600 }}>REVENUE</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, fontWeight: 600, display: { xs: 'none', lg: 'table-cell' } }}>COST</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, fontWeight: 600 }}>PROFIT</TableCell>
                                    <TableCell align="right" sx={{ fontSize: 10, fontWeight: 600 }}>MARGIN</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            <Typography variant="caption" color="text.secondary" sx={{ py: 2 }}>No items found.</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredItems
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((item, idx) => (
                                        <TableRow key={idx} hover>
                                            <TableCell sx={{ py: 1 }}><Typography variant="body2" fontWeight={500} color="white">{item.itemName}</Typography></TableCell>
                                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Typography variant="caption" color="text.secondary">{item.category}</Typography></TableCell>
                                            <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Typography variant="caption" color="text.secondary">{item.quantity}</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="body2" color="white">{formatCurrency(item.netAmount)}</Typography></TableCell>
                                            <TableCell align="right" sx={{ display: { xs: 'none', lg: 'table-cell' } }}><Typography variant="caption" sx={{ color: '#ef4444' }}>{formatCurrency(item.costPrice * item.quantity)}</Typography></TableCell>
                                            <TableCell align="right"><Typography variant="body2" fontWeight={600} sx={{ color: '#22c55e' }}>{formatCurrency(item.profit)}</Typography></TableCell>
                                            <TableCell align="right">
                                                <Chip
                                                    label={`${item.margin}%`}
                                                    size="small"
                                                    color={item.margin >= 60 ? 'success' : item.margin >= 45 ? 'warning' : 'error'}
                                                    sx={{ fontSize: 10, height: 20 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        component="div"
                        count={filteredItems.length}
                        page={page}
                        onPageChange={(_, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                        rowsPerPageOptions={[10, 25, 50]}
                        sx={{ 
                            borderTop: '1px solid rgba(255,255,255,0.1)',
                            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: 12 },
                            '.MuiTablePagination-select': { fontSize: 12 }
                        }}
                    />
                </CardContent>
            </Card>
        </Box>
    )
}
