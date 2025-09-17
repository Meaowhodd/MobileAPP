
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView, StyleSheet, Text,
  TouchableOpacity, useColorScheme,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { fetchNotifications, loadCached, saveCached, UI } from '../services/notifications';

dayjs.extend(relativeTime);
// เปลี่ยน locale ตรงนี้: 'th' หรือ 'en'
dayjs.locale('en');

// ---- i18n แบบเบา ๆ ----
const t = (key, lang='th') => ({
  th: {
    notifications: 'การแจ้งเตือน',
    clearAll: 'ล้างทั้งหมด',
    recent: 'ล่าสุด',
    markAll: 'ทำเป็นอ่านทั้งหมด',
    allCaughtUp: 'อ่านครบแล้ว',
    emptyLine: 'คุณไม่มีการแจ้งเตือนใหม่',
    read: 'อ่านแล้ว',
    delete: 'ลบ',
    accessibilityClearAll: 'ปุ่มล้างการแจ้งเตือนทั้งหมด',
    accessibilityMarkAll: 'ปุ่มทำเป็นอ่านทั้งหมด',
  },
  en: {
    notifications: 'Notifications',
    clearAll: 'Clear All',
    recent: 'Recent',
    markAll: 'Mark all as read',
    allCaughtUp: 'All caught up',
    emptyLine: "You don’t have any notifications.",
    read: 'Read',
    delete: 'Delete',
    accessibilityClearAll: 'Clear all notifications button',
    accessibilityMarkAll: 'Mark all as read button',
  }
}[lang][key]);

const LANG = 'en'; // เปลี่ยนได้หรือโยงกับ setting แอปก็ได้

const PAGE_SIZE = 10;

function RightActions({ onRead, onDelete }) {
  return (
    <View style={{ flexDirection: 'row' }}>
      <TouchableOpacity onPress={onRead} style={{ padding: 16, backgroundColor: '#1f66f2' }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>{t('read', LANG)}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={{ padding: 16, backgroundColor: '#ff3333' }}>
        <Text style={{ color: '#fff', fontWeight: '600' }}>{t('delete', LANG)}</Text>
      </TouchableOpacity>
    </View>
  );
}

function NotificationItem({ item, onPress }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        { borderLeftColor: UI.LEFT_BAR[item.type], backgroundColor: UI.BG[item.type], opacity: item.read ? 0.7 : 1 }
      ]}
      accessibilityRole="button"
      accessibilityLabel={item.title}
    >
      <View style={styles.row}>
        <View style={styles.iconBubble}>
          <Text style={styles.iconText}>{UI.EMOJI[item.type]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.desc}</Text>
          <Text style={styles.timeText}>{dayjs(item.ts).fromNow()}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function InboxScreen({ navigation }) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = isDark
    ? { bg:'#000', text:'#fff', card:'#111', border:'#333' }
    : { bg:'#fff', text:'#111', card:'#fff', border:'#ddd' };

  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // โหลด cache ก่อน (เปิดแอปครั้งแรกมีของโชว์เลย)
  useEffect(() => {
    (async () => {
      const cached = await loadCached();
      if (cached) setData(cached);
      // จากนั้นยิงหน้าแรก
      refreshFirstPage();
    })();
  }, []);

  // อัปเดต badge ที่ Tab (ถ้ามี React Navigation tabs)
  const unreadCount = useMemo(() => data.filter(d => !d.read).length, [data]);
  useEffect(() => {
    // ถ้าใช้ BottomTabs: เรียกจากหน้าลูก
    // NOTE: ปรับตามโครงสร้างแอปคุณ ถ้าไม่มี tabs ให้ลบส่วนนี้ได้
    const parent = navigation?.getParent?.();
    if (parent?.setOptions) {
      parent.setOptions({ tabBarBadge: unreadCount > 0 ? unreadCount : undefined });
    }
  }, [unreadCount, navigation]);

  const refreshFirstPage = useCallback(async () => {
    setRefreshing(true);
    const res = await fetchNotifications({ page: 1, limit: PAGE_SIZE });
    setData(res.items);
    setPage(1);
    setTotal(res.total);
    setHasMore(res.items.length > 0);
    setRefreshing(false);
    saveCached(res.items).catch(() => {});
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const res = await fetchNotifications({ page: next, limit: PAGE_SIZE });
    setData(prev => {
      const merged = [...prev, ...res.items];
      saveCached(merged).catch(() => {});
      return merged;
    });
    setPage(next);
    setTotal(res.total);
    setHasMore(res.items.length > 0);
    setLoadingMore(false);
  }, [loadingMore, hasMore, page]);

  const markAllRead = () => {
    setData(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      saveCached(updated).catch(() => {});
      return updated;
    });
  };
  const clearAll = () => {
    setData([]);
    setHasMore(false);
    saveCached([]).catch(() => {});
  };
  const markRead = (id) => {
    setData(prev => {
      const updated = prev.map(n => (n.id === id ? { ...n, read: true } : n));
      saveCached(updated).catch(() => {});
      return updated;
    });
  };
  const removeItem = (id) => {
    setData(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveCached(updated).catch(() => {});
      return updated;
    });
  };

  const renderItem = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <RightActions
          onRead={() => markRead(item.id)}
          onDelete={() => removeItem(item.id)}
        />
      )}
    >
      <NotificationItem item={item} onPress={() => markRead(item.id)} />
    </Swipeable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notifications', LANG)}</Text>
        <TouchableOpacity
          onPress={clearAll}
          accessibilityRole="button"
          accessibilityLabel={t('accessibilityClearAll', LANG)}
        >
          <Text style={styles.clearAll}> {t('clearAll', LANG)} </Text>
        </TouchableOpacity>
      </View>

      {/* Sub header */}
      <View style={[styles.subHeader, { borderBottomColor: colors.border }]}>
        <Text style={[styles.recent, { color: colors.text }]}>
          {t('recent', LANG)} {unreadCount > 0 ? `(${unreadCount} new)` : ''}
        </Text>
        <TouchableOpacity
          onPress={markAllRead}
          accessibilityRole="button"
          accessibilityLabel={t('accessibilityMarkAll', LANG)}
        >
          <Text style={styles.markAll}>{t('markAll', LANG)}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        contentContainerStyle={styles.listContent}
        data={data}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        refreshing={refreshing}
        onRefresh={refreshFirstPage}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyTitle}>{t('allCaughtUp', LANG)}</Text>
            <Text style={styles.emptyDesc}>{t('emptyLine', LANG)}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    backgroundColor: '#1f66f2',
    paddingTop: 8, paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  headerTitle: { fontSize: 22, color: '#fff', fontWeight: 'bold' },
  clearAll: { fontSize: 14, color: 'red', fontWeight: 'bold' }, // 🔴 ตามที่คุณต้องการ

  subHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 10,
    borderBottomWidth: 1,
  },
  recent: { fontSize: 16, fontWeight: 'bold' },
  markAll: { fontSize: 14, color: '#999' },

  listContent: { padding: 15 },

  card: {
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  row: { flexDirection: 'row', gap: 10 },
  iconBubble: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  iconText: { fontSize: 16 },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#111' },
  desc: { fontSize: 14, color: '#444' },
  timeText: { marginTop: 6, fontSize: 12, color: '#666' },

  emptyBox: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 42, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  emptyDesc: { color: '#666' },
});
