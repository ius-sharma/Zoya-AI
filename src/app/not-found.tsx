import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#07060a] text-white p-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-400 mb-6 text-sm">Could not find requested resource</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-violet-600 text-white text-xs font-medium hover:opacity-90 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  );
}
