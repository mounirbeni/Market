import type { Vehicle } from "./types";
import type { ArtShape } from "@/components/VehicleArt";

/** موديلات تُرسم كبيك أب بدل شاحنة مغلقة */
const PICKUPS = ["Hilux", "L200", "Ranger", "D-Max"];

/** يحدد الشكل المرسوم للمركبة */
export function artShape(v: Pick<Vehicle, "body" | "model">): ArtShape {
  if (v.body === "utilitaire" && PICKUPS.includes(v.model)) return "pickup";
  return v.body;
}
