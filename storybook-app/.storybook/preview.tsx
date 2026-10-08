import type { Preview } from '@storybook/react-native-web-vite';
import ds from '../../packages/ds/.storybook/preview';
import './shot.css';

// Dùng lại preview của Storybook DS (theme light/dark + emphasis, viewport 390, SafeAreaProvider, font MiSans).
// Khác DS: màn app luôn fullscreen; sắp xếp Luồng F01…F13, bước theo số ('01 · …' < '02 · …' < '10 · …').
// storySort phải viết inline (Storybook đọc tĩnh file này), không lấy từ biến.
const preview: Preview = {
  ...ds,
  parameters: {
    ...ds.parameters,
    layout: 'fullscreen',
    options: { storySort: { method: 'alphabetical', includeNames: true, order: ['Luồng'] } },
  },
};
export default preview;
