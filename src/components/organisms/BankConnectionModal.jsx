import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import FormField from "@/components/molecules/FormField";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { transactionService } from "@/services/api/transactionService";

const BankConnectionModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState('select'); // select, authenticate, importing, success
  const [selectedBank, setSelectedBank] = useState('');
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    accountNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [importedCount, setImportedCount] = useState(0);

  const supportedBanks = [
    { id: 'chase', name: 'Chase Bank', logo: '🏦' },
    { id: 'bofa', name: 'Bank of America', logo: '🏛️' },
    { id: 'wellsfargo', name: 'Wells Fargo', logo: '🐴' },
    { id: 'citi', name: 'Citibank', logo: '🏢' },
    { id: 'pnc', name: 'PNC Bank', logo: '🏪' },
    { id: 'usbank', name: 'U.S. Bank', logo: '🇺🇸' }
  ];

  const handleBankSelect = (bankId) => {
    setSelectedBank(bankId);
    setError('');
  };

  const handleCredentialsChange = (field, value) => {
    setCredentials(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleConnect = async () => {
    if (!selectedBank) {
      setError('Please select a bank');
      return;
    }

    if (!credentials.username || !credentials.password) {
      setError('Please enter your credentials');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Step 1: Authenticate with bank
      setStep('authenticate');
      toast.info('Connecting to your bank...');
      
      const connectionResult = await transactionService.connectBank({
        bankId: selectedBank,
        credentials: credentials
      });

      if (!connectionResult.success) {
        throw new Error(connectionResult.error || 'Authentication failed');
      }

      // Step 2: Import transactions
      setStep('importing');
      toast.info('Importing your transactions...');
      
      const importResult = await transactionService.importTransactions(selectedBank);
      setImportedCount(importResult.count);

      // Step 3: Success
      setStep('success');
      toast.success(`Successfully imported ${importResult.count} transactions!`);
      
      setTimeout(() => {
        onSuccess && onSuccess(importResult);
        handleClose();
      }, 3000);

    } catch (err) {
      setError(err.message);
      setStep('select');
      toast.error(`Connection failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedBank('');
    setCredentials({ username: '', password: '', accountNumber: '' });
    setError('');
    setLoading(false);
    setImportedCount(0);
    onClose();
  };

  const getSelectedBankInfo = () => {
    return supportedBanks.find(bank => bank.id === selectedBank);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-display gradient-text">
              Connect Bank Account
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="p-2"
              disabled={loading}
            >
              <ApperIcon name="X" size={20} />
            </Button>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            {step === 'select' && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-gray-600 mb-6">
                  Select your bank to securely connect and import your transactions.
                </p>

                {/* Bank Selection */}
                <div className="space-y-3 mb-6">
                  {supportedBanks.map((bank) => (
                    <Card
                      key={bank.id}
                      className={`p-4 cursor-pointer transition-all border-2 ${
                        selectedBank === bank.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleBankSelect(bank.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{bank.logo}</span>
                        <span className="font-medium">{bank.name}</span>
                        {selectedBank === bank.id && (
                          <ApperIcon name="Check" className="ml-auto text-primary-600" size={20} />
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Credentials Form */}
                {selectedBank && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 mb-6"
                  >
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-2">
                        <ApperIcon name="Shield" className="text-blue-600 mt-0.5" size={16} />
                        <div className="text-sm">
                          <p className="font-medium text-blue-900 mb-1">Secure Connection</p>
                          <p className="text-blue-700">
                            Your credentials are encrypted and never stored. We use bank-level security.
                          </p>
                        </div>
                      </div>
                    </div>

                    <FormField
                      label="Username/Email"
                      required
                      error={error && !credentials.username ? 'Username is required' : ''}
                    >
                      <Input
                        type="text"
                        value={credentials.username}
                        onChange={(e) => handleCredentialsChange('username', e.target.value)}
                        placeholder="Enter your online banking username"
                        disabled={loading}
                      />
                    </FormField>

                    <FormField
                      label="Password"
                      required
                      error={error && !credentials.password ? 'Password is required' : ''}
                    >
                      <Input
                        type="password"
                        value={credentials.password}
                        onChange={(e) => handleCredentialsChange('password', e.target.value)}
                        placeholder="Enter your online banking password"
                        disabled={loading}
                      />
                    </FormField>

                    <FormField
                      label="Account Number (Optional)"
                    >
                      <Input
                        type="text"
                        value={credentials.accountNumber}
                        onChange={(e) => handleCredentialsChange('accountNumber', e.target.value)}
                        placeholder="Specific account to import (leave blank for all)"
                        disabled={loading}
                      />
                    </FormField>
                  </motion.div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <ApperIcon name="AlertCircle" className="text-red-600" size={16} />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConnect}
                    disabled={!selectedBank || loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <ApperIcon name="Loader2" className="animate-spin" size={16} />
                        <span>Connecting...</span>
                      </div>
                    ) : (
                      'Connect Bank'
                    )}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 'authenticate' && (
              <motion.div
                key="authenticate"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ApperIcon name="Shield" className="w-10 h-10 text-blue-600 animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Authenticating...</h3>
                <p className="text-gray-600 mb-4">
                  Securely connecting to {getSelectedBankInfo()?.name}
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ApperIcon name="Loader2" className="animate-spin" size={16} />
                  <span>This may take a few moments</span>
                </div>
              </motion.div>
            )}

            {step === 'importing' && (
              <motion.div
                key="importing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ApperIcon name="Download" className="w-10 h-10 text-green-600 animate-bounce" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Importing Transactions...</h3>
                <p className="text-gray-600 mb-4">
                  Fetching and categorizing your recent transactions
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <ApperIcon name="Loader2" className="animate-spin" size={16} />
                  <span>Processing transaction data</span>
                </div>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ApperIcon name="CheckCircle" className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Successfully Connected!</h3>
                <p className="text-gray-600 mb-4">
                  Imported {importedCount} transactions from {getSelectedBankInfo()?.name}
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                    <ApperIcon name="Info" size={16} />
                    <span>Transactions have been automatically categorized</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Closing automatically in a few seconds...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BankConnectionModal;