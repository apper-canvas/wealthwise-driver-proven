import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear, subMonths } from "date-fns";
import { transactionService } from "@/services/api/transactionService";
import ApperIcon from "@/components/ApperIcon";
import ExpenseChart from "@/components/organisms/ExpenseChart";
import SpendingTrends from "@/components/organisms/SpendingTrends";
import Select from "@/components/atoms/Select";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateRange, setDateRange] = useState("thisMonth");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transactions data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadTransactions} />;
  }

  // Filter transactions by date range
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case "thisMonth":
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case "thisYear":
        return { start: startOfYear(now), end: endOfYear(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

const { start, end } = getDateRange();
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  // Calculate summary metrics
  const totalIncome = filteredTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netIncome = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0;

  // Category breakdown
  const categoryBreakdown = filteredTransactions
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

const handleExport = async () => {
    try {
      // Create CSV content
      const csvContent = [];
      
      // Add summary section
      csvContent.push('FINANCIAL REPORT SUMMARY');
      csvContent.push(`Report Period: ${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`);
      csvContent.push('');
      csvContent.push('SUMMARY METRICS');
      csvContent.push(`Total Income,$${totalIncome.toFixed(2)}`);
      csvContent.push(`Total Expenses,$${totalExpenses.toFixed(2)}`);
      csvContent.push(`Net Income,$${netIncome.toFixed(2)}`);
      csvContent.push(`Savings Rate,${savingsRate.toFixed(1)}%`);
      csvContent.push('');
      
      // Add transactions section
      csvContent.push('TRANSACTION DETAILS');
      csvContent.push('Date,Description,Category,Type,Amount');
      filteredTransactions.forEach(transaction => {
        csvContent.push(`${format(new Date(transaction.date), 'MMM dd, yyyy')},${transaction.description},${transaction.category},${transaction.type},$${transaction.amount.toFixed(2)}`);
      });
      csvContent.push('');
      
      // Add category breakdown
      csvContent.push('TOP SPENDING CATEGORIES');
      csvContent.push('Category,Amount,Percentage of Expenses');
      topCategories.forEach(([category, amount]) => {
        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
        csvContent.push(`${category},$${amount.toFixed(2)},${percentage.toFixed(1)}%`);
      });
      
      // Create and download file
      const csvString = csvContent.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `financial-report-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
// Show success message
      const { toast } = await import('react-toastify');
      toast.success('Report exported successfully!');
      
    } catch (error) {
      console.error('Export failed:', error);
      const { toast } = await import('react-toastify');
      toast.error('Failed to export report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            Financial Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Analyze your spending patterns and financial trends
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <Select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          >
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </Select>

<Button variant="outline" onClick={handleExport}>
            <ApperIcon name="Download" className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-success-600">
                ${totalIncome.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                ${totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="TrendingDown" className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Income</p>
              <p className={`text-2xl font-bold ${netIncome >= 0 ? "text-success-600" : "text-red-600"}`}>
                {netIncome >= 0 ? "+" : ""}${netIncome.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              netIncome >= 0 ? "bg-success-100" : "bg-red-100"
            }`}>
              <ApperIcon 
                name={netIncome >= 0 ? "Plus" : "Minus"} 
                className={`w-6 h-6 ${netIncome >= 0 ? "text-success-600" : "text-red-600"}`}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Savings Rate</p>
              <p className="text-2xl font-bold text-primary-600">
                {savingsRate.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <ApperIcon name="PiggyBank" className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ExpenseChart />
        <SpendingTrends />
      </div>

      {/* Top Spending Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Spending Categories</h3>
        
        {topCategories.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expense data for selected period</p>
          </div>
        ) : (
          <div className="space-y-4">
            {topCategories.map(([category, amount], index) => {
              const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category}</p>
                      <p className="text-sm text-gray-500">
                        {percentage.toFixed(1)}% of total expenses
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    ${amount.toLocaleString()}
                  </p>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;