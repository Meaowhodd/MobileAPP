// app/services/notificationsUI.js
export const UI = {
  LEFT_BAR: {
    booking_confirmed: "#10B981", 
    booking_cancelled: "#EF4444",  
    booking_updated:   "#F59E0B",  
    meeting_reminder:  "#6366F1",  
    booking_created:   "#3B82F6",  
    system_notice:     "#6B7280",  
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
  STATUS: {
    pending:   { fg: "#B45309", bg: "#FEF3C7" }, 
    approved:  { fg: "#065F46", bg: "#D1FAE5" }, 
    completed: { fg: "#1E40AF", bg: "#DBEAFE" }, 
    canceled:  { fg: "#991B1B", bg: "#FEE2E2" }, 
    rejected:  { fg: "#991B1B", bg: "#FEE2E2" }, 
  },
};
