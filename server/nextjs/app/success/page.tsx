export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-green-600">
            Success!
          </h1>
          <p className="text-center text-gray-600">
            The user returned to the app. Your Stripe account has been set up
            successfully.
          </p>
        </div>
      </div>
    </main>
  );
}
