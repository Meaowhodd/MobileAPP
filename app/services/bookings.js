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
import { app } from "../../firebaseConfig";

const db = getFirestore(app);

// ===== นับจำนวน booking ที่ยัง active =====
export function subscribeUserActiveApprovedCount(userId, cb) {
  if (!userId) return () => {};
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
  const { userId } = payload;
  if (!userId) throw new Error("Missing userId");

  const bookingsCol = collection(db, "bookings");

  return await runTransaction(db, async (tx) => {
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

    const now = Timestamp.now();
    const docData = {
      ...payload,
      createdAt: now,
      updatedAt: now,
    };

    const newRef = tx._getNewDocumentReference
      ? tx._getNewDocumentReference(bookingsCol) 
      : null;

    if (newRef) {
      tx.set(newRef, docData);
      return { id: newRef.id };
    } else {
      const added = await addDoc(bookingsCol, docData);
      return { id: added.id };
    }
  });
}
