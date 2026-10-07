import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

addons.setConfig({ theme: create({ base: 'light', brandTitle: 'Golf Relax Design System', brandUrl: 'https://github.com/Duncreative20/golf-relax-app' }) });
