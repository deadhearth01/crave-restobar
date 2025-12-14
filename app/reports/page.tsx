'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Chip,
    Skeleton,
    Select,
    SelectItem
} from '@heroui/react'
import {
    TrendingUp,
    Download,
    Search,
    FileSpreadsheet,
    DollarSign,
    ShoppingCart,
    Package,
    Filter,
    Receipt,
    Wallet
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

const COLORS = ['#D4440D', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899']

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="p-4 md:p-8 flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-[#D4440D] border-t-transparent rounded-full animate-spin" />
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
            <div className="p-4 md:p-8 space-y-6">
                <Skeleton className="w-48 h-8 rounded" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
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

    if (error) {
        return (
            <div className="p-4 md:p-8">
                <Card className="bg-red-500/10 border-red-500/30">
                    <CardBody className="p-6 text-center">
                        <p className="text-red-400 mb-4">{error}</p>
                        <Link href="/upload">
                            <Button className="bg-[#D4440D]">Upload a File</Button>
                        </Link>
                    </CardBody>
                </Card>
            </div>
        )
    }

    if (!record) {
        return (
            <div className="p-4 md:p-8">
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardBody className="p-12 text-center">
                        <FileSpreadsheet className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-neutral-400 mb-2">No Reports Yet</h3>
                        <p className="text-neutral-600 mb-6">Upload an Excel file to see profit analysis</p>
                        <Link href="/upload">
                            <Button className="bg-[#D4440D]">Upload Sales Data</Button>
                        </Link>
                    </CardBody>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Profit Report</h1>
                    <p className="text-neutral-500 mt-1">Source: {record.fileName}</p>
                </div>
                <Button variant="bordered">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                    <CardBody className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-400 uppercase tracking-wide">Revenue</p>
                                <p className="text-xl font-bold text-white mt-1">
                                    {formatCurrency(record.summary.totalRevenue)}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500/20 rounded-2xl">
                                <DollarSign className="w-6 h-6 text-red-400" />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
                    <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase" style={{ color: '#737373' }}>Cost</p>
                                <p className="text-lg md:text-xl font-bold text-red-400 mt-1" style={{ color: '#f87171' }}>
                                    {formatCurrency(record.summary.totalCost)}
                                </p>
                            </div>
                            <div className="p-2 bg-red-500/20 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>
                                <Package className="w-4 h-4 text-red-400" style={{ color: '#f87171' }} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
                    <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase" style={{ color: '#737373' }}>Gross Profit</p>
                                <p className="text-lg md:text-xl font-bold text-green-500 mt-1" style={{ color: '#22c55e' }}>
                                    {formatCurrency(record.summary.totalProfit)}
                                </p>
                            </div>
                            <div className="p-2 bg-green-500/20 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>
                                <TrendingUp className="w-4 h-4 text-green-500" style={{ color: '#22c55e' }} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
                    <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase" style={{ color: '#737373' }}>Tax Paid</p>
                                <p className="text-lg md:text-xl font-bold text-amber-400 mt-1" style={{ color: '#fbbf24' }}>
                                    {formatCurrency(record.summary.totalTax)}
                                </p>
                            </div>
                            <div className="p-2 bg-amber-500/20 rounded-lg" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)' }}>
                                <Receipt className="w-4 h-4 text-amber-400" style={{ color: '#fbbf24' }} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800 ring-2 ring-green-500/30" style={{ backgroundColor: '#171717', borderColor: '#262626', boxShadow: '0 0 0 2px rgba(34, 197, 94, 0.3)' }}>
                    <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-green-400 uppercase font-semibold" style={{ color: '#4ade80' }}>Net Profit</p>
                                <p className="text-lg md:text-xl font-bold text-green-400 mt-1" style={{ color: '#4ade80' }}>
                                    {formatCurrency(afterTaxProfit)}
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5" style={{ color: '#737373' }}>After Tax</p>
                            </div>
                            <div className="p-2 bg-green-500/30 rounded-lg" style={{ backgroundColor: 'rgba(34, 197, 94, 0.3)' }}>
                                <Wallet className="w-4 h-4 text-green-400" style={{ color: '#4ade80' }} />
                            </div>
                        </div>
                    </CardBody>
                </Card>

                <Card className="bg-neutral-900 border-neutral-800" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
                    <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-neutral-500 uppercase" style={{ color: '#737373' }}>Net Margin</p>
                                <p className="text-lg md:text-xl font-bold text-white mt-1" style={{ color: '#ffffff' }}>
                                    {afterTaxMargin}%
                                </p>
                                <p className="text-xs text-neutral-500 mt-0.5" style={{ color: '#737373' }}>After Tax</p>
                            </div>
                            <div className="p-2 bg-purple-500/20 rounded-lg" style={{ backgroundColor: 'rgba(168, 85, 247, 0.2)' }}>
                                <ShoppingCart className="w-4 h-4 text-purple-500" style={{ color: '#a855f7' }} />
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Items Bar Chart */}
                <Card className="bg-neutral-900 border-neutral-800" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
                    <CardHeader className="px-6 pt-6 pb-0">
                        <h3 className="text-lg font-semibold text-white" style={{ color: '#ffffff' }}>Top Profitable Items</h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        {topItemsData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={topItemsData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                                    <YAxis type="category" dataKey="name" stroke="#666" fontSize={11} width={100} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                    />
                                    <Bar dataKey="profit" fill="#22c55e" radius={[0, 4, 4, 0]} name="Profit" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-neutral-500">
                                No data available
                            </div>
                        )}
                    </CardBody>
                </Card>

                {/* Category Pie Chart */}
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardHeader className="px-6 pt-6 pb-0">
                        <h3 className="text-lg font-semibold text-white">Revenue by Category</h3>
                    </CardHeader>
                    <CardBody className="p-6">
                        {categoryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
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
                                        formatter={(value: number) => [`₹${value.toLocaleString()}`, '']}
                                    />
                                    <Legend
                                        formatter={(value) => <span className="text-neutral-300 text-sm">{value}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-[280px] flex items-center justify-center text-neutral-500">
                                No data available
                            </div>
                        )}
                    </CardBody>
                </Card>
            </div>

            {/* Items Table */}
            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="px-6 pt-6 pb-4">
                    <div className="flex flex-col gap-4 w-full">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <h3 className="text-lg font-semibold text-white">All Items ({filteredItems.length})</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <Select
                                    placeholder="Category"
                                    selectedKeys={[categoryFilter]}
                                    onChange={(e) => setCategoryFilter(e.target.value || 'all')}
                                    startContent={<Filter className="w-4 h-4 text-neutral-500" />}
                                    className="w-full sm:w-48"
                                    classNames={{
                                        trigger: 'bg-neutral-800 border-neutral-700 data-[hover=true]:bg-neutral-700',
                                        value: 'text-white',
                                        popoverContent: 'bg-neutral-800 border-neutral-700'
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <SelectItem key={cat} textValue={cat === 'all' ? 'All Categories' : cat}>
                                            {cat === 'all' ? 'All Categories' : cat}
                                        </SelectItem>
                                    ))}
                                </Select>
                                <Input
                                    placeholder="Search items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    startContent={<Search className="w-4 h-4 text-neutral-500" />}
                                    className="w-full sm:w-64"
                                    classNames={{
                                        input: 'bg-neutral-800 text-white',
                                        inputWrapper: 'bg-neutral-800 border-neutral-700'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="p-0 overflow-x-auto">
                    <Table
                        aria-label="Items table"
                        classNames={{
                            base: 'min-w-full',
                            th: 'bg-neutral-800 text-neutral-400',
                            td: 'py-3'
                        }}
                    >
                        <TableHeader>
                            <TableColumn>ITEM</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn className="text-right">QTY</TableColumn>
                            <TableColumn className="text-right">REVENUE</TableColumn>
                            <TableColumn className="text-right">COST</TableColumn>
                            <TableColumn className="text-right">PROFIT</TableColumn>
                            <TableColumn className="text-right">MARGIN</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No items found.">
                            {filteredItems.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>
                                        <span className="font-medium text-white">{item.itemName}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-neutral-400 text-sm">{item.category}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-neutral-300">{item.quantity}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-white">{formatCurrency(item.netAmount)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-red-400">{formatCurrency(item.costPrice * item.quantity)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-green-500 font-semibold">{formatCurrency(item.profit)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Chip
                                            color={item.margin >= 60 ? 'success' : item.margin >= 45 ? 'warning' : 'danger'}
                                            variant="flat"
                                            size="sm"
                                        >
                                            {item.margin}%
                                        </Chip>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </div>
    )
}
