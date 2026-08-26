/** أنواع مشتركة بين الخادم والمتصفح — بلا ما نجرّو وحدة الخادم للمتصفح */
export interface CatalogEntry {
  kind: "car" | "moto";
  make: string;
  model: string;
}
