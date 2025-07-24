import React, { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";
import { format } from "date-fns";

const TransactionForm = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: transaction?.amount || "",
    type: transaction?.type || "expense",
    category: transaction?.category || "",
    description: transaction?.description || "",
    date: transaction?.date || format(new Date(), "yyyy-MM-dd"),
    recurring: transaction?.recurring || false,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = {
    expense: [
      "Food & Dining",
      "Transportation", 
      "Shopping",
      "Entertainment",
      "Bills & Utilities",
      "Healthcare",
      "Education",
      "Travel",
      "Other"
    ],
    income: [
      "Salary",
      "Freelance",
      "Investment",
      "Business",
      "Gift",
      "Other"
    ]
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
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
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      let savedTransaction;
      if (transaction) {
        savedTransaction = await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        savedTransaction = await transactionService.create(transactionData);
        toast.success("Transaction added successfully!");
      }

      onSave(savedTransaction);
    } catch (error) {
      toast.error("Failed to save transaction");
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">
          {transaction ? "Edit Transaction" : "Add Transaction"}
        </h2>
        <Button variant="ghost" onClick={onCancel}>
          <ApperIcon name="X" className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Amount"
            error={errors.amount}
            required
          >
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              error={!!errors.amount}
            />
          </FormField>

          <FormField
            label="Type"
            error={errors.type}
            required
          >
            <Select
              value={formData.type}
              onChange={(e) => {
                handleInputChange("type", e.target.value);
                handleInputChange("category", "");
              }}
              error={!!errors.type}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
          </FormField>

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
              {categories[formData.type].map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField
            label="Date"
            error={errors.date}
            required
          >
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange("date", e.target.value)}
              error={!!errors.date}
            />
          </FormField>
        </div>

        <FormField
          label="Description"
          error={errors.description}
          required
        >
          <Input
            placeholder="Enter transaction description"
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            error={!!errors.description}
          />
        </FormField>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="recurring"
            checked={formData.recurring}
            onChange={(e) => handleInputChange("recurring", e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <label htmlFor="recurring" className="text-sm text-gray-700">
            Recurring transaction
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
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
              <span>{transaction ? "Update" : "Add"} Transaction</span>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TransactionForm;