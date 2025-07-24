import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/molecules/ProgressBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { goalsService } from "@/services/api/goalsService";
import { format, differenceInDays } from "date-fns";

const GoalsTracker = ({ onAddGoal }) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadGoals = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await goalsService.getAll();
      setGoals(data);
    } catch (err) {
      setError("Failed to load goals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadGoals} />;
  }

  if (goals.length === 0) {
    return (
      <Empty
        title="No savings goals found"
        description="Set your first savings goal to start building your future"
        icon="Target"
        actionLabel="Add Goal"
      />
    );
  }

  const handleDeleteGoal = async (goalId) => {
    try {
      await goalsService.delete(goalId);
      setGoals(prev => prev.filter(g => g.Id !== goalId));
      toast.success("Goal deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const handleAddProgress = async (goalId, amount) => {
    try {
      const goal = goals.find(g => g.Id === goalId);
      const updatedGoal = await goalsService.update(goalId, {
        ...goal,
        currentAmount: goal.currentAmount + amount
      });
      
      setGoals(prev => prev.map(g => g.Id === goalId ? updatedGoal : g));
      toast.success("Progress updated successfully!");
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  return (
    <div className="space-y-6">
<div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Savings Goals</h2>
        <Button onClick={onAddGoal}>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map((goal) => {
          const percentage = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          const daysLeft = differenceInDays(new Date(goal.targetDate), new Date());
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const isOverdue = daysLeft < 0 && !isCompleted;

          return (
            <motion.div
              key={goal.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-6" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      isCompleted ? "bg-success-100" : "bg-primary-100"
                    }`}>
                      <ApperIcon 
                        name={goal.icon || "Target"} 
                        className={`w-6 h-6 ${
                          isCompleted ? "text-success-600" : "text-primary-600"
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                      <p className="text-sm text-gray-500">
                        Target: {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteGoal(goal.Id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <ApperIcon name="Trash2" className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ${goal.currentAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        of ${goal.targetAmount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Remaining</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <ProgressBar
                    progress={goal.currentAmount}
                    max={goal.targetAmount}
                    color={isCompleted ? "success" : percentage > 75 ? "warning" : "primary"}
                    showLabel={false}
                  />

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      {percentage.toFixed(0)}% complete
                    </span>
                    <span className={`font-medium ${
                      isOverdue ? "text-red-600" : 
                      daysLeft <= 30 ? "text-yellow-600" : "text-gray-700"
                    }`}>
                      {isCompleted ? "Completed!" : 
                       isOverdue ? `${Math.abs(daysLeft)} days overdue` :
                       `${daysLeft} days left`}
                    </span>
                  </div>

                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const amount = prompt("Enter amount to add:");
                        if (amount && !isNaN(amount)) {
                          handleAddProgress(goal.Id, parseFloat(amount));
                        }
                      }}
                    >
                      <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                      Add Progress
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsTracker;