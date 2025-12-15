'use client'

import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#a1a1aa', // neutral-400
            light: '#d4d4d8',
            dark: '#71717a',
        },
        secondary: {
            main: '#22c55e', // green-500
            light: '#4ade80',
            dark: '#16a34a',
        },
        background: {
            default: '#0a0a0a', // neutral-950
            paper: '#171717', // neutral-900
        },
        error: {
            main: '#ef4444',
        },
        warning: {
            main: '#f59e0b',
        },
        success: {
            main: '#22c55e',
        },
        info: {
            main: '#3b82f6',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
        },
        divider: '#262626', // neutral-800
    },
    typography: {
        fontFamily: 'inherit',
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#0a0a0a',
                    color: '#ffffff',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
            defaultProps: {
                disableElevation: true,
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    border: '1px solid #262626',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottomColor: '#262626',
                },
                head: {
                    backgroundColor: '#262626',
                    color: '#a1a1aa',
                    fontWeight: 600,
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#171717',
                    border: '1px solid #262626',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#404040',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#525252',
                    },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiSkeleton: {
            styleOverrides: {
                root: {
                    backgroundColor: '#262626',
                },
            },
        },
    },
})

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    )
}
