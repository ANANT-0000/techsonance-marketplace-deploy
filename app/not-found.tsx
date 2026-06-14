import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <h2 className="text-theme-h4 font-bold">404 Not Found</h2>
      <p className="text-gray-600">Could not find the requested resource.</p>
      <Link
        href="/"
        className="rounded-md bg-blue-500 px-4 py-2 text-theme-body-sm text-white transition-colors hover:bg-blue-400"
      >
        Return Home
      </Link>
    </div>
  )
}