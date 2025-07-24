import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const CategoryIcon = ({ category, className, size = "md" }) => {
  const categoryIcons = {
    "Food & Dining": { icon: "Utensils", color: "bg-orange-100 text-orange-600" },
    "Transportation": { icon: "Car", color: "bg-blue-100 text-blue-600" },
    "Shopping": { icon: "ShoppingBag", color: "bg-purple-100 text-purple-600" },
    "Entertainment": { icon: "Music", color: "bg-pink-100 text-pink-600" },
    "Bills & Utilities": { icon: "Receipt", color: "bg-yellow-100 text-yellow-600" },
    "Healthcare": { icon: "Heart", color: "bg-red-100 text-red-600" },
    "Education": { icon: "BookOpen", color: "bg-indigo-100 text-indigo-600" },
    "Travel": { icon: "Plane", color: "bg-green-100 text-green-600" },
    "Income": { icon: "TrendingUp", color: "bg-success-100 text-success-600" },
    "Investment": { icon: "PieChart", color: "bg-primary-100 text-primary-600" },
    "Other": { icon: "MoreHorizontal", color: "bg-gray-100 text-gray-600" },
  };

  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5", 
    lg: "w-6 h-6",
  };

  const categoryData = categoryIcons[category] || categoryIcons["Other"];

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center",
      sizes[size],
      categoryData.color,
      className
    )}>
      <ApperIcon name={categoryData.icon} className={iconSizes[size]} />
    </div>
  );
};

export default CategoryIcon;