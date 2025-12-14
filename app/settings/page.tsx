'use client'

import { Card, CardHeader, CardBody } from '@heroui/react'
import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">Settings</h1>
                <p className="text-neutral-500 mt-1">Configure your application preferences</p>
            </div>

            <Card className="bg-neutral-900 border-neutral-800">
                <CardHeader className="px-6 pt-6 pb-0">
                    <h3 className="text-lg font-semibold text-white">Application Settings</h3>
                </CardHeader>
                <CardBody className="p-6">
                    <div className="text-center py-12">
                        <SettingsIcon className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-500">Settings page coming soon</p>
                    </div>
                </CardBody>
            </Card>
        </div>
    )
}
