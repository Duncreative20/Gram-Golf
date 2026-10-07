import type { Decorator, Preview } from '@storybook/react-native-web-vite';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { createTheme } from '../src/theme/createTheme';
import './fonts.css';

// Theme = toolbar light/dark + emphasis (mặc định brand = app GramGolf) → ThemeProvider (context, không data-attribute); nền canvas theo token; viewport 390 mặc định (app mobile).
const withTheme: Decorator = (Story, ctx) => {
  const scheme = ctx.globals.theme === 'dark' ? 'dark' : 'light';
  const emphasis = ctx.globals.emphasis === 'neutral' ? 'neutral' : 'brand';
  const t = createTheme({ scheme });
  const bg = t.color('Color/Background/Canvas/Alt');
  useEffect(() => {
    document.documentElement.style.background = bg;
    document.documentElement.style.colorScheme = scheme;
  }, [bg, scheme]);
  return (
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 0, left: 0, right: 0, bottom: 0 } }}>
      <ThemeProvider scheme={scheme} emphasis={emphasis}>
        <View nativeID="sb-content" style={ctx.parameters.layout === 'fullscreen' ? { flex: 1, minHeight: '100%', backgroundColor: bg } : { backgroundColor: bg, padding: t.layout('Margin-Small') }}>
          <Story />
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Light / dark theme của DS',
      toolbar: { title: 'Theme', icon: 'paintbrush', dynamicTitle: true, items: [{ value: 'light', title: 'light theme', icon: 'sun' }, { value: 'dark', title: 'dark theme', icon: 'moon' }] },
    },
    emphasis: {
      description: 'Emphasis của DS (app GramGolf chạy brand)',
      toolbar: { title: 'Emphasis', icon: 'contrast', dynamicTitle: true, items: [{ value: 'brand', title: 'Brand' }, { value: 'neutral', title: 'Neutral' }] },
    },
  },
  initialGlobals: { theme: 'light', emphasis: 'brand', viewport: { value: 'mobile' } },
  parameters: {
    // a11y: addon chỉ hiện vi phạm trong panel (chưa có @storybook/addon-vitest → không gate). Gate hàng loạt = `scripts/audit-storybook.mjs` (axe-core từng story).
    a11y: { test: 'error' },
    backgrounds: { disable: true },
    viewport: {
      options: {
        mobile: { name: 'Mobile 390', styles: { width: '390px', height: '844px' } },
        mobileL: { name: 'Mobile 430', styles: { width: '430px', height: '932px' } },
        tablet: { name: 'Tablet 768', styles: { width: '768px', height: '1024px' } },
      },
    },
    options: { storySort: { order: ['Giới thiệu', 'Controls', 'Input', 'Navigation', 'Feedback', 'Data', 'Social', 'Gallery'] } },
  },
};
export default preview;
