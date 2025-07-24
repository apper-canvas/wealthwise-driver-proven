import React from "react";
import { motion } from "framer-motion";

const Loading = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-64 animate-pulse" />
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-xl shadow-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20 mb-2 animate-pulse" />
                  <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 mb-2 animate-pulse" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-4 animate-pulse" />
            <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
          </div>
          <div className="bg-white rounded-xl shadow-card p-6">
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-40 mb-4 animate-pulse" />
            <div className="h-64 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Recent Transactions Skeleton */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-40 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32 mb-1 animate-pulse" />
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-24 animate-pulse" />
                </div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;