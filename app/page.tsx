import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to SenseBy CBD</h1>
      <p className="text-xl mb-8">Premium CBD products for a better life</p>
      <div className="flex gap-4">
        <Link 
          href="/products" 
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
        >
          Shop Now
        </Link>
        <Link 
          href="/blog" 
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          Read Our Blog
        </Link>
      </div>
    </main>
  );
}
