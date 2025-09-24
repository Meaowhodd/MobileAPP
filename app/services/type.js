// app/types.js  (JavaScript version)

// “enum” แบบ JS
export const SlotIds = ["S1", "S2", "S3", "S4"];

export const BookingStatuses = [
  "pending",
  "approved",
  "in_use",
  "completed",
  "canceled",
  "rejected",
];

export const UserRoles = ["admin", "student"];

/**
 * @typedef {"S1"|"S2"|"S3"|"S4"} SlotId
 */

/**
 * @typedef {"pending"|"approved"|"in_use"|"completed"|"canceled"|"rejected"} BookingStatus
 */

/**
 * @typedef {Object} RoomDoc
 * @property {string} id
 * @property {string} name
 * @property {string} code
 * @property {number} floor
 * @property {number} capacityMin
 * @property {number} capacityMax
 * @property {string} image
 * @property {string=} bestFor
 * @property {string=} atmosphere
 * @property {string=} highlights
 */

/**
 * @typedef {Object} BookingDoc
 * @property {string} id
 * @property {string} userId
 * @property {string} roomId
 * @property {string} roomCode
 * @property {string} roomName
 * @property {number} capacityMin
 * @property {number} capacityMax
 * @property {number} numberOfPeople
 * @property {string[]} accessories
 * @property {SlotId} slotId
 * @property {import("firebase/firestore").Timestamp} slotStart
 * @property {import("firebase/firestore").Timestamp} slotEnd
 * @property {BookingStatus} status
 */

// ช่วงเวลา 4 สลอตคงที่
export const SLOT_DEFS = [
  { id: "S1", startHour: 8,  endHour: 10, label: "08.00-10.00" },
  { id: "S2", startHour: 10, endHour: 12, label: "10.00-12.00" },
  { id: "S3", startHour: 13, endHour: 15, label: "13.00-15.00" },
  { id: "S4", startHour: 15, endHour: 17, label: "15.00-17.00" },
];
