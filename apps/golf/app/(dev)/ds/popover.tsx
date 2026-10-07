import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { PopoverItem, Screen, Text, useTheme } from '@gr/ds';

const photo = require('../../../assets/images/intro-booking.jpg');

export default function PopoverGallery() {
  const t = useTheme();
  const [r, setR] = useState(0);
  const card = { backgroundColor: t.color('Color/Background/Surface/Default'), borderRadius: t.radius('Corner-Radius/Large'), padding: t.space('Spacing/Padding/2XSmall'), ...t.shadow('Effect/Popover') };
  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: t.layout('Margin-Small'), gap: t.space('Spacing/Gap/Large') }}>
        <Text variant="Heading/Subheading">Popover/Item-Select</Text>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Type=Radio</Text>
        <View style={card}>
          {['Mới nhất', 'Phổ biến', 'Gần tôi'].map((l, i) => <PopoverItem key={l} type="Radio" label={l} caption={i === 0 ? 'Sắp xếp theo thời gian' : undefined} selected={r === i} onPress={() => setR(i)} />)}
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Type=Item · icon · trailing · Single-Selected</Text>
        <View style={card}>
          <PopoverItem type="Item" icon="edit-01-line" label="Chỉnh sửa" />
          <PopoverItem type="Item" icon="share-01-line" label="Chia sẻ" trailingIcon="chevron-right-line-medium" />
          <PopoverItem type="Item" icon="check-circle-line" label="Đã chọn" selected />
          <PopoverItem type="Item" icon="trash-line" label="Xoá bài viết" caption="Không thể hoàn tác" />
        </View>
        <Text variant="Caption/Regular" color="Color/Content/Neutral/Light">Type=Follow-User · Like</Text>
        <View style={card}>
          <PopoverItem type="Follow-User" avatar={photo} label="Vũ An" caption="@birdiehunter101" followText="Theo dõi" onFollow={() => {}} />
          <PopoverItem type="Like" avatar={photo} label="Minh Quân" caption="2 giờ trước" trailingIcon="heart-solid" />
        </View>
      </ScrollView>
    </Screen>
  );
}
