import { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { BottomSheet, PopoverItem, SelectField, Text, useTheme } from '@gr/ds';
import type { Club, ID } from '../lib/domain';
import { useStore } from '../lib/store';
import { clubById, clubLabel, clubsOf, groupClubs } from '../lib/selectors';

const describe = (c: Club) => `${clubLabel(c)} · ${c.brand} ${c.model}`;

/** Chọn gậy của người chơi: SelectField mở BottomSheet danh sách gậy (chưa lưu trữ) theo nhóm + "Thêm gậy mới". */
export function ClubPicker({ playerId, value, onChange, error }: { playerId: ID; value?: ID; onChange: (id: ID) => void; error?: string }) {
  const t = useTheme();
  const { state } = useStore();
  const [open, setOpen] = useState(false);
  const clubs = clubsOf(state, playerId);
  const selected = clubById(state, value);
  const groups = groupClubs(clubs);
  const before = useRef<Set<ID> | undefined>(undefined); // gậy đã có lúc bấm "Thêm gậy mới"
  // quay lại form sau khi thêm gậy → chọn sẵn gậy vừa thêm (hand-off: không bắt mở lại danh sách)
  useEffect(() => {
    const fresh = before.current && clubs.find((c) => !before.current!.has(c.id));
    if (!fresh) return;
    before.current = undefined;
    onChange(fresh.id);
  }, [clubs.length]);
  return (
    <>
      <SelectField
        label="Gậy"
        placeholder={clubs.length ? 'Chọn gậy' : 'Chưa có gậy — thêm gậy mới'}
        value={selected && describe(selected)}
        error={error}
        onPress={() => setOpen(true)}
        // label mặc định chỉ là "Gậy" → trình đọc màn hình không nghe được gậy đang chọn
        accessibilityLabel={`Gậy, ${selected ? describe(selected) : 'chưa chọn'}`}
      />
      <BottomSheet visible={open} onClose={() => setOpen(false)} heading="Chọn gậy" divider>
        <ScrollView>
          <View accessibilityRole="radiogroup" accessibilityLabel="Gậy">
            {groups.map((g) => (
              <View key={g.label}>
                <Text
                  variant="Label/Small/DemiBold"
                  color="Color/Content/Neutral/Light"
                  accessibilityRole="header"
                  style={{ paddingHorizontal: t.space('Spacing/Padding/Medium'), paddingTop: t.space('Spacing/Padding/Small'), paddingBottom: t.space('Spacing/Padding/2XSmall') }}
                >
                  {g.label}
                </Text>
                {g.clubs.map((c) => (
                  <PopoverItem
                    key={c.id}
                    type="Radio"
                    label={clubLabel(c)}
                    caption={`${c.brand} ${c.model}`}
                    selected={c.id === value}
                    onPress={() => {
                      onChange(c.id);
                      setOpen(false);
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
          <PopoverItem
            icon="plus-line"
            label="Thêm gậy mới"
            onPress={() => {
              before.current = new Set(clubs.map((c) => c.id));
              setOpen(false);
              router.push('/clubs/new');
            }}
          />
        </ScrollView>
      </BottomSheet>
    </>
  );
}
