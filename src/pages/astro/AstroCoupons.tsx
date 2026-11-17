import BookingCoupons from '../BookingCoupons';

/** Coupons page inside astro layout — inherits emerald chrome from parent. */
export default function AstroCoupons() {
  return (
    <div className="astro-coupons [&_.bg-brand-500]:!bg-brand-600 [&_.hover\\:bg-brand-600]:hover:!bg-brand-700 [&_.text-brand-500]:!text-brand-600 [&_.text-brand-600]:!text-brand-700 [&_.border-brand-500]:!border-brand-500 [&_.ring-brand-500]:!ring-brand-500">
      <BookingCoupons />
    </div>
  );
}
