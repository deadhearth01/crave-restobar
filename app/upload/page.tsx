'use client'

import { useState, useRef } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DescriptionIcon from '@mui/icons-material/Description'
import CloseIcon from '@mui/icons-material/Close'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import BoltIcon from '@mui/icons-material/Bolt'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
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
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Main Content */}
            <Box sx={{ 
                maxWidth: 700,
                mx: 'auto',
                width: '100%'
            }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" component="h1" fontWeight="bold" color="white">
                        Upload Sales Data
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Import your daily Excel file to calculate profits
                    </Typography>
                </Box>

                {/* Drop Zone Card */}
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, width: '100%', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Box
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            sx={{
                                border: '2px dashed',
                                borderColor: file ? 'success.main' : 'grey.600',
                                bgcolor: file ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.02)',
                                borderRadius: 2,
                                p: { xs: 4, md: 5 },
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                minHeight: 180,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                    borderColor: file ? 'success.main' : '#ef4444',
                                    bgcolor: file ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.05)',
                                },
                            }}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                {file ? (
                                    <>
                                        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <DescriptionIcon sx={{ fontSize: 32, color: 'success.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="body1" fontWeight={600} color="white">{file.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {(file.size / 1024).toFixed(1)} KB
                                            </Typography>
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <CloudUploadIcon sx={{ fontSize: 36, color: '#ef4444' }} />
                                        </Box>
                                        <Box sx={{ textAlign: 'center' }}>
                                            <Typography variant="h6" fontWeight={600} color="white">
                                                Drag & drop your file here
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                or click to browse • Excel files only (.xlsx, .xls)
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Box>

                        {/* Error */}
                        {error && (
                            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 1.5 }}>
                                <ErrorIcon sx={{ color: 'error.main', flexShrink: 0, fontSize: 18 }} />
                                <Typography variant="caption" color="error.light">{error}</Typography>
                            </Box>
                        )}

                        {/* Action Buttons */}
                        {file && !parseResult && (
                            <Box sx={{ mt: 2, display: 'flex', gap: 1.5 }}>
                                <Button
                                    variant="contained"
                                    onClick={processFile}
                                    disabled={isProcessing}
                                    size="small"
                                    startIcon={!isProcessing && <BoltIcon sx={{ fontSize: 16 }} />}
                                    sx={{
                                        flex: 1,
                                        bgcolor: '#ef4444',
                                        color: 'white',
                                        py: 1,
                                        fontWeight: 600,
                                        '&:hover': { bgcolor: '#dc2626' },
                                    }}
                                >
                                    {isProcessing ? 'Processing...' : 'Process & Calculate'}
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="small" 
                                    onClick={clearFile} 
                                    sx={{ borderColor: 'grey.600', color: 'grey.400', px: 1.5, minWidth: 'auto' }}
                                >
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                </Button>
                            </Box>
                        )}

                        {/* Progress Steps */}
                        {step > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {[
                                    { num: 1, label: 'Parsing Excel file...' },
                                    { num: 2, label: 'Calculating profits...' },
                                    { num: 3, label: 'Saving to database...' },
                                ].map((s) => (
                                    <Box key={s.num} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box sx={{ 
                                            width: 20, 
                                            height: 20, 
                                            borderRadius: '50%', 
                                            bgcolor: step >= s.num ? 'success.main' : 'grey.700', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            {step > s.num ? (
                                                <CheckCircleIcon sx={{ fontSize: 12, color: 'white' }} />
                                            ) : (
                                                <Typography sx={{ fontSize: 10, color: 'white', fontWeight: 600 }}>{s.num}</Typography>
                                            )}
                                        </Box>
                                        <Typography variant="caption" color={step >= s.num ? 'white' : 'text.secondary'}>
                                            {s.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </CardContent>
                </Card>

                {/* Parse Result */}
                {parseResult && (
                    <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, width: '100%', mb: 2 }}>
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                                <Typography variant="body1" fontWeight={600} color="white">Parsed Successfully</Typography>
                            </Box>
                            
                            {/* Summary Grid */}
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 2 }}>
                                <Box sx={{ bgcolor: 'grey.800', borderRadius: 1.5, p: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Items</Typography>
                                    <Typography variant="body1" fontWeight="bold" color="white">{parseResult.summary.totalItems}</Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'grey.800', borderRadius: 1.5, p: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Orders</Typography>
                                    <Typography variant="body1" fontWeight="bold" color="white">{parseResult.summary.totalOrders}</Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'grey.800', borderRadius: 1.5, p: 1.5 }}>
                                    <Typography variant="caption" color="text.secondary">Revenue</Typography>
                                    <Typography variant="body1" fontWeight="bold" color="white">{formatCurrency(parseResult.summary.totalRevenue)}</Typography>
                                </Box>
                                <Box sx={{ bgcolor: 'rgba(34, 197, 94, 0.15)', borderRadius: 1.5, p: 1.5, border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                                    <Typography variant="caption" sx={{ color: '#22c55e' }}>Profit</Typography>
                                    <Typography variant="body1" fontWeight="bold" sx={{ color: '#22c55e' }}>{formatCurrency(parseResult.summary.totalProfit)}</Typography>
                                </Box>
                            </Box>

                            {/* Category Breakdown */}
                            {parseResult.categories?.length > 0 && (
                                <Box sx={{ bgcolor: 'rgba(38, 38, 38, 0.5)', borderRadius: 1.5, p: 1.5, mb: 1.5 }}>
                                    <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1, display: 'block', letterSpacing: 0.5 }}>
                                        Category Breakdown
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {parseResult.categories.map((cat: { name: string; totalQuantity: number; totalRevenue: number; avgMargin: number }, i: number) => (
                                            <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="caption" color="text.secondary">{cat.name}</Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Typography variant="caption" color="text.secondary">{cat.totalQuantity}</Typography>
                                                    <Typography variant="caption" fontWeight={600} color="white">{formatCurrency(cat.totalRevenue)}</Typography>
                                                    <Chip
                                                        size="small"
                                                        label={`${cat.avgMargin}%`}
                                                        color={cat.avgMargin >= 50 ? 'success' : cat.avgMargin >= 40 ? 'warning' : 'error'}
                                                        sx={{ height: 18, '& .MuiChip-label': { px: 0.75, fontSize: 10 } }}
                                                    />
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}

                            {/* Net Margin */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'rgba(38, 38, 38, 0.5)', borderRadius: 1.5, p: 1.5, border: '1px solid #404040' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <TrendingUpIcon sx={{ color: 'grey.300', fontSize: 16 }} />
                                    <Typography variant="body2" fontWeight={600} color="white">Net Profit Margin</Typography>
                                </Box>
                                <Typography variant="body1" fontWeight="bold" color="grey.100">{parseResult.summary.netMargin}%</Typography>
                            </Box>

                            {step === 3 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.5, bgcolor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: 1.5, mt: 1.5 }}>
                                    <CheckCircleIcon sx={{ color: 'success.main', fontSize: 16 }} />
                                    <Typography variant="caption" sx={{ color: '#22c55e' }}>Saved! Redirecting to report...</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* How It Works - At Bottom */}
                <Card sx={{ bgcolor: 'background.paper', borderRadius: 2, width: '100%', mt: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="body1" fontWeight={600} color="white" sx={{ mb: 2, textAlign: 'center' }}>
                            How It Works
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, justifyContent: 'space-around' }}>
                            {[
                                { num: 1, title: 'Parse Excel', desc: 'Extracts items and sales data' },
                                { num: 2, title: 'Calculate Profits', desc: 'Matches with inventory costs' },
                                { num: 3, title: 'Save & Analyze', desc: 'Stores for reporting' },
                            ].map((item) => (
                                <Box key={item.num} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, flex: 1 }}>
                                    <Box sx={{ 
                                        width: 28, 
                                        height: 28, 
                                        borderRadius: '50%', 
                                        bgcolor: 'rgba(239, 68, 68, 0.2)', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        flexShrink: 0 
                                    }}>
                                        <Typography sx={{ fontSize: 12, fontWeight: 'bold', color: '#ef4444' }}>{item.num}</Typography>
                                    </Box>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600} color="white">{item.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{item.desc}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    )
}
