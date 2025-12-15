'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState } from 'react'
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Typography,
    Divider,
    AppBar,
    Toolbar,
    Tooltip,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import HistoryIcon from '@mui/icons-material/History'
import AssessmentIcon from '@mui/icons-material/Assessment'
import Inventory2Icon from '@mui/icons-material/Inventory2'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'

const navigation = [
    { name: 'Dashboard', href: '/', icon: DashboardIcon },
    { name: 'Upload', href: '/upload', icon: CloudUploadIcon },
    { name: 'Sales History', href: '/history', icon: HistoryIcon },
    { name: 'Reports', href: '/reports', icon: AssessmentIcon },
    { name: 'Inventory', href: '/inventory', icon: Inventory2Icon },
]

const DRAWER_WIDTH_EXPANDED = 220
const DRAWER_WIDTH_COLLAPSED = 64

export function Sidebar() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const toggleCollapse = () => {
        setCollapsed(!collapsed)
    }

    const drawerWidth = collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED

    const drawerContent = (isCollapsed: boolean = false) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo Section */}
            <Box sx={{ 
                px: isCollapsed ? 1.5 : 2.5, 
                py: 2.5, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        overflow: 'hidden',
                        bgcolor: 'grey.800',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid',
                        borderColor: 'grey.700',
                    }}
                >
                    <Image
                        src="/logo.png"
                        alt="Crave RestoBar"
                        width={44}
                        height={44}
                        style={{ objectFit: 'cover' }}
                    />
                </Box>
                {!isCollapsed && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} color="white" lineHeight={1.3}>
                            Crave RestoBar
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'grey.500' }}>
                            Profit Tracker
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: 'grey.800' }} />

            {/* Navigation */}
            <List sx={{ flex: 1, px: isCollapsed ? 0.75 : 1, py: 1.5 }}>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    const IconComponent = item.icon

                    const button = (
                        <ListItem key={item.name} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 1,
                                    px: isCollapsed ? 1.25 : 1.5,
                                    minHeight: 40,
                                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                                    bgcolor: isActive ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                    border: isActive ? '1px solid' : '1px solid transparent',
                                    borderColor: isActive ? 'rgba(239, 68, 68, 0.4)' : 'transparent',
                                    '&:hover': {
                                        bgcolor: isActive ? 'rgba(239, 68, 68, 0.2)' : 'grey.900',
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 32 }}>
                                    <IconComponent
                                        sx={{
                                            fontSize: 20,
                                            color: isActive ? '#ef4444' : 'grey.500',
                                        }}
                                    />
                                </ListItemIcon>
                                {!isCollapsed && (
                                    <ListItemText
                                        primary={item.name}
                                        primaryTypographyProps={{
                                            fontSize: 13,
                                            fontWeight: isActive ? 600 : 500,
                                            color: isActive ? '#ef4444' : 'grey.400',
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    )

                    return isCollapsed ? (
                        <Tooltip key={item.name} title={item.name} placement="right" arrow>
                            {button}
                        </Tooltip>
                    ) : button
                })}
            </List>

            <Divider sx={{ borderColor: 'grey.800' }} />

            {/* Collapse Toggle - Desktop only */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, justifyContent: 'center', py: 1 }}>
                <IconButton 
                    onClick={toggleCollapse} 
                    size="small"
                    sx={{ 
                        color: 'grey.500',
                        '&:hover': { color: 'grey.300', bgcolor: 'grey.800' }
                    }}
                >
                    {isCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
                </IconButton>
            </Box>

            {/* Footer */}
            {!isCollapsed && (
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography sx={{ fontSize: 10, color: 'grey.500' }} display="block">
                        Powered by Webb Heads
                    </Typography>
                </Box>
            )}
        </Box>
    )

    return (
        <>
            {/* Mobile App Bar */}
            <AppBar
                position="fixed"
                sx={{
                    display: { md: 'none' },
                    bgcolor: 'grey.900',
                    borderBottom: '1px solid',
                    borderColor: 'grey.800',
                }}
                elevation={0}
            >
                <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56, px: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                overflow: 'visible',
                                bgcolor: 'grey.800',
                                border: '1px solid',
                                borderColor: 'grey.700',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={40}
                                height={40}
                                style={{ objectFit: 'contain', borderRadius: 8 }}
                            />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="white">
                                Crave RestoBar
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'grey.500', display: 'block', lineHeight: 1 }}>
                                Profit Tracker
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        color="inherit"
                        edge="end"
                        onClick={handleDrawerToggle}
                        aria-label="open menu"
                        sx={{ color: 'grey.400' }}
                    >
                        <MenuIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer - Right Side */}
            <Drawer
                variant="temporary"
                anchor="right"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH_EXPANDED,
                        bgcolor: 'grey.900',
                        borderLeft: '1px solid',
                        borderColor: 'grey.800',
                    },
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', p: 0.5 }}>
                    <IconButton onClick={handleDrawerToggle} size="small" sx={{ color: 'grey.400' }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>
                {drawerContent(false)}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        bgcolor: 'grey.900',
                        borderRight: '1px solid',
                        borderColor: 'grey.800',
                        position: 'fixed',
                        height: '100vh',
                        transition: 'width 0.2s ease-in-out',
                        overflowX: 'hidden',
                    },
                }}
            >
                {drawerContent(collapsed)}
            </Drawer>

            {/* Spacer for mobile app bar */}
            <Toolbar variant="dense" sx={{ display: { md: 'none' }, minHeight: 48 }} />
        </>
    )
}
