import type { GalleryItem } from "@/lib/gallery";

/* Made-up gallery for /demo: simple sample images in public/demo-gallery. Delete stays on the page. */

const item = (
  id: string,
  title: string,
  category: GalleryItem["category"],
  file: string,
  width: number,
  height: number,
  bytes: number,
  date: string,
  description: string | null = null,
): GalleryItem => ({
  id,
  title,
  category,
  description,
  mime: "image/svg+xml",
  width,
  height,
  bytes,
  createdAt: `${date}T10:00:00+05:30`,
  url: `/demo-gallery/${file}`,
  downloadUrl: `/demo-gallery/${file}`,
  fileName: `${title}.svg`,
});

export const demoGallery: GalleryItem[] = [
  item("g1", "Meal plan", "Health", "meal-plan.svg", 1200, 1500, 1117, "2026-10-18", "Sample weekly meals."),
  item("g2", "Gym B routine", "Health", "gym-b.svg", 1200, 1500, 1113, "2026-10-17"),
  item("g3", "Budget split", "Money", "budget.svg", 1600, 1200, 1120, "2026-10-15", "Needs, wants and savings."),
  item("g4", "Study plan", "Education", "study-plan.svg", 1200, 1500, 1118, "2026-10-12"),
  item("g5", "Room layout", "Home", "room-layout.svg", 2000, 1400, 1122, "2026-10-09"),
];
