import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { budgetService } from "@/services/api/budgetService";

const BudgetForm = ({ isOpen, onClose, onSave, budget }) => {
const [formData, setFormData] = useState({
    category: "",
    limit: "",
    period: "monthly",
    created_at: ""
  });

const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data when budget prop changes
React.useEffect(() => {
    if (budget) {
      setFormData({
        category: budget.category || "",
        limit: budget.limit?.toString() || "",
        period: budget.period || "monthly",
        created_at: budget.created_at || ""
      });
    } else {
      setFormData({
        category: "",
        limit: "",
        period: "monthly",
        created_at: ""
      });
    }
    setErrors({});
  }, [budget, isOpen]);
  const categories = [
    "Food & Dining",
    "Transportation", 
    "Shopping",
    "Entertainment",
    "Bills & Utilities",
    "Healthcare",
    "Education",
    "Travel",
    "Other"
  ];

  const periods = [
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      newErrors.limit = "Limit must be greater than 0";
    }

    if (!formData.period) {
      newErrors.period = "Period is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

try {
const budgetData = {
        ...formData,
        limit: parseFloat(formData.limit),
        ...(budget ? {} : { spent: 0 }) // Only set spent to 0 for new budgets
      };
      // Remove created_at from submission data since it's a system field
      delete budgetData.created_at;

      let savedBudget;
      if (budget) {
        // Update existing budget
        savedBudget = await budgetService.update(budget.Id, budgetData);
        toast.success("Budget updated successfully!");
      } else {
        // Create new budget
        savedBudget = await budgetService.create(budgetData);
        toast.success("Budget created successfully!");
      }
      
      onSave(savedBudget);
      handleClose();
} catch (error) {
      toast.error(budget ? "Failed to update budget" : "Failed to create budget");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    setFormData({
category: "",
      limit: "",
      period: "monthly",
      created_at: ""
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
<h2 className="text-xl font-bold text-gray-900">
                {budget ? "Edit Budget" : "Create New Budget"}
              </h2>
              <Button variant="ghost" onClick={handleClose}>
                <ApperIcon name="X" className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormField
                label="Category"
                error={errors.category}
                required
              >
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                  error={!!errors.category}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField
                label="Budget Limit"
                error={errors.limit}
                required
              >
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.limit}
                  onChange={(e) => handleInputChange("limit", e.target.value)}
                  error={!!errors.limit}
                />
              </FormField>

<FormField
                label="Period"
                error={errors.period}
                required
              >
                <Select
                  value={formData.period}
                  onChange={(e) => handleInputChange("period", e.target.value)}
                  error={!!errors.period}
                >
                  {periods.map((period) => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              {budget && (
                <FormField
                  label="Created At"
                  error={errors.created_at}
                >
                  <Input
                    type="datetime-local"
                    value={formData.created_at ? new Date(formData.created_at).toISOString().slice(0, 16) : ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </FormField>
              )}
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <ApperIcon name="Loader2" className="w-4 h-4" />
                    </motion.div>
) : (
                    <span>{budget ? "Update Budget" : "Create Budget"}</span>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BudgetForm;