export function Footer() {
  return (
    <footer className="w-full py-4 text-center text-sm text-gray-500 print:hidden">
      <p className="font-medium tracking-wide" style={{ fontFamily: "'Outfit', sans-serif" }}>
        Created by{' '}
        <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent font-semibold">
          StackCreater
        </span>
      </p>
    </footer>
  );
}
