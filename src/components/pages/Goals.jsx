import React from "react";
import GoalsTracker from "@/components/organisms/GoalsTracker";

const Goals = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display gradient-text">
          Savings Goals
        </h1>
        <p className="text-gray-600 mt-1">
          Set and track your financial goals and milestones
        </p>
      </div>

      <GoalsTracker />
    </div>
  );
};

export default Goals;