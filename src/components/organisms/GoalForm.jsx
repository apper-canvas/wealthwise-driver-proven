import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { goalsService } from "@/services/api/goalsService";

const GoalForm = ({ isOpen, onClose, onSave }) => {
const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    currentAmount: "0",
    targetDate: "",
    icon: "Target",
    notes: ""
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const icons = [
    { value: "Target", label: "Target" },
    { value: "Home", label: "Home" },
    { value: "Car", label: "Car" },
    { value: "Plane", label: "Travel" },
    { value: "GraduationCap", label: "Education" },
    { value: "Heart", label: "Health" },
    { value: "Gift", label: "Gift" },
    { value: "Wallet", label: "Emergency Fund" },
    { value: "Briefcase", label: "Business" },
    { value: "Smartphone", label: "Electronics" }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Goal name is required";
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = "Target amount must be greater than 0";
    }

    if (formData.currentAmount && parseFloat(formData.currentAmount) < 0) {
      newErrors.currentAmount = "Current amount cannot be negative";
    }

    if (parseFloat(formData.currentAmount) > parseFloat(formData.targetAmount)) {
      newErrors.currentAmount = "Current amount cannot exceed target amount";
    }

    if (!formData.targetDate) {
      newErrors.targetDate = "Target date is required";
    } else {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate <= today) {
        newErrors.targetDate = "Target date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
const goalData = {
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount) || 0,
        targetDate: formData.targetDate,
        icon: formData.icon,
        notes: formData.notes.trim(),
        createdAt: new Date().toISOString()
      };

      const savedGoal = await goalsService.create(goalData);
      toast.success("Goal created successfully!");
      
      // Reset form
setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
        icon: "Target",
        notes: ""
      });
      setErrors({});
      
      onSave?.(savedGoal);
    } catch (error) {
      toast.error("Failed to create goal. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
setFormData({
        name: "",
        targetAmount: "",
        currentAmount: "0",
        targetDate: "",
        icon: "Target",
        notes: ""
      });
      setErrors({});
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                  Add New Goal
                </h2>
                <button
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                >
                  <ApperIcon name="X" className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  label="Goal Name"
                  error={errors.name}
                  required
                >
                  <Input
                    type="text"
                    placeholder="e.g., Emergency Fund, Vacation, New Car"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Target Amount"
                  error={errors.targetAmount}
                  required
                >
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={(e) => handleInputChange("targetAmount", e.target.value)}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Current Amount"
                  error={errors.currentAmount}
                >
                  <Input
                    type="number"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={(e) => handleInputChange("currentAmount", e.target.value)}
                    disabled={isSubmitting}
                  />
                </FormField>

                <FormField
                  label="Target Date"
                  error={errors.targetDate}
                  required
                >
                  <Input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => handleInputChange("targetDate", e.target.value)}
                    disabled={isSubmitting}
                  />
                </FormField>

<FormField
                  label="Icon"
                  error={errors.icon}
                >
                  <Select
                    value={formData.icon}
                    onChange={(value) => handleInputChange("icon", value)}
                    disabled={isSubmitting}
                  >
                    {icons.map((icon) => (
                      <option key={icon.value} value={icon.value}>
                        {icon.label}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  label="Notes"
                  error={errors.notes}
                >
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Add any notes or reminders for this goal..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
                        Create Goal
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

export default GoalForm;