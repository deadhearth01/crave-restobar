'use client'

import { useEffect, useState } from 'react'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Skeleton from '@mui/material/Skeleton'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import TablePagination from '@mui/material/TablePagination'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import InventoryIcon from '@mui/icons-material/Inventory'

interface InventoryItem {
    id: number
    name: string
    costPrice: number
    sellingPrice: number
    marginPercent: number
    category: string
}

export default function InventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [categories, setCategories] = useState<string[]>([])
    const [stats, setStats] = useState({ totalItems: 0, avgMargin: 0 })
    const [page, setPage] = useState(0)
    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [isOpen, setIsOpen] = useState(false)
    const [editItem, setEditItem] = useState<InventoryItem | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        costPrice: '',
        sellingPrice: '',
        category: ''
    })

    useEffect(() => {
        loadInventory()
    }, [categoryFilter])

    async function loadInventory() {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (categoryFilter) params.append('category', categoryFilter)

            const res = await fetch(`/api/inventory${params.toString() ? '?' + params : ''}`)
            const data = await res.json()

            console.log('Inventory API response:', data)

            if (data.success) {
                setItems(data.items || [])
                if (data.categories) {
                    setCategories(data.categories)
                }
                setStats({
                    totalItems: data.count || 0,
                    avgMargin: 0
                })
            }
        } catch (err) {
            console.error('Failed to load inventory:', err)
        } finally {
            setLoading(false)
        }
    }

    function openAddModal() {
        setEditItem(null)
        setFormData({ name: '', costPrice: '', sellingPrice: '', category: '' })
        setIsOpen(true)
    }

    function openEditModal(item: InventoryItem) {
        setEditItem(item)
        setFormData({
            name: item.name,
            costPrice: item.costPrice.toString(),
            sellingPrice: item.sellingPrice.toString(),
            category: item.category
        })
        setIsOpen(true)
    }

    async function handleSubmit() {
        if (!formData.name || !formData.costPrice) return

        try {
            const payload = {
                name: formData.name,
                costPrice: parseFloat(formData.costPrice),
                sellingPrice: parseFloat(formData.sellingPrice) || 0,
                category: formData.category || 'Uncategorized'
            }

            if (editItem) {
                await fetch('/api/inventory', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editItem.id, ...payload })
                })
            } else {
                await fetch('/api/inventory', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            }

            loadInventory()
            setIsOpen(false)
        } catch (err) {
            console.error('Failed to save item:', err)
        }
    }

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this item?')) return

        try {
            await fetch('/api/inventory', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })
            loadInventory()
        } catch (err) {
            console.error('Failed to delete item:', err)
        }
    }

    const filteredItems = (items || []).filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`

    const getMarginColor = (margin: number): 'success' | 'warning' | 'error' => {
        if (margin >= 60) return 'success'
        if (margin >= 45) return 'warning'
        return 'error'
    }

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Skeleton variant="text" width={150} height={28} />
                    <Skeleton variant="rectangular" width={100} height={32} sx={{ borderRadius: 1.5 }} />
                </Box>
                <Card sx={{ bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 2 }}>
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} variant="rectangular" height={40} sx={{ mb: 1, borderRadius: 1 }} />
                        ))}
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
                        Inventory
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {stats.totalItems} items • Avg margin: {stats.avgMargin}%
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={openAddModal}
                    startIcon={<AddIcon />}
                    size="small"
                    sx={{
                        bgcolor: '#ef4444',
                        '&:hover': { bgcolor: '#dc2626' },
                        borderRadius: 2,
                        px: 2,
                    }}
                >
                    Add Item
                </Button>
            </Box>

            {/* Filters */}
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, mb: 2 }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                        <TextField
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'grey.500', fontSize: 20 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flex: 1 }}
                        />
                        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                label="Category"
                            >
                                <MenuItem value="">All Categories</MenuItem>
                                {categories.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </CardContent>
            </Card>

            {/* Table */}
            <Card sx={{ bgcolor: 'background.paper', borderRadius: 2 }}>
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: 11, fontWeight: 600 }}>ITEM NAME</TableCell>
                                <TableCell sx={{ fontSize: 11, fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>CATEGORY</TableCell>
                                <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600, display: { xs: 'none', sm: 'table-cell' } }}>COST</TableCell>
                                <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600 }}>SELL PRICE</TableCell>
                                <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600 }}>MARGIN</TableCell>
                                <TableCell align="right" sx={{ fontSize: 11, fontWeight: 600 }}>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredItems.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                            No inventory items found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredItems
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell sx={{ py: 1 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <InventoryIcon sx={{ fontSize: 14, color: 'grey.500' }} />
                                                <Typography variant="body2" fontWeight={500} color="white">{item.name}</Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                            <Typography variant="caption" color="text.secondary">{item.category}</Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                                            <Typography variant="caption" color="text.secondary">{formatCurrency(item.costPrice)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight={500} color="white">{formatCurrency(item.sellingPrice)}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip
                                                label={`${item.marginPercent}%`}
                                                color={getMarginColor(item.marginPercent)}
                                                size="small"
                                                sx={{ fontSize: 11, height: 22 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right" sx={{ py: 0.5 }}>
                                            <IconButton size="small" onClick={() => openEditModal(item)} sx={{ p: 0.5 }}>
                                                <EditIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(item.id)} sx={{ p: 0.5 }}>
                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                            </IconButton>
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
            </Card>

            {/* Add/Edit Dialog */}
            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { bgcolor: 'grey.900', m: 2 } }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box>
                        <Typography variant="subtitle1" fontWeight="bold" component="span">
                            {editItem ? 'Edit Item' : 'Add New Item'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {editItem ? 'Update item details' : 'Add a new item to your inventory'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Item Name"
                            placeholder="e.g., Chilli Chicken"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            fullWidth
                            size="small"
                        />
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                            <TextField
                                label="Cost Price (₹)"
                                type="number"
                                placeholder="0.00"
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                fullWidth
                                size="small"
                            />
                            <TextField
                                label="Selling Price (₹)"
                                type="number"
                                placeholder="0.00"
                                value={formData.sellingPrice}
                                onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                fullWidth
                                size="small"
                            />
                        </Box>
                        <TextField
                            label="Category"
                            placeholder="e.g., Bar Menu"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 1.5 }}>
                    <Button onClick={() => setIsOpen(false)} size="small" sx={{ color: 'grey.400' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        size="small"
                        sx={{
                            bgcolor: '#ef4444',
                            '&:hover': { bgcolor: '#dc2626' },
                            borderRadius: 1.5,
                        }}
                    >
                        {editItem ? 'Save Changes' : 'Add Item'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    )
}
