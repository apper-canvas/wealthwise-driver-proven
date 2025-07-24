import React from "react";
import BudgetManager from "@/components/organisms/BudgetManager";

const Budgets = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-display gradient-text">
          Budgets
        </h1>
        <p className="text-gray-600 mt-1">
          Set spending limits and track your budget progress
        </p>
      </div>

      <BudgetManager />
    </div>
  );
};

export default Budgets;