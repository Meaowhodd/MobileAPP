// app/services/notificationsUI.js
export const UI = {
  LEFT_BAR: {
    booking_confirmed: "#10B981",  // เขียว
    booking_cancelled: "#EF4444",  // แดง
    booking_updated:   "#F59E0B",  // ส้ม
    meeting_reminder:  "#6366F1",  // ม่วง
    booking_created:   "#3B82F6",  // น้ำเงิน
    system_notice:     "#6B7280",  // เทาเข้ม
  },
  ICON_BG: {
    booking_confirmed: "#D1FAE5",
    booking_cancelled: "#FEE2E2",
    booking_updated:   "#FEF3C7",
    meeting_reminder:  "#EDE9FE",
    booking_created:   "#DBEAFE",
    system_notice:     "#E5E7EB",
  },
  EMOJI: {
    booking_confirmed: "✅",
    booking_cancelled: "❌",
    booking_updated:   "❌",
    meeting_reminder:  "⏰",
    booking_created:   "📌",
    system_notice:     "📢",
  },
  // สีตัวอักษร/พื้นของ "สถานะ" (ใช้เฉพาะสีตัวอักษร fg)
  STATUS: {
    pending:   { fg: "#B45309", bg: "#FEF3C7" }, // ส้มเข้ม
    approved:  { fg: "#065F46", bg: "#D1FAE5" }, // เขียวเข้ม
    completed: { fg: "#1E40AF", bg: "#DBEAFE" }, // น้ำเงินเข้ม
    canceled:  { fg: "#991B1B", bg: "#FEE2E2" }, // แดงเข้ม
    rejected:  { fg: "#991B1B", bg: "#FEE2E2" }, // แดงเข้ม
  },
};
