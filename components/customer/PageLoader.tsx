export function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
      {/* Animated logo rings */}
      <div className="relative flex items-center justify-center mb-8">
        <span
          className="absolute w-24 h-24 rounded-full border-2 border-theme-primary/20 animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <span
          className="absolute w-16 h-16 rounded-full border-2 border-theme-primary/30 animate-ping"
          style={{ animationDuration: "1.5s", animationDelay: "0.3s" }}
        />
        <span className="w-12 h-12 rounded-full bg-gradient-to-br from-theme-primary/80 to-theme-primary flex items-center justify-center shadow-lg shadow-theme-primary/20">
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
            className="w-2 h-2 rounded-full bg-theme-primary/60"
            style={{
              animation: "pulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <p className="text-theme-body-sm font-medium text-gray-400 tracking-widest uppercase">
        Loading...
      </p>
    </div>
  );
}
