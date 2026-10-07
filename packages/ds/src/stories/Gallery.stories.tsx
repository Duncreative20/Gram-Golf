import type { Meta, StoryObj } from '@storybook/react-native-web-vite';
import Icon from '../../../../apps/golf/app/(dev)/ds/icon';
import Divider from '../../../../apps/golf/app/(dev)/ds/divider';
import Button from '../../../../apps/golf/app/(dev)/ds/button';
import Badge from '../../../../apps/golf/app/(dev)/ds/badge';
import Avatar from '../../../../apps/golf/app/(dev)/ds/avatar';
import Checkbox from '../../../../apps/golf/app/(dev)/ds/checkbox';
import Segmented from '../../../../apps/golf/app/(dev)/ds/segmented';
import Tab from '../../../../apps/golf/app/(dev)/ds/tab';
import TextField from '../../../../apps/golf/app/(dev)/ds/textfield';
import Popover from '../../../../apps/golf/app/(dev)/ds/popover';
import TopNav from '../../../../apps/golf/app/(dev)/ds/topnav';
import BottomNav from '../../../../apps/golf/app/(dev)/ds/bottomnav';
import BottomSheet from '../../../../apps/golf/app/(dev)/ds/bottomsheet';
import PageIndicator from '../../../../apps/golf/app/(dev)/ds/pageindicator';
import Radio from '../../../../apps/golf/app/(dev)/ds/radio';
import Toggle from '../../../../apps/golf/app/(dev)/ds/toggle';
import Chip from '../../../../apps/golf/app/(dev)/ds/chip';
import Tag from '../../../../apps/golf/app/(dev)/ds/tag';
import ListItem from '../../../../apps/golf/app/(dev)/ds/listitem';
import Feedback from '../../../../apps/golf/app/(dev)/ds/feedback';
import Progress from '../../../../apps/golf/app/(dev)/ds/progress';
import Input2 from '../../../../apps/golf/app/(dev)/ds/input2';
import Input3 from '../../../../apps/golf/app/(dev)/ds/input3';
import DatePicker from '../../../../apps/golf/app/(dev)/ds/datepicker';
import Misc from '../../../../apps/golf/app/(dev)/ds/misc';
import Post from '../../../../apps/golf/app/(dev)/ds/post';
import Story from '../../../../apps/golf/app/(dev)/ds/story';
import Comment from '../../../../apps/golf/app/(dev)/ds/comment';
import Social from '../../../../apps/golf/app/(dev)/ds/social';

/**
 * Gallery = 28 trang `apps/golf/app/(dev)/ds/*` (cùng mã chạy trong Expo Go) nhúng nguyên trang vào Storybook
 * để soi toàn bộ DS theo theme/viewport; story theo component có Controls nằm ở các nhóm Controls/Input/….
 */
const meta = { title: 'Gallery', parameters: { layout: 'fullscreen' } } satisfies Meta;
export default meta;
type S = StoryObj<typeof meta>;

export const IconStory: S = { name: 'Icon · 1230', render: () => <Icon /> };
export const DividerStory: S = { name: 'Divider', render: () => <Divider /> };
export const ButtonStory: S = { name: 'Button · IconButton', render: () => <Button /> };
export const BadgeStory: S = { name: 'Badge', render: () => <Badge /> };
export const AvatarStory: S = { name: 'Avatar', render: () => <Avatar /> };
export const CheckboxStory: S = { name: 'Checkbox', render: () => <Checkbox /> };
export const SegmentedStory: S = { name: 'Segmented', render: () => <Segmented /> };
export const TabStory: S = { name: 'Tab-Bar', render: () => <Tab /> };
export const TextFieldStory: S = { name: 'TextField · SearchField', render: () => <TextField /> };
export const PopoverStory: S = { name: 'Popover', render: () => <Popover /> };
export const TopNavStory: S = { name: 'Top-Navigation', render: () => <TopNav /> };
export const BottomNavStory: S = { name: 'Bottom-Navigation', render: () => <BottomNav /> };
export const BottomSheetStory: S = { name: 'Bottom-Sheet', render: () => <BottomSheet /> };
export const PageIndicatorStory: S = { name: 'Page-Indicator', render: () => <PageIndicator /> };
export const RadioStory: S = { name: 'Radio · Checkbox row', render: () => <Radio /> };
export const ToggleStory: S = { name: 'Toggle', render: () => <Toggle /> };
export const ChipStory: S = { name: 'Chip', render: () => <Chip /> };
export const TagStory: S = { name: 'Tag', render: () => <Tag /> };
export const ListItemStory: S = { name: 'List-Item · Card · Accordion', render: () => <ListItem /> };
export const FeedbackStory: S = { name: 'Alert · Inline · Toast · Tooltip · Dialog', render: () => <Feedback /> };
export const ProgressStory: S = { name: 'Progress · Skeleton · Pagination · Breadcrumbs · Stepper', render: () => <Progress /> };
export const Input2Story: S = { name: 'TextArea · Select · OTP · StepperControl · Search/Overlay', render: () => <Input2 /> };
export const Input3Story: S = { name: 'Message-Input · Date-Field · Number-Field · Field-Group', render: () => <Input3 /> };
export const DatePickerStory: S = { name: 'Date-Picker · Wheel', render: () => <DatePicker /> };
export const MiscStory: S = { name: 'Dock-Icon · Connector · Color · AvatarGroup · Empty', render: () => <Misc /> };
export const PostStory: S = { name: 'Post-Card · Post-Media · Post-action · Pill', render: () => <Post /> };
export const StoryViewerStory: S = { name: 'Story-Viewer', render: () => <Story /> };
export const CommentStory: S = { name: 'Comment-Item · Thread · Composer · Comments-Sheet', render: () => <Comment /> };
export const SocialStory: S = { name: 'Likes · Share · Collection · Media-Item', render: () => <Social /> };
