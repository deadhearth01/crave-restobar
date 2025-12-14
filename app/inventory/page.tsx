'use client'

import { useEffect, useState } from 'react'
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
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    Skeleton,
    Select,
    SelectItem
} from '@heroui/react'
import { Plus, Search, Edit2, Trash2, Package, Filter } from 'lucide-react'

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

    const { isOpen, onOpen, onOpenChange } = useDisclosure()
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
        onOpen()
    }

    function openEditModal(item: InventoryItem) {
        setEditItem(item)
        setFormData({
            name: item.name,
            costPrice: item.costPrice.toString(),
            sellingPrice: item.sellingPrice.toString(),
            category: item.category
        })
        onOpen()
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
            onOpenChange()
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

    const getMarginColor = (margin: number) => {
        if (margin >= 60) return 'success'
        if (margin >= 45) return 'warning'
        return 'danger'
    }

    if (loading) {
        return (
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="w-48 h-8 rounded" />
                    <Skeleton className="w-32 h-10 rounded" />
                </div>
                <Card className="bg-neutral-900 border-neutral-800">
                    <CardBody className="p-6">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Skeleton key={i} className="w-full h-12 rounded mb-2" />
                        ))}
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
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Inventory</h1>
                    <p className="text-gray-400 mt-1">
                        {stats.totalItems} items • Avg margin: {stats.avgMargin}%
                    </p>
                </div>
                <Button
                    onPress={openAddModal}
                    className="bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700"
                    startContent={<Plus className="w-5 h-5" />}
                >
                    Add Item
                </Button>
            </div>

            {/* Filters */}
            <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <CardBody className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                variant="bordered"
                                classNames={{
                                    inputWrapper: "border-gray-600 rounded-xl bg-gray-800",
                                    input: "text-white placeholder:text-gray-400",
                                }}
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-gray-600 bg-gray-800 text-white w-full sm:w-48"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </CardBody>
            </Card>

            {/* Table */}
            <Card className="bg-neutral-900 border-2 border-gray-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <CardBody className="p-0 overflow-x-auto">
                    <Table
                        aria-label="Inventory table"
                        classNames={{
                            base: 'min-w-full',
                            table: 'min-w-full',
                            th: 'bg-neutral-800 text-neutral-400',
                            td: 'py-3'
                        }}
                        style={{ backgroundColor: '#171717' }}
                    >
                        <TableHeader>
                            <TableColumn>ITEM NAME</TableColumn>
                            <TableColumn>CATEGORY</TableColumn>
                            <TableColumn className="text-right">COST</TableColumn>
                            <TableColumn className="text-right">SELL PRICE</TableColumn>
                            <TableColumn className="text-right">MARGIN</TableColumn>
                            <TableColumn className="text-right">ACTIONS</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No inventory items found.">
                            {filteredItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4 text-neutral-500" />
                                            <span className="font-medium text-white">{item.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-neutral-400 text-sm">{item.category}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-neutral-300">{formatCurrency(item.costPrice)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <span className="text-white font-medium">{formatCurrency(item.sellingPrice)}</span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Chip
                                            color={getMarginColor(item.marginPercent)}
                                            variant="flat"
                                            size="sm"
                                        >
                                            {item.marginPercent}%
                                        </Chip>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                onPress={() => openEditModal(item)}
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                isIconOnly
                                                size="sm"
                                                variant="light"
                                                color="danger"
                                                onPress={() => handleDelete(item.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                size="2xl"
                scrollBehavior="inside"
            >
                <ModalContent>
                    <ModalHeader className="
                        flex flex-col gap-1
                        border-b border-gray-700
                        pb-4
                    ">
                        <h2 className="text-2xl font-bold text-white">
                            {editItem ? 'Edit Item' : 'Add New Item'}
                        </h2>
                        <p className="text-sm text-gray-400">
                            {editItem ? 'Update item details' : 'Add a new item to your inventory'}
                        </p>
                    </ModalHeader>

                    <ModalBody className="py-6">
                        <div className="space-y-4">
                            <Input
                                label="Item Name"
                                placeholder="e.g., Chilli Chicken"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                variant="bordered"
                                classNames={{
                                    inputWrapper: "border-gray-600 rounded-xl bg-gray-800",
                                    input: "text-white",
                                    label: "text-gray-300"
                                }}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Cost Price (₹)"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.costPrice}
                                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: "border-gray-600 rounded-xl bg-gray-800",
                                        input: "text-white",
                                        label: "text-gray-300"
                                    }}
                                />
                                <Input
                                    label="Selling Price (₹)"
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.sellingPrice}
                                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                                    variant="bordered"
                                    classNames={{
                                        inputWrapper: "border-gray-600 rounded-xl bg-gray-800",
                                        input: "text-white",
                                        label: "text-gray-300"
                                    }}
                                />
                            </div>
                            <Input
                                label="Category"
                                placeholder="e.g., Bar Menu"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                variant="bordered"
                                classNames={{
                                    inputWrapper: "border-gray-600 rounded-xl bg-gray-800",
                                    input: "text-white",
                                    label: "text-gray-300"
                                }}
                            />
                        </div>
                    </ModalBody>

                    <ModalFooter className="
                        border-t border-gray-700
                        pt-4
                    ">
                        <Button 
                            variant="light"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 text-white font-semibold rounded-xl shadow-lg hover:bg-red-700"
                            onClick={handleSubmit}
                        >
                            {editItem ? 'Save Changes' : 'Add Item'}
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    )
}
