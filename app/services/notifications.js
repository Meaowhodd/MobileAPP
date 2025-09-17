
import AsyncStorage from '@react-native-async-storage/async-storage';

const TYPES = ['confirmed', 'cancelled', 'updated', 'reminder', 'system'];
const EMOJI = { confirmed: '✅', cancelled: '❌', updated: '🔄', reminder: '🔔', system: '⚙️' };
const LEFT_BAR = { confirmed:'#1f66f2', cancelled:'#ff3333', updated:'#ff9933', reminder:'#33cc33', system:'#999999' };
const BG = { confirmed:'#e6f0ff', cancelled:'#fff0f0', updated:'#f9f9f9', reminder:'#f9fff0', system:'#f2f2f2' };

export const UI = { EMOJI, LEFT_BAR, BG };

const STORAGE_KEY = 'notifications_v1';

// ---------------- Mock API ----------------
function mockItems(page=1, limit=10) {
  // สร้างข้อมูลจำลองแบบมีเวลาไล่หลัง (ล่าสุดอยู่บน)
  const now = Date.now();
  const start = (page - 1) * limit;
  return Array.from({ length: limit }).map((_, i) => {
    const idx = start + i + 1;
    const type = TYPES[idx % TYPES.length];
    return {
      id: String(idx),
      type,
      title:
        type === 'confirmed' ? 'Booking Confirmed!!' :
        type === 'cancelled' ? 'Booking Cancelled!!' :
        type === 'updated'   ? 'Booking Updated' :
        type === 'reminder'  ? 'Upcoming Meeting Reminder' :
                               'System Notice!!',
      desc:
        type === 'confirmed' ? 'Your booking was confirmed.' :
        type === 'cancelled' ? 'Your booking was cancelled.' :
        type === 'updated'   ? 'Your booking time was updated.' :
        type === 'reminder'  ? 'Your meeting will start soon.' :
                               'New features are available.',
      ts: new Date(now - (start + i) * 1000 * 60 * 13).toISOString(), // ห่างกัน ~13 นาที
      read: idx % 5 === 0, // บางอันเป็นอ่านแล้ว
    };
  });
}

export async function fetchNotifications({ page=1, limit=10 }) {
  // จำลองการเรียก API จริง
  await new Promise(r => setTimeout(r, 300)); // หน่วงนิดนึงให้เหมือนโหลด
  const items = mockItems(page, limit);
  const total = 100; // สมมติว่ามี 100 รายการทั้งหมด
  return { items, total, page, limit };
}

// ---------------- Persistence ----------------
export async function loadCached() {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : null;
}
export async function saveCached(list) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}
