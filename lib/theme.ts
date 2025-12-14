/**
 * Crave RestoBar Brand Theme Configuration
 * Primary: Deep Orange/Rustic Red (#D4440D - warm, energetic)
 * Secondary: Dark Charcoal (#1a1a1a - sophisticated)
 * Accent: Gold (#FFA500 - premium feel)
 */

export const theme = {
    colors: {
        // Primary brand colors
        primary: '#D4440D', // Deep orange-red (brand color)
        primaryLight: '#F5703F', // Lighter variant for hover states
        primaryDark: '#A53308', // Darker variant for active states
        
        // Secondary/Background
        background: '#0f0f0f', // Almost black, deep and sophisticated
        surfaceLight: '#1a1a1a', // For cards and containers
        surfaceLighter: '#242424', // For hover states
        
        // Accent colors
        accent: '#FFA500', // Gold/amber for highlights
        accentLight: '#FFB84D',
        
        // Semantic colors
        success: '#10B981', // Green
        warning: '#F59E0B', // Amber
        error: '#EF4444', // Red
        info: '#3B82F6', // Blue
        
        // Text
        textPrimary: '#FFFFFF',
        textSecondary: '#A3A3A3',
        textTertiary: '#666666',
        
        // Borders
        borderLight: '#2a2a2a',
        borderMedium: '#3a3a3a',
    },
    
    gradients: {
        primaryGradient: 'linear-gradient(135deg, #D4440D 0%, #F5703F 100%)',
        darkGradient: 'linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%)',
        goldGradient: 'linear-gradient(135deg, #FFA500 0%, #FFB84D 100%)',
    },
    
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
        md: '0 4px 6px 0 rgba(0, 0, 0, 0.6)',
        lg: '0 10px 15px 0 rgba(0, 0, 0, 0.7)',
        xl: '0 20px 25px 0 rgba(0, 0, 0, 0.8)',
    },
    
    transitions: {
        fast: '150ms',
        base: '300ms',
        slow: '500ms',
    }
}

// Tailwind class shortcuts
export const tw = {
    // Button variants
    btnPrimary: 'bg-[#D4440D] hover:bg-[#F5703F] text-white font-semibold transition-colors',
    btnPrimaryOutline: 'border-2 border-[#D4440D] text-[#D4440D] hover:bg-[#D4440D]/10 transition-colors',
    btnSecondary: 'bg-[#1a1a1a] hover:bg-[#242424] text-white transition-colors',
    
    // Card backgrounds
    cardBg: 'bg-[#1a1a1a] border border-[#2a2a2a]',
    
    // Text
    textMuted: 'text-[#A3A3A3]',
    textSubtle: 'text-[#666666]',
    
    // Inputs
    inputBase: 'bg-[#0f0f0f] border border-[#2a2a2a] text-white placeholder:text-[#666666] focus:border-[#D4440D] focus:ring-1 focus:ring-[#D4440D]',
}
