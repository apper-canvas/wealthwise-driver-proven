import React, { useState } from "react";
import TransactionsList from "@/components/organisms/TransactionsList";
import TransactionForm from "@/components/organisms/TransactionForm";
import BankConnectionModal from "@/components/organisms/BankConnectionModal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
const Transactions = () => {
const [editingTransaction, setEditingTransaction] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleSave = () => {
    setEditingTransaction(null);
    setShowForm(false);
    // The TransactionsList will automatically refresh from the service
  };

  const handleCancel = () => {
    setEditingTransaction(null);
    setShowForm(false);
  };

const handleBankConnectionSuccess = (importResult) => {
    // Refresh the transactions list by triggering a re-render
    setShowForm(false);
    setEditingTransaction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display gradient-text">
            Transactions
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your income and expenses
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            onClick={() => setShowBankModal(true)}
            className="inline-flex items-center space-x-2"
          >
            <ApperIcon name="CreditCard" size={16} />
            <span>Connect Bank</span>
          </Button>
        </div>
      </div>

      {showForm ? (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <TransactionsList onEdit={handleEdit} />
      )}

      <BankConnectionModal
        isOpen={showBankModal}
        onClose={() => setShowBankModal(false)}
        onSuccess={handleBankConnectionSuccess}
      />
    </div>
  );
};

export default Transactions;