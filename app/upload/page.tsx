'use client'

import { useState, useRef } from 'react'
import {
    Card,
    CardHeader,
    CardBody,
    Button,
    Progress,
    Chip
} from '@heroui/react'
import {
    Upload,
    FileSpreadsheet,
    X,
    CheckCircle,
    AlertCircle,
    Zap,
    TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [step, setStep] = useState(0)
    const [error, setError] = useState('')
    const [parseResult, setParseResult] = useState<any>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            if (!selectedFile.name.match(/\.xlsx?$/i)) {
                setError('Please upload an Excel file (.xlsx or .xls)')
                return
            }
            setFile(selectedFile)
            setError('')
            setParseResult(null)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            if (!droppedFile.name.match(/\.xlsx?$/i)) {
                setError('Please upload an Excel file (.xlsx or .xls)')
                return
            }
            setFile(droppedFile)
            setError('')
            setParseResult(null)
        }
    }

    const processFile = async () => {
        if (!file) return

        setIsProcessing(true)
        setError('')
        setStep(1)

        try {
            // Step 1: Parse Excel
            const formData = new FormData()
            formData.append('file', file)

            const parseRes = await fetch('/api/parse', {
                method: 'POST',
                body: formData
            })

            const parseData = await parseRes.json()

            if (!parseRes.ok || !parseData.success) {
                throw new Error(parseData.error || 'Failed to parse file')
            }

            setParseResult(parseData.data)
            setStep(2)

            // Step 2: Save to database
            const saveRes = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(parseData.data)
            })

            const saveData = await saveRes.json()

            if (!saveRes.ok || !saveData.success) {
                throw new Error(saveData.error || 'Failed to save data')
            }

            setStep(3)

            // Redirect after success
            setTimeout(() => {
                router.push(`/reports?id=${saveData.record.id}`)
            }, 1500)

        } catch (err: any) {
            setError(err.message)
            setStep(0)
        } finally {
            setIsProcessing(false)
        }
    }

    const clearFile = () => {
        setFile(null)
        setError('')
        setParseResult(null)
        setStep(0)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const formatCurrency = (v: number) => `₹${v.toLocaleString('en-IN')}`

    return (
        <div className="p-4 md:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Upload Sales Data</h1>
                <p className="text-neutral-500 mt-1">Import your daily Excel file to calculate profits</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Upload Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Drop Zone */}
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardBody className="p-6">
                            <div
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`
                                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                                    transition-colors duration-200
                                    ${file ? 'border-green-500 bg-green-500/5' : 'border-neutral-700 hover:border-[#D4440D]'}
                                `}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />

                                <div className="flex flex-col items-center gap-4">
                                    {file ? (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <FileSpreadsheet className="w-8 h-8 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{file.name}</p>
                                                <p className="text-sm text-neutral-500">
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-[#D4440D]/20 flex items-center justify-center">
                                                <Upload className="w-8 h-8 text-[#D4440D]" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">
                                                    Drag & drop your file here
                                                </p>
                                                <p className="text-sm text-neutral-500 mt-1">
                                                    or click to browse (Excel files only)
                                                </p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-4 flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {file && !parseResult && (
                                <div className="mt-6 flex gap-3">
                                    <Button
                                        color="primary"
                                        className="flex-1 bg-[#D4440D]"
                                        onPress={processFile}
                                        isLoading={isProcessing}
                                    >
                                        {!isProcessing && <Zap className="w-4 h-4 mr-2" />}
                                        Process & Calculate
                                    </Button>
                                    <Button variant="bordered" onPress={clearFile}>
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Progress Steps */}
                            {step > 0 && (
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-500' : 'bg-neutral-700'}`}>
                                            {step >= 2 ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-xs text-white">1</span>}
                                        </div>
                                        <span className={step >= 1 ? 'text-white' : 'text-neutral-500'}>Parsing Excel file...</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-500' : 'bg-neutral-700'}`}>
                                            {step >= 3 ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-xs text-white">2</span>}
                                        </div>
                                        <span className={step >= 2 ? 'text-white' : 'text-neutral-500'}>Calculating profits...</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-green-500' : 'bg-neutral-700'}`}>
                                            {step >= 3 ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="text-xs text-white">3</span>}
                                        </div>
                                        <span className={step >= 3 ? 'text-white' : 'text-neutral-500'}>Saving to database...</span>
                                    </div>
                                </div>
                            )}
                        </CardBody>
                    </Card>

                    {/* Parse Result */}
                    {parseResult && (
                        <Card className="bg-neutral-900 border-neutral-800">
                            <CardHeader className="px-6 pt-6 pb-0">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <h3 className="text-lg font-semibold text-white">Parsed Successfully</h3>
                                </div>
                            </CardHeader>
                            <CardBody className="p-6 space-y-4">
                                {/* Summary Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div className="bg-neutral-800 rounded-lg p-3">
                                        <p className="text-xs text-neutral-500">Items</p>
                                        <p className="text-xl font-bold text-white">{parseResult.summary.totalItems}</p>
                                    </div>
                                    <div className="bg-neutral-800 rounded-lg p-3">
                                        <p className="text-xs text-neutral-500">Orders</p>
                                        <p className="text-xl font-bold text-white">{parseResult.summary.totalOrders}</p>
                                    </div>
                                    <div className="bg-neutral-800 rounded-lg p-3">
                                        <p className="text-xs text-neutral-500">Revenue</p>
                                        <p className="text-xl font-bold text-white">{formatCurrency(parseResult.summary.totalRevenue)}</p>
                                    </div>
                                    <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20">
                                        <p className="text-xs text-green-400">Profit</p>
                                        <p className="text-xl font-bold text-green-500">{formatCurrency(parseResult.summary.totalProfit)}</p>
                                    </div>
                                </div>

                                {/* Category Breakdown */}
                                {parseResult.categories?.length > 0 && (
                                    <div className="bg-neutral-800/50 rounded-lg p-4">
                                        <h4 className="text-xs font-semibold text-neutral-400 mb-3 uppercase">Category Breakdown</h4>
                                        <div className="space-y-2">
                                            {parseResult.categories.map((cat: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between text-sm">
                                                    <span className="text-neutral-300">{cat.name}</span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-neutral-500">{cat.totalQuantity} orders</span>
                                                        <span className="text-white font-medium">{formatCurrency(cat.totalRevenue)}</span>
                                                        <Chip
                                                            size="sm"
                                                            color={cat.avgMargin >= 50 ? 'success' : cat.avgMargin >= 40 ? 'warning' : 'danger'}
                                                            variant="flat"
                                                        >
                                                            {cat.avgMargin}%
                                                        </Chip>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Net Margin */}
                                <div className="flex items-center justify-between bg-[#D4440D]/10 rounded-lg p-4 border border-[#D4440D]/20">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-[#D4440D]" />
                                        <span className="text-white font-medium">Net Profit Margin</span>
                                    </div>
                                    <span className="text-2xl font-bold text-[#D4440D]">{parseResult.summary.netMargin}%</span>
                                </div>

                                {step === 3 && (
                                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <p className="text-sm text-green-400">Saved! Redirecting to report...</p>
                                    </div>
                                )}
                            </CardBody>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* How It Works */}
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader className="px-6 pt-6 pb-0">
                            <h3 className="text-base font-semibold text-white">How It Works</h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#D4440D]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-[#D4440D]">1</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Parse Excel</p>
                                        <p className="text-neutral-500">Extracts all items and sales data</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#D4440D]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-[#D4440D]">2</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Calculate Profits</p>
                                        <p className="text-neutral-500">Matches with inventory costs</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#D4440D]/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-[#D4440D]">3</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">Save & Analyze</p>
                                        <p className="text-neutral-500">Stores for reporting and trends</p>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Margin Guide */}
                    <Card className="bg-neutral-900 border-neutral-800">
                        <CardHeader className="px-6 pt-6 pb-0">
                            <h3 className="text-base font-semibold text-white">Margin Guide</h3>
                        </CardHeader>
                        <CardBody className="p-6">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400">Drinks & Mocktails</span>
                                    <Chip size="sm" color="success" variant="flat">60-70%</Chip>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400">Starters & Snacks</span>
                                    <Chip size="sm" color="warning" variant="flat">45-55%</Chip>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-neutral-400">Premium Items</span>
                                    <Chip size="sm" color="danger" variant="flat">30-45%</Chip>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </div>
    )
}
