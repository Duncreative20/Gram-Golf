import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-native-web-vite';

// Storybook MÀN APP (thứ hai, cạnh Storybook @gr/ds cổng 6006): màn thật của apps/golf/app/** xếp theo luồng chức năng.
// Chạy từ gốc repo: pnpm storybook:app --no-open (cổng 6007)
const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const config: StorybookConfig = {
  framework: { name: '@storybook/react-native-web-vite', options: {} },
  stories: ['../flows/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  viteFinal: (cfg) => ({
    ...cfg,
    // Cache Vite riêng trong storybook-app (không ghi node_modules gốc, không giẫm cache của Storybook DS);
    cacheDir: here('../node_modules/.vite'), // có 'node_modules' trong đường dẫn → plugin bỏ qua file deps (để ngoài thì bị transform lại: 'Duplicate export of default')
    define: { ...cfg.define, __DEV__: 'true' },
    resolve: {
      ...cfg.resolve,
      alias: [
        ...(Array.isArray(cfg.resolve?.alias) ? cfg.resolve.alias : []),
        { find: '@gr/ds', replacement: here('../../packages/ds/src') },
        // Khớp ĐÚNG 'expo-router' — 'expo-router/js-tabs' chỉ import type (esbuild xoá) nên không cần stub.
        { find: /^expo-router$/, replacement: here('../stubs/expo-router.tsx') },
      ],
    },
  }),
};
export default config;
