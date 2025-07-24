import React, { useState } from "react";
import GoalsTracker from "@/components/organisms/GoalsTracker";
import GoalForm from "@/components/organisms/GoalForm";
const Goals = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddGoal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleGoalSaved = () => {
    setIsModalOpen(false);
  };

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

<GoalsTracker onAddGoal={handleAddGoal} />
      
      <GoalForm 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleGoalSaved}
      />
    </div>
  );
};

export default Goals;