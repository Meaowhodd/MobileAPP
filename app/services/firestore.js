// app/services/firestore.js
import {
    collection,
    getDocs,
    query,
    Timestamp,
    where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

// ชี้ collection ที่ใช้บ่อย
export const colRooms     = collection(db, "rooms");
export const colUsers     = collection(db, "users");
export const colBookings  = collection(db, "bookings");
export const subFavorites = (uid) => collection(db, "favorites", uid, "rooms");

/**
 * นับจำนวน booking ที่ชนเงื่อนไข (ถือว่ายึดช่องเวลานั้น)
 * เงื่อนไข: ห้องเดียวกัน + วันเดียวกัน + slot เดียวกัน + status ที่ถือว่ายึดสิทธิ์
 * @param {string} roomId
 * @param {number} y  - ค.ศ.
 * @param {number} m  - 1..12
 * @param {number} d  - 1..31
 * @param {"S1"|"S2"|"S3"|"S4"} slotId
 * @returns {Promise<number>}
 */
export async function countActiveBookings(roomId, y, m, d, slotId) {
  const start = Timestamp.fromDate(new Date(y, m - 1, d, 0, 0, 0, 0));
  const end   = Timestamp.fromDate(new Date(y, m - 1, d, 23, 59, 59, 999));

  // สถานะที่ถือว่ายึดช่องไว้
  const blockingStatuses = ["pending", "approved", "in_use"];

  // Firestore query เป็น AND โดย default (ใส่ where ต่อกัน)
  const q = query(
    colBookings,
    where("roomId", "==", roomId),
    where("slotId", "==", slotId),
    where("slotStart", ">=", start),
    where("slotStart", "<=", end),
    where("status", "in", blockingStatuses)
  );

  const snap = await getDocs(q);
  return snap.size; // 0 = ว่าง, >0 = ไม่ว่าง
}
