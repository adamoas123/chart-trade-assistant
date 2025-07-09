import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				danger: {
					DEFAULT: 'hsl(var(--danger))',
					foreground: 'hsl(var(--danger-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				chart: {
					buy: 'hsl(var(--chart-buy))',
					sell: 'hsl(var(--chart-sell))',
					neutral: 'hsl(var(--chart-neutral))',
					grid: 'hsl(var(--chart-grid))'
				},
				'neon-cyan': 'hsl(var(--neon-cyan))',
				'neon-purple': 'hsl(var(--neon-purple))',
				'neon-green': 'hsl(var(--neon-green))',
				'neon-red': 'hsl(var(--neon-red))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-success': 'var(--gradient-success)',
				'gradient-danger': 'var(--gradient-danger)',
				'gradient-card': 'var(--gradient-card)'
			},
			boxShadow: {
				'elegant': 'var(--shadow-elegant)',
				'glow': 'var(--shadow-glow)',
				'neon': 'var(--shadow-neon)'
			},
			transitionTimingFunction: {
				'smooth': 'var(--transition-smooth)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'slide-left-right': {
					'0%, 100%': { 
						transform: 'translateX(-30%) translateY(-50%)' 
					},
					'50%': { 
						transform: 'translateX(30%) translateY(-50%)' 
					}
				},
				'mouth-hungry': {
					'0%, 100%': { 
						transform: 'scaleY(0.8) scaleX(1.0)',
						borderColor: 'rgba(127, 29, 29, 0.6)'
					},
					'50%': { 
						transform: 'scaleY(1.1) scaleX(1.05)',
						borderColor: 'rgba(220, 38, 38, 0.8)'
					}
				},
				'tongue-wiggle': {
					'0%, 100%': { 
						transform: 'translateX(-50%) translateY(0) rotate(-2deg)'
					},
					'33%': { 
						transform: 'translateX(-50%) translateY(2px) rotate(1deg)'
					},
					'66%': { 
						transform: 'translateX(-50%) translateY(-1px) rotate(-1deg)'
					}
				},
				'drool-drop': {
					'0%': { 
						opacity: '0',
						transform: 'translateX(-50%) scaleY(0)'
					},
					'30%': { 
						opacity: '0.6',
						transform: 'translateX(-50%) scaleY(0.5)'
					},
					'70%': { 
						opacity: '0.8',
						transform: 'translateX(-50%) scaleY(1)'
					},
					'100%': { 
						opacity: '0',
						transform: 'translateX(-50%) scaleY(1.2) translateY(10px)'
					}
				},
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'slide-left-right': 'slide-left-right 2s ease-in-out infinite',
				'mouth-hungry': 'mouth-hungry 1.5s ease-in-out infinite',
				'tongue-wiggle': 'tongue-wiggle 1s ease-in-out infinite',
				'drool-drop': 'drool-drop 2s ease-in-out infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
