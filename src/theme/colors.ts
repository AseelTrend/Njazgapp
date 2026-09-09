export const AppColors = {
  // طبقات الخلفية
  bg: '#111016',
  bg2: '#17131E',
  card: '#1D1924',
  card2: '#26202F',
  card3: '#332A40',
  border: 'rgba(255, 255, 255, 0.07)',

  // الألوان الأساسية
  primary: '#9B5CFF',
  primaryDark: '#5B2A9D',
  accentPurple: '#8B45E8',
  cyan: '#22D3EE',
  gold: '#FBBF24',
  green: '#34D399',
  red: '#F87171',
  purple: '#C084FC',

  // النصوص
  text: '#F4EFFA',
  text2: '#A99DB7',
  text3: '#6F637B',

  // تدرج بطاقة الرصيد
  balanceGradient: 'linear-gradient(135deg, #B14BFF 0%, #6825B3 100%)',

  // ألوان دائرية متنوعة للأيقونات
  iconPalette: ['#8B45E8', '#C084FC', '#9B5CFF', '#22D3EE', '#34D399', '#F87171'],

  iconColorFor: (index: number) => {
    const palette = ['#8B45E8', '#C084FC', '#9B5CFF', '#22D3EE', '#34D399', '#F87171'];
    return palette[index % palette.length];
  },
};
