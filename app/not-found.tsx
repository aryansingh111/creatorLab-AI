import Link from "next/link";
export default function NotFound() { return <div className="py-16 text-center"><h1 className="text-2xl font-semibold">Page not found</h1><Link href="/dashboard" className="mt-3 inline-block text-brand underline">Back to dashboard</Link></div>; }
