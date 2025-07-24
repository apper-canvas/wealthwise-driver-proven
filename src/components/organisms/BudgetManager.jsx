import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import ProgressBar from "@/components/molecules/ProgressBar";
import CategoryIcon from "@/components/molecules/CategoryIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";

const BudgetManager = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [budgetData, transactionData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);
      setBudgets(budgetData);
      setTransactions(transactionData);
    } catch (err) {
      setError("Failed to load budget data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }

  if (budgets.length === 0) {
    return (
      <Empty
        title="No budgets found"
        description="Create your first budget to start tracking your spending"
        icon="Target"
        actionLabel="Add Budget"
      />
    );
  }

  // Calculate spending for each budget
  const budgetsWithSpending = budgets.map(budget => {
    const categoryExpenses = transactions
      .filter(t => t.type === "expense" && t.category === budget.category)
      .reduce((sum, t) => sum + t.amount, 0);

    const percentage = (categoryExpenses / budget.limit) * 100;
    const remaining = budget.limit - categoryExpenses;

    return {
      ...budget,
      spent: categoryExpenses,
      percentage: Math.min(percentage, 100),
      remaining: Math.max(remaining, 0),
      isOverBudget: categoryExpenses > budget.limit
    };
  });

  const handleDeleteBudget = async (budgetId) => {
    try {
      await budgetService.delete(budgetId);
      setBudgets(prev => prev.filter(b => b.Id !== budgetId));
      toast.success("Budget deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete budget");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
        <Button>
          <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgetsWithSpending.map((budget) => (
          <motion.div
            key={budget.Id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6" hover>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <CategoryIcon category={budget.category} />
                  <div>
                    <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-500">{budget.period}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteBudget(budget.Id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <ApperIcon name="Trash2" className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      ${budget.spent.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      of ${budget.limit.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      budget.isOverBudget ? "text-red-600" : "text-success-600"
                    }`}>
                      {budget.isOverBudget ? "Over" : "Remaining"}
                    </p>
                    <p className={`text-lg font-bold ${
                      budget.isOverBudget ? "text-red-600" : "text-success-600"
                    }`}>
                      ${Math.abs(budget.remaining).toLocaleString()}
                    </p>
                  </div>
                </div>

                <ProgressBar
                  progress={budget.spent}
                  max={budget.limit}
                  color={budget.isOverBudget ? "danger" : budget.percentage > 80 ? "warning" : "success"}
                  showLabel={false}
                />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    {budget.percentage.toFixed(0)}% used
                  </span>
                  <span className={`font-medium ${
                    budget.isOverBudget ? "text-red-600" : "text-gray-700"
                  }`}>
                    {budget.isOverBudget && "+"}{(budget.percentage - 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BudgetManager;