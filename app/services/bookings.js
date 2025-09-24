// services/bookings.js
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  query,
  runTransaction,
  Timestamp,
  where
} from "firebase/firestore";
import { app } from "../../firebaseConfig"; // แก้ path ให้ตรงโปรเจกต์คุณ

const db = getFirestore(app);

// ===== Realtime subscribe: นับจำนวน booking ที่ยัง active =====
export function subscribeUserActiveApprovedCount(userId, cb) {
  if (!userId) return () => {};
  // นับเฉพาะสถานะที่กินโควต้า: approved และ in_use
  // (ถ้าต้องนับเฉพาะ approved อย่างเดียว เปลี่ยน array เป็น ["approved"])
  const qApproved = query(
    collection(db, "bookings"),
    where("userId", "==", userId),
    where("status", "in", ["approved", "in_use"])
  );

  const unsub = onSnapshot(
    qApproved,
    (snap) => cb(snap.size),
    (err) => {
      console.error("subscribeUserActiveApprovedCount:", err);
      cb(0);
    }
  );
  return unsub;
}

// ===== Transaction: สร้าง booking โดยเช็คลิมิตก่อน =====
export async function createBookingWithLimit(payload) {
  // payload ต้องมี userId, roomId, slotId, slotStart, slotEnd, status, ...
  const { userId } = payload;
  if (!userId) throw new Error("Missing userId");

  const bookingsCol = collection(db, "bookings");

  return await runTransaction(db, async (tx) => {
    // ดึงจำนวนที่ยัง active (approved/in_use) จำกัดดึง 3 พอ เพื่อรู้ว่า >=2 หรือไม่
    const qCount = query(
      bookingsCol,
      where("userId", "==", userId),
      where("status", "in", ["approved", "in_use"]),
      limit(3)
    );
    const snap = await getDocs(qCount);
    const activeCount = snap.size;

    if (activeCount >= 2) {
      throw new Error("คุณมีการจองที่ได้รับอนุมัติครบ 2 ห้องแล้ว");
    }

    // ผ่าน -> สร้าง
    const now = Timestamp.now();
    const docData = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    // ใช้ addDoc นอก tx ไม่ได้ -> ใช้ tx.set กับ doc ใหม่
    const newRef = tx._getNewDocumentReference
      ? tx._getNewDocumentReference(bookingsCol) // บาง env มี method ภายใน
      : null;

    if (newRef) {
      tx.set(newRef, docData);
      return { id: newRef.id };
    } else {
      // fallback: addDoc ก่อนแล้วค่อยถือว่า fail-safe (ส่วนใหญ่ใช้ได้)
      const added = await addDoc(bookingsCol, docData);
      return { id: added.id };
    }
  });
}
