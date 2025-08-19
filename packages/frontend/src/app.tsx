import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, Star, Zap, GitFork, Rocket } from "lucide-react";
import { api, trpcClient } from "./api";
import { env } from "./env";

export function App() {
  const [count, setCount] = useState(0);

  api.users.list.useQuery();

  useEffect(() => {
    trpcClient.users.list.query();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Fullstack Serverless
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Built with Vite + React 19 + Tailwind CSS v4 + shadcn/ui
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className="text-sm text-gray-500">Environment:</span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-sm font-medium">
                {env.VITE_STAGE}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Powered by Vite and React 19 with modern tooling
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Star className="h-8 w-8 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Beautiful UI</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Tailwind CSS v4 with shadcn/ui components
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <Rocket className="h-8 w-8 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ready to Deploy</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Serverless architecture with type-safe APIs
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-bold mb-6">Interactive Demo</h2>
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCount(count - 1)}
              >
                Decrease
              </Button>
              <div className="text-4xl font-bold text-purple-600 min-w-[100px]">
                {count}
              </div>
              <Button size="lg" onClick={() => setCount(count + 1)}>
                Increase
              </Button>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="secondary" size="sm">
                <Heart className="h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" size="sm">
                <Star className="h-4 w-4" />
                Star
              </Button>
              <Button variant="ghost" size="sm">
                <GitFork className="h-4 w-4" />
                Fork
              </Button>
            </div>
          </div>

          <div className="text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              Edit{" "}
              <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                src/App.tsx
              </code>{" "}
              and save to test HMR
            </p>
            <p>
              Click the buttons above to see the interactive components in
              action!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
