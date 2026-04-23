export const aqiSparkline = [
  { t: 1, v: 120 }, { t: 2, v: 135 }, { t: 3, v: 128 }, { t: 4, v: 150 },
  { t: 5, v: 168 }, { t: 6, v: 175 }, { t: 7, v: 162 }, { t: 8, v: 180 },
  { t: 9, v: 192 }, { t: 10, v: 178 }, { t: 11, v: 185 }, { t: 12, v: 182 },
];

export const firesSpark = [
  { t: 1, v: 220 }, { t: 2, v: 245 }, { t: 3, v: 260 }, { t: 4, v: 240 },
  { t: 5, v: 290 }, { t: 6, v: 310 }, { t: 7, v: 312 },
];

export const reportsSpark = [
  { t: 1, v: 80 }, { t: 2, v: 92 }, { t: 3, v: 110 }, { t: 4, v: 98 },
  { t: 5, v: 120 }, { t: 6, v: 132 }, { t: 7, v: 128 },
];

export const aqiAvgSpark = [
  { t: 1, v: 160 }, { t: 2, v: 172 }, { t: 3, v: 168 }, { t: 4, v: 178 },
  { t: 5, v: 182 }, { t: 6, v: 175 }, { t: 7, v: 182 },
];

export const budgetMonthly = [
  { m: "Jan", v: 42 }, { m: "Feb", v: 58 }, { m: "Mar", v: 65 },
  { m: "Apr", v: 51 }, { m: "May", v: 78 }, { m: "Jun", v: 92 },
  { m: "Jul", v: 84 }, { m: "Aug", v: 71 }, { m: "Sep", v: 66 },
  { m: "Oct", v: 58 }, { m: "Nov", v: 47 }, { m: "Dec", v: 38 },
];

export type Severity = "High" | "Medium" | "Low";

export const liveReports: {
  id: string;
  title: string;
  location: string;
  time: string;
  distance: string;
  severity: Severity;
  likes: number;
  thumb: string;
}[] = [
  {
    id: "r1",
    title: "Stubble burning detected",
    location: "Ludhiana, Punjab",
    time: "12 min ago",
    distance: "3.2 km",
    severity: "High",
    likes: 124,
    thumb: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=160&h=160&fit=crop",
  },
  {
    id: "r2",
    title: "Industrial smoke plume",
    location: "Mandi Gobindgarh",
    time: "28 min ago",
    distance: "8.7 km",
    severity: "High",
    likes: 89,
    thumb: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=160&h=160&fit=crop",
  },
  {
    id: "r3",
    title: "River discoloration near plant",
    location: "Jalandhar",
    time: "1 hr ago",
    distance: "12.1 km",
    severity: "Medium",
    likes: 56,
    thumb: "https://images.unsplash.com/photo-1581094651181-35942459ef62?w=160&h=160&fit=crop",
  },
  {
    id: "r4",
    title: "Illegal tree felling reported",
    location: "Hoshiarpur",
    time: "2 hr ago",
    distance: "21.4 km",
    severity: "Medium",
    likes: 47,
    thumb: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=160&h=160&fit=crop",
  },
  {
    id: "r5",
    title: "Roadside dust accumulation",
    location: "Patiala",
    time: "3 hr ago",
    distance: "18.0 km",
    severity: "Low",
    likes: 23,
    thumb: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=160&h=160&fit=crop",
  },
];

export const mapMarkers = [
  { id: "m1", name: "Amritsar", x: 18, y: 28, value: 312, severity: "high" as const },
  { id: "m2", name: "Ludhiana", x: 46, y: 52, value: 156, severity: "med" as const },
  { id: "m3", name: "Jalandhar", x: 36, y: 40, value: 85, severity: "low" as const },
  { id: "m4", name: "Patiala", x: 62, y: 66, value: 72, severity: "low" as const },
];