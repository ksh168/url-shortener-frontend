import { useState, FormEvent } from "react";
import { getConfig } from '../config'

interface ShortenResponse {
  shortUrl: string;
  longUrl: string;
}

const { VITE_API_URL } = getConfig()

// Replace the existing API_URL constant with this:
const API_URL = VITE_API_URL

export default function UrlShortenerForm() {
  const [longUrl, setLongUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setShortUrl(null);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(
        `${API_URL}/shorten`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            longUrl, 
            userId: "d12590e9-b3bc-4539-8ee0-80bd10029431",
            customAlias: customAlias || undefined // Only include if not empty
          }),
          signal: controller.signal
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to shorten URL");
      }

      const data: ShortenResponse = await response.json();
      setShortUrl(data.shortUrl);

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. The server might be starting up, please try again.');
        } else {
          setError(err.message);
        }
      } else {
        setError("Something went wrong");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="longUrl" className="block text-sm font-medium mb-2">
            Enter your long URL
          </label>
          <input
            type="url"
            id="longUrl"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="customAlias" className="block text-sm font-medium mb-2">
            Custom Alias (Optional)
          </label>
          <input
            type="text"
            id="customAlias"
            value={customAlias}
            onChange={(e) => setCustomAlias(e.target.value)}
            placeholder="my-custom-url"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            pattern="^[a-zA-Z0-9-_]+$"
            title="Only letters, numbers, hyphens, and underscores are allowed"
          />
          <p className="mt-1 text-sm text-gray-500">
            Only letters, numbers, hyphens, and underscores are allowed
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? "Shortening..." : "Shorten URL"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">{error}</div>
      )}

      {shortUrl && (
        <div className="mt-4 p-2 bg-green-100 text-green-700 rounded">
          <p className="font-medium">Shortened URL:</p>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {shortUrl}
          </a>
        </div>
      )}
    </div>
  );
}
