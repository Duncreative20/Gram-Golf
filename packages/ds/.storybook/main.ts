import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Storybook = showcase chuẩn ngành cho @gr/ds (theo khuôn GWT Design System). Story đặt CẠNH component: src/ui/**/<Tên>.stories.tsx;
// story "Gallery/*" nhúng 28 trang apps/golf/app/(dev)/ds. Chạy: pnpm -F @gr/ds storybook (cổng 6006).
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const config: StorybookConfig = {
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  stories: ['../src/**/*.stories.@(ts|tsx)', '../src/**/*.mdx'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  // Props autodocs bằng react-docgen-typescript (đúng union/extends hơn react-docgen).
  typescript: { reactDocgen: 'react-docgen-typescript' },
  // Repo private — không gửi telemetry.
  core: { disableTelemetry: true },
  viteFinal: (cfg) => ({
    ...cfg,
    resolve: {
      ...cfg.resolve,
      alias: [
        ...(Array.isArray(cfg.resolve?.alias) ? cfg.resolve.alias : []),
        { find: '@gr/ds', replacement: here('../src') },
        // Trang gallery import router của expo — trong Storybook không có Expo Router → stub no-op.
        { find: 'expo-router', replacement: here('./stubs/expo-router.tsx') },
      ],
    },
  }),
};
export default config;
