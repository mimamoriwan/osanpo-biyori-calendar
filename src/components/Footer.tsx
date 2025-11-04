export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200 bg-white/60 py-4 text-center text-xs text-slate-500">
      <p>© {new Date().getFullYear()} おさんぽ日和カレンダー</p>
      <p className="mt-1">最新の気象データで安心しておさんぽを楽しもう</p>
    </footer>
  );
}
