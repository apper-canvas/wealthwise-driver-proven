import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";

const ExpenseChart = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await transactionService.getAll();
      setTransactions(data);
    } catch (err) {
      setError("Failed to load transaction data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-40 mb-6 animate-pulse" />
        <div className="h-80 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <Error message={error} onRetry={loadTransactions} />
      </Card>
    );
  }

  const expenses = transactions.filter(t => t.type === "expense");

  if (expenses.length === 0) {
    return (
      <Card className="p-6">
        <Empty
          title="No expenses found"
          description="Start tracking your expenses to see the breakdown"
          icon="PieChart"
        />
      </Card>
    );
  }

  // Calculate expense breakdown by category
  const categoryTotals = expenses.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
    return acc;
  }, {});

  const chartData = {
    series: Object.values(categoryTotals),
    options: {
      chart: {
        type: "donut",
        height: 350,
        fontFamily: "Inter, system-ui, sans-serif",
      },
      labels: Object.keys(categoryTotals),
      colors: [
        "#2563eb", "#7c3aed", "#10b981", "#f59e0b", 
        "#ef4444", "#8b5cf6", "#06b6d4", "#84cc16",
        "#f97316", "#ec4899"
      ],
      legend: {
        position: "bottom",
        fontSize: "14px",
        fontWeight: 500,
        offsetY: 10,
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total Expenses",
                fontSize: "14px",
                fontWeight: 600,
                color: "#374151",
                formatter: function (w) {
                  const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                  return `$${total.toLocaleString()}`;
                }
              }
            }
          }
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return val.toFixed(1) + "%";
        },
        style: {
          fontSize: "12px",
          fontWeight: "600",
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `$${val.toLocaleString()}`;
          }
        }
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: "bottom"
          }
        }
      }]
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Breakdown</h3>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="donut"
        height={350}
      />
    </Card>
  );
};

export default ExpenseChart;