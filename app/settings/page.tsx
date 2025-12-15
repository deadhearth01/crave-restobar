'use client'

import { Card, CardContent, Typography, Box } from '@mui/material'
import SettingsIcon from '@mui/icons-material/Settings'

export default function SettingsPage() {
    return (
        <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
                <Typography variant="h4" fontWeight="bold" color="white">
                    Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Configure your application preferences
                </Typography>
            </Box>

            <Card sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} color="white" sx={{ mb: 3 }}>
                        Application Settings
                    </Typography>
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <SettingsIcon sx={{ width: 64, height: 64, color: 'text.disabled', mb: 2 }} />
                        <Typography variant="body1" color="text.secondary">
                            Settings page coming soon
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
