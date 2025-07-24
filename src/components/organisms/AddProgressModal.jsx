import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { goalsService } from "@/services/api/goalsService";

const AddProgressModal = ({ isOpen, onClose, goal, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAmount = () => {
    if (!amount || amount.trim() === "") {
      setError("Amount is required");
      return false;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Amount must be greater than 0");
      return false;
    }

    if (goal && (goal.currentAmount + numericAmount) > goal.targetAmount) {
      setError("Adding this amount would exceed the goal target");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateAmount()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const numericAmount = parseFloat(amount);
      const updatedGoal = await goalsService.update(goal.Id, {
        ...goal,
        currentAmount: goal.currentAmount + numericAmount
      });
      
      toast.success(`Added $${numericAmount.toFixed(2)} to ${goal.name}!`);
      
      // Reset form
      setAmount("");
      setError("");
      
      onSuccess?.(updatedGoal);
      onClose?.();
    } catch (error) {
      toast.error("Failed to add progress. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (value) => {
    setAmount(value);
    if (error) {
      setError("");
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setAmount("");
      setError("");
      onClose?.();
    }
  };

  const remainingAmount = goal ? goal.targetAmount - goal.currentAmount : 0;
  const progressPercentage = goal ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;

  return (
    <AnimatePresence>
      {isOpen && goal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-display gradient-text">
                  Add Progress
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              {/* Goal Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary-100 rounded-full">
                    <ApperIcon name={goal.icon} className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                    <p className="text-sm text-gray-600">
                      ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>{progressPercentage}% complete</span>
                  <span>${remainingAmount.toLocaleString()} remaining</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Amount to Add"
                  error={error}
                  required
                >
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => handleInputChange(e.target.value)}
                    disabled={isSubmitting}
                    autoFocus
                  />
                </FormField>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <ApperIcon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                        Add Progress
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddProgressModal;