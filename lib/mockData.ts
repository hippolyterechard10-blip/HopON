/**
 * Mock fixtures for offline development & the home-screen showcase.
 * Replaced by real Supabase queries when auth + onboarding land.
 */

export type MockHorse = {
  id: string;
  name: string;
  stall: string;
  breed: string;
  age: number;
  status: "ok" | "warn" | "alert";
  statusNote?: string;
};

export const mockHorses: MockHorse[] = [
  { id: "h1", name: "Bella", stall: "12", breed: "Hanoverian", age: 9, status: "ok" },
  { id: "h2", name: "Storm", stall: "07", breed: "Warmblood", age: 11, status: "warn", statusNote: "Slight lameness, watching" },
  { id: "h3", name: "Indigo", stall: "03", breed: "Dutch Warmblood", age: 7, status: "ok" },
  { id: "h4", name: "Atlas", stall: "18", breed: "Oldenburg", age: 14, status: "alert", statusNote: "Vet visit today" },
  { id: "h5", name: "Juno", stall: "21", breed: "Selle Français", age: 6, status: "ok" },
];

export type MockLesson = {
  id: string;
  time: string;
  client: string;
  horse: string;
  location: string;
  level: string;
  discipline: string;
  paid: boolean;
};

export const mockLessons: MockLesson[] = [
  { id: "l1", time: "09:00", client: "Emma Carter", horse: "Bella", location: "Outdoor Arena", level: "Level 4", discipline: "Jump", paid: true },
  { id: "l2", time: "10:30", client: "Sofia Reyes", horse: "Storm", location: "Indoor Arena", level: "Level 3", discipline: "Flat", paid: true },
  { id: "l3", time: "12:00", client: "Mateo Bell", horse: "Indigo", location: "Outdoor Arena", level: "Level 5", discipline: "Jump", paid: false },
  { id: "l4", time: "14:00", client: "Liv Andersen", horse: "Juno", location: "Outdoor Arena", level: "Level 2", discipline: "Flat", paid: true },
  { id: "l5", time: "16:30", client: "Daniel Park", horse: "Bella", location: "Indoor Arena", level: "Level 4", discipline: "Jump", paid: true },
];

export type MockTask = {
  id: string;
  horse: string;
  type: string;
  time: string;
  status: "pending" | "done" | "urgent";
};

export const mockTasks: MockTask[] = [
  { id: "t1", horse: "ATLAS", type: "MEDS", time: "07:30", status: "done" },
  { id: "t2", horse: "BELLA", type: "TURNOUT", time: "08:00", status: "done" },
  { id: "t3", horse: "STORM", type: "TACK UP", time: "10:15", status: "urgent" },
  { id: "t4", horse: "INDIGO", type: "FEED", time: "12:00", status: "pending" },
  { id: "t5", horse: "JUNO", type: "GROOM", time: "13:30", status: "pending" },
  { id: "t6", horse: "BELLA", type: "EVENING FEED", time: "17:30", status: "pending" },
];

export type MockAlert = {
  id: string;
  severity: "alert" | "warn" | "info";
  title: string;
  subtitle: string;
};

export const mockAlerts: MockAlert[] = [
  {
    id: "a1",
    severity: "alert",
    title: "Atlas — vet visit at 14:00",
    subtitle: "Dr. Torres confirmed · Stall 18",
  },
  {
    id: "a2",
    severity: "warn",
    title: "Storm not feeling 100%",
    subtitle: "Groom flagged this morning — light work today",
  },
];

export type MockNewsItem = {
  id: string;
  date: string;
  title: string;
};

export const mockNews: MockNewsItem[] = [
  { id: "n1", date: "May 12", title: "Wellington show registration closes Friday" },
  { id: "n2", date: "May 10", title: "New hay supplier — first delivery next week" },
  { id: "n3", date: "May 08", title: "Sunday group lesson moved to 10:00" },
];

export const mockBarn = {
  name: "Wellington Park Equestrian",
  city: "Wellington, FL",
  revenueMtd: 3600,
  revenueDelta: 18,
  lessonsMtd: 12,
  lessonsDelta: 3.8,
  recurringPayments: 16,
  teamTodos: 42,
  teamEvents: 6,
  openAlerts: 2,
};

export type MockClientChild = {
  name: string;
  horse: string;
  age: number;
};

export const mockClient = {
  name: "Emma Carter",
  myHorse: {
    name: "Bella",
    breed: "Hanoverian",
    age: 9,
    stall: "12",
    photoTone: "#9ECFB0",
  },
  nextLesson: { day: "Today", time: "09:00", with: "Trainer Sam" },
  upcoming: [
    { id: "u1", day: "Today", time: "09:00", title: "Lesson with Sam", status: "Confirmed" },
    { id: "u2", day: "Fri", time: "11:00", title: "Farrier visit", status: "Scheduled" },
    { id: "u3", day: "Sat", time: "08:30", title: "Lesson with Sam", status: "Confirmed" },
  ],
  invoice: { amount: 540, dueIn: "3 days" },
  feed: [
    { id: "f1", time: "1h ago", text: "Bella had a calm hack — went well." },
    { id: "f2", time: "yesterday", text: "Farrier confirmed for Friday at 11:00." },
  ],
};
