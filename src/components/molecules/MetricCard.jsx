import React from "react";
import { motion } from "framer-motion";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon, 
  iconColor = "primary",
  className 
}) => {
  const iconColors = {
    primary: "text-primary-500 bg-primary-100",
    secondary: "text-secondary-500 bg-secondary-100",
    success: "text-success-500 bg-success-100",
    warning: "text-yellow-500 bg-yellow-100",
    danger: "text-red-500 bg-red-100",
  };

  const changeColors = {
    positive: "text-success-600",
    negative: "text-red-600",
    neutral: "text-gray-600",
  };

  return (
    <Card className={cn("p-6", className)} hover>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <motion.p 
            className="text-2xl font-bold text-gray-900 mb-2"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.p>
          {change && (
            <div className={cn("flex items-center text-sm", changeColors[changeType])}>
              <ApperIcon 
                name={changeType === "positive" ? "TrendingUp" : changeType === "negative" ? "TrendingDown" : "Minus"} 
                className="w-4 h-4 mr-1" 
              />
              {change}
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl", iconColors[iconColor])}>
            <ApperIcon name={icon} className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;