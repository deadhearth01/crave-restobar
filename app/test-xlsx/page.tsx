'use client'

import { useState } from 'react'
import * as XLSX from 'xlsx'

export default function TestXLSXPage() {
    const [message, setMessage] = useState('Testing XLSX...')
    const [result, setResult] = useState<any>(null)

    const testXLSX = () => {
        try {
            console.log('XLSX library:', XLSX)
            console.log('XLSX.version:', (XLSX as any).version)
            console.log('XLSX.read:', XLSX.read)
            console.log('XLSX.utils:', XLSX.utils)
            
            setMessage('✓ XLSX library is loaded correctly!')
            setResult({
                version: (XLSX as any).version,
                hasRead: !!XLSX.read,
                hasUtils: !!XLSX.utils,
                hasSheetToJson: !!XLSX.utils.sheet_to_json
            })
        } catch (error: any) {
            setMessage(`✗ Error: ${error.message}`)
            setResult(null)
        }
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h1>XLSX Library Test</h1>
            <button onClick={testXLSX} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
                Test XLSX
            </button>
            <p>{message}</p>
            {result && (
                <pre style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '4px' }}>
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    )
}
