"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/onboard-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("An error occurred");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-8">
            Setup payouts to list your home on Kavholm
          </h1>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="text-red-600 text-sm mb-4 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-stripe-purple text-white py-3 rounded-md font-semibold hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? "Redirecting..." : "Setup payouts on Stripe"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
