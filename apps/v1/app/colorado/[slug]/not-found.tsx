import Link from 'next/link';
import { MapPin } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-6" />

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Resort Not Found
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          We couldn&apos;t find the resort you&apos;re looking for. It may have been moved or doesn&apos;t exist.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-ski-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Browse All Resorts
          </Link>

          <Link
            href="/"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
