import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { format, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

const SpendingTrends = () => {
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

  if (transactions.length === 0) {
    return (
      <Card className="p-6">
        <Empty
          title="No transaction data"
          description="Add some transactions to see spending trends"
          icon="BarChart3"
        />
      </Card>
    );
  }

  // Generate last 6 months
  const endDate = new Date();
  const startDate = subMonths(endDate, 5);
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  // Calculate monthly data
  const monthlyData = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    
    const monthTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const income = monthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = monthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      month: format(month, "MMM yyyy"),
      income,
      expenses,
    };
  });

  const chartData = {
    series: [
      {
        name: "Income",
        data: monthlyData.map(d => d.income),
        color: "#10b981"
      },
      {
        name: "Expenses", 
        data: monthlyData.map(d => d.expenses),
        color: "#ef4444"
      }
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
        fontFamily: "Inter, system-ui, sans-serif",
        toolbar: {
          show: false
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"]
      },
      xaxis: {
        categories: monthlyData.map(d => d.month),
        labels: {
          style: {
            fontSize: "12px",
            fontWeight: 500,
          }
        }
      },
      yaxis: {
        title: {
          text: "Amount ($)",
          style: {
            fontSize: "12px",
            fontWeight: 600,
          }
        },
        labels: {
          formatter: function (val) {
            return `$${val.toLocaleString()}`;
          },
          style: {
            fontSize: "12px",
          }
        }
      },
      fill: {
        opacity: 1,
        type: "gradient",
        gradient: {
          shade: "light",
          type: "vertical",
          shadeIntensity: 0.3,
          gradientToColors: ["#059669", "#dc2626"],
          inverseColors: false,
          opacityFrom: 1,
          opacityTo: 0.8,
        }
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return `$${val.toLocaleString()}`;
          }
        }
      },
      legend: {
        position: "top",
        horizontalAlign: "right",
        fontSize: "14px",
        fontWeight: 500,
      },
      grid: {
        borderColor: "#f1f5f9",
        strokeDashArray: 3,
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 300
          },
          plotOptions: {
            bar: {
              columnWidth: "80%"
            }
          }
        }
      }]
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Trends</h3>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={350}
      />
    </Card>
  );
};

export default SpendingTrends;