'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import {
    LayoutDashboard,
    Upload,
    History,
    FileText,
    Package,
    Menu,
    X
} from 'lucide-react'
import { Button } from '@heroui/react'

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Sales History', href: '/history', icon: History },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Inventory', href: '/inventory', icon: Package },
]

export function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between px-4 py-3 bg-neutral-900 border-b border-neutral-800">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-800">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={32}
                            height={32}
                            className="object-cover"
                        />
                    </div>
                    <span className="font-bold text-white">Crave RestoBar</span>
                </div>
                <Button
                    isIconOnly
                    variant="light"
                    onPress={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
            </div>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div 
                    className="md:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-50
                w-64 bg-neutral-900 border-r border-neutral-800
                transform transition-transform duration-200 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:flex md:flex-col md:min-h-screen
            `}>
                {/* Desktop Logo */}
                <div className="hidden md:flex items-center gap-3 px-6 py-5 border-b border-neutral-800">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-neutral-800">
                        <Image
                            src="/logo.png"
                            alt="Logo"
                            width={40}
                            height={40}
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Crave RestoBar</h1>
                        <p className="text-xs text-neutral-500">Profit Tracker</p>
                    </div>
                </div>

                {/* Mobile Close Button */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                    <span className="font-semibold text-white">Menu</span>
                    <Button
                        isIconOnly
                        variant="light"
                        size="sm"
                        onPress={() => setIsOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium
                                    transition-colors duration-150
                                    ${isActive
                                        ? 'bg-neutral-800 text-white border border-neutral-700'
                                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800">
                    <p className="text-xs text-neutral-500">Powered by Webb Heads</p>
                    <p className="text-xs text-neutral-600 mt-1">Demo Software</p>
                </div>
            </aside>
        </>
    )
}
