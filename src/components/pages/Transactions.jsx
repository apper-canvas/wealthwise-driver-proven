import React, { useState } from "react";
import TransactionsList from "@/components/organisms/TransactionsList";
import TransactionForm from "@/components/organisms/TransactionForm";

const Transactions = () => {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
    </div>
  );
};

export default Transactions;