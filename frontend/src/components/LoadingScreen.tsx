export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-2xl animate-pulse-glow">
          💪
        </div>
        <div className="absolute -inset-2 rounded-3xl border border-[#6c63ff]/30 animate-ping" />
      </div>
      <div className="text-center">
        <h1 className="font-display text-2xl font-bold text-white mb-1">GymDiary</h1>
        <p className="text-white/40 text-sm">Loading your workouts...</p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-[#6c63ff]"
            style={{ animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }}
          />
        ))}
      </div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
