export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Welcome to WeJSON</h1>
        <p className="mb-4 text-gray-600">
          This is a Next.js starter template configured with TypeScript, Tailwind CSS, and ESLint.
        </p>
        <p className="text-sm text-gray-500">
          Start editing <code className="font-mono">src/app/page.tsx</code> to see changes.
        </p>
      </div>
    </main>
  );
}
