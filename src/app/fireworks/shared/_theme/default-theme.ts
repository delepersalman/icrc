import { ThemeConfig } from './theme-config';

export const DEFAULT_THEME: ThemeConfig = {
  themeId: 'default-theme-id',
  mainColors: {
    primaryColor: '#ff2567',
    accentColor: '#1b5e20',
    warnColor: '#b71c1c'
  },
  components: {
    fireworksContent: {
      label: 'Fireworks content',
      colors: {
        backgroundColor: '#ff2567',
        hoverBackgroundColor: '#ff2567',
        textColor: '#000',
        hoverTextColor: '#ff2567'
      }
    }
  }
};
