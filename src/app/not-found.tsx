import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-container mx-auto px-6 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wider text-brand-red">404</p>
      <h1 className="mt-3 text-5xl font-extrabold tracking-tight text-brand-navy">Page not found</h1>
      <p className="mt-4 text-lg text-slate-600">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="inline-flex items-center rounded-full bg-brand-red px-6 py-3 font-semibold text-white hover:opacity-90">
          Back to home
        </Link>
        <Link href="/services" className="inline-flex items-center rounded-full border border-brand-navy px-6 py-3 font-semibold text-brand-navy hover:bg-brand-navy hover:text-white">
          Browse services
        </Link>
      </div>
    </div>
  );
}
