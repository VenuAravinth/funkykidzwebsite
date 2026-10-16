import type { User } from "@/lib/auth";

// Profile photo, or the first letter of the name when there isn't one.
export default function Avatar({ user, className = "h-12 w-12 text-lg" }: { user: Pick<User, "name" | "avatarUrl">; className?: string }) {
  return (
    <span className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-rose-light/60 font-serif-display font-bold text-rose-dark ${className}`}>
      {user.avatarUrl ? (
        // Served by our own authenticated API, so next/image optimisation doesn't apply.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.avatarUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        user.name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
