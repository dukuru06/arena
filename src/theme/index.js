export const colors = {
  bg: '#0A0A12',
  bgElevated: '#12121F',
  card: 'rgba(255,255,255,0.05)',
  cardBorder: 'rgba(255,255,255,0.10)',
  neonBlue: '#00D4FF',
  neonPurple: '#A855F7',
  neonPink: '#EC4899',
  gradient: ['#00D4FF', '#A855F7'],
  gradientDark: ['#12121F', '#0A0A12'],
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  inputBg: 'rgba(255,255,255,0.06)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const typography = {
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  h2: { fontSize: 22, fontWeight: '700', color: colors.text },
  h3: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text },
  caption: { fontSize: 13, color: colors.textSecondary },
  small: { fontSize: 11, color: colors.textMuted },
};

export const shadows = {
  neon: {
    shadowColor: colors.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
};

export const STATUS_COLORS = {
  pending: colors.warning,
  approved: colors.success,
  rejected: colors.danger,
  confirmed: colors.success,
  cancelled: colors.textMuted,
  refunded: colors.neonBlue,
  upcoming: colors.neonBlue,
  live: colors.danger,
  completed: colors.textMuted,
};

export const GAMES = ['Free Fire', 'BGMI', 'PUBG Mobile', 'COD Mobile', 'Valorant', 'Cricket', 'Other'];
export const MODES = ['Solo', 'Duo', 'Squad'];
