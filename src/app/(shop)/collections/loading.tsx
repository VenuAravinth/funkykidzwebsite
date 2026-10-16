export default function ShopLoading() {
  return (
    <section className="mx-auto max-w-[1400px] px-6 py-12 md:pl-24 md:pr-12">
      <div className="mb-10 h-10 w-64 animate-pulse rounded-full bg-rose-light/60" />
      <div className="flex flex-col gap-8 md:flex-row md:gap-10">
        <div className="flex shrink-0 flex-row gap-2 md:w-48 md:flex-col">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded-full bg-rose-light/50 md:rounded-lg" />
          ))}
        </div>
        <div className="grid flex-1 grid-cols-2 gap-6 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] w-full animate-pulse rounded-2xl bg-rose-light/40" />
          ))}
        </div>
      </div>
    </section>
  );
}
