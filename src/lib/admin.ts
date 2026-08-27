import "server-only";
import { getCurrentUser } from "./auth";

/* ============================================================
   الإشراف

   الصلاحية كتجي من متغيّر بيئة `ADMIN_EMAILS` — لائحة إيميلات
   مفرّقة بفاصلة.

   علاش ماشي عمود فقاعدة البيانات: باش الواحد يولّي مشرف خاصو
   يوصل لإعدادات Vercel. حتى إلا تسرّبات القاعدة، حتى واحد
   ماقدر يدير راسو مشرف بـUPDATE.
   ============================================================ */

const admins = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );

export const adminConfigured = () => admins().size > 0;

/** شحال من مشرف مضبوط — للفحص، بلا ما نبيّنو الإيميلات */
export const adminCount = () => admins().size;

/** المستخدم الحالي إلا كان مشرفاً — وإلا null */
export async function getAdmin() {
  const list = admins();
  if (list.size === 0) return null;
  const user = await getCurrentUser();
  if (!user?.email || !list.has(user.email.toLowerCase())) return null;
  return user;
}
