export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      {/* Animated logo rings */}
      <div className="relative flex items-center justify-center mb-8">
        <span
          className="absolute w-24 h-24 rounded-full border-2 border-black/5 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <span
          className="absolute w-16 h-16 rounded-full border-2 border-black/10 animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "0.3s" }}
        />
        <span className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center shadow-lg shadow-black/10">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
        </span>
      </div>

      {/* Pulse dots */}
      <div className="flex gap-2 mb-5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-zinc-800"
            style={{
              animation: "pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
              opacity: 0.6,
            }}
          />
        ))}
      </div>

      <p className="text-theme-body-sm font-semibold text-zinc-500 tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
