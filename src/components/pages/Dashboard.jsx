import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MetricCard from "@/components/molecules/MetricCard";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrends from "@/components/organisms/SpendingTrends";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { transactionService } from "@/services/api/transactionService";
import { goalsService } from "@/services/api/goalsService";
import { format, startOfMonth, endOfMonth } from "date-fns";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [transactionData, goalsData] = await Promise.all([
        transactionService.getAll(),
        goalsService.getAll()
      ]);
      setTransactions(transactionData);
      setGoals(goalsData);
    } catch (err) {
      setError("Failed to load dashboard data");
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

  // Calculate metrics
  const currentMonth = new Date();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const thisMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= monthStart && transactionDate <= monthEnd;
  });

  const totalIncome = thisMonthTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = thisMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentBalance = totalIncome - totalExpenses;

  const totalSavings = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const savingsTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const savingsProgress = savingsTarget > 0 ? (totalSavings / savingsTarget) * 100 : 0;

  // Calculate previous month for comparison
  const lastMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
  const lastMonthStart = startOfMonth(lastMonth);
  const lastMonthEnd = endOfMonth(lastMonth);

  const lastMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= lastMonthStart && transactionDate <= lastMonthEnd;
  });

  const lastMonthExpenses = lastMonthTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenseChange = lastMonthExpenses > 0 
    ? ((totalExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 
    : 0;

  // Recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            Financial Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your financial health for {format(currentMonth, "MMMM yyyy")}
          </p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Current Balance"
          value={`$${currentBalance.toLocaleString()}`}
          change={currentBalance >= 0 ? "Positive balance" : "Negative balance"}
          changeType={currentBalance >= 0 ? "positive" : "negative"}
          icon="Wallet"
          iconColor="primary"
        />

        <MetricCard
          title="Monthly Income"
          value={`$${totalIncome.toLocaleString()}`}
          change={`${thisMonthTransactions.filter(t => t.type === "income").length} transactions`}
          changeType="positive"
          icon="TrendingUp"
          iconColor="success"
        />

        <MetricCard
          title="Monthly Expenses"
          value={`$${totalExpenses.toLocaleString()}`}
          change={`${expenseChange >= 0 ? "+" : ""}${expenseChange.toFixed(1)}% vs last month`}
          changeType={expenseChange >= 0 ? "negative" : "positive"}
          icon="TrendingDown"
          iconColor="danger"
        />

        <MetricCard
          title="Savings Progress"
          value={`$${totalSavings.toLocaleString()}`}
          change={`${savingsProgress.toFixed(0)}% of target`}
          changeType="positive"
          icon="PiggyBank"
          iconColor="secondary"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <SpendingTrends />
      </div>

      {/* Recent Transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No recent transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.Id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    transaction.type === "income" ? "bg-success-500" : "bg-red-500"
                  }`} />
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.category} • {format(new Date(transaction.date), "MMM dd")}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === "income" ? "text-success-600" : "text-gray-900"
                }`}>
                  {transaction.type === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;