"use client";

import Link from "next/link";

export default function Error({ error }: { error: Error; reset: () => void }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-2xl flex-col">
      <div className="bg-red-500 text-white p-4 w-full text-center">
        Something went wrong
      </div>
      <div className="text-lg bg-red-300 text-center p-2 w-full">
        {error.message || "An error occurred"}
      </div>
      <Link
        href="/"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4"
      >
        Return
      </Link>
    </div>
  );
}
