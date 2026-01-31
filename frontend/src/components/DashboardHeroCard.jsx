import React from "react";

export default function DashboardHeroCard({
  eyebrow = "Dashboard",
  title,
  description,
  actions = [],
  backgroundImage = "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=80",
}) {
  return (
    <section className="relative w-full rounded-3xl overflow-hidden shadow-xl min-h-[280px]">
      <div className="absolute inset-0">
        <img src={backgroundImage} alt="Dashboard" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/30" />
      </div>

      <div className="relative z-10 p-8 md:p-12 text-white space-y-4">
        {eyebrow && (
          <p className="uppercase tracking-[0.4em] text-xs text-white/70">{eyebrow}</p>
        )}
        <h1 className="text-3xl md:text-4xl font-semibold">{title}</h1>
        {description && <p className="max-w-3xl text-white/80">{description}</p>}

        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map(({ label, onClick, variant = "primary" }) => {
              const baseClasses =
                "px-6 py-3 rounded-lg font-medium transition flex items-center gap-2";
              const variantClasses =
                variant === "secondary"
                  ? "bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  : "bg-orange-500 text-white hover:bg-orange-600";

              return (
                <button key={label} onClick={onClick} className={`${baseClasses} ${variantClasses}`}>
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
