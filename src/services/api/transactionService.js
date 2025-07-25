// Initialize ApperClient with Project ID and Public Key
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const TABLE_NAME = 'transaction_c';

export const transactionService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "recurring_c" } },
          { field: { Name: "merchant_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "imported_c" } },
          { field: { Name: "bank_id_c" } }
        ],
        orderBy: [
          {
            fieldName: "date_c",
            sorttype: "DESC"
          }
        ]
      };
      
      const response = await apperClient.fetchRecords(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Transform database fields to UI format
      return response.data.map(record => ({
        Id: record.Id,
        amount: record.amount_c || 0,
        type: record.type_c || 'expense',
        category: record.category_c || 'Other',
        description: record.description_c || record.Name || '',
        date: record.date_c || new Date().toISOString().split('T')[0],
        recurring: record.recurring_c === 'recurring' || false,
        merchant: record.merchant_c || '',
        accountType: record.account_type_c || '',
        imported: record.imported_c || false,
        bankId: record.bank_id_c || ''
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching transactions from transaction service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "recurring_c" } },
          { field: { Name: "merchant_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "imported_c" } },
          { field: { Name: "bank_id_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error("Transaction not found");
      }
      
      // Transform database fields to UI format
      const record = response.data;
      return {
        Id: record.Id,
        amount: record.amount_c || 0,
        type: record.type_c || 'expense',
        category: record.category_c || 'Other',
        description: record.description_c || record.Name || '',
        date: record.date_c || new Date().toISOString().split('T')[0],
        recurring: record.recurring_c === 'recurring' || false,
        merchant: record.merchant_c || '',
        accountType: record.account_type_c || '',
        imported: record.imported_c || false,
        bankId: record.bank_id_c || ''
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching transaction with ID ${id} from transaction service:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(transactionData) {
    try {
      const apperClient = getApperClient();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Name: transactionData.description || 'Transaction',
        amount_c: parseFloat(transactionData.amount) || 0,
        type_c: transactionData.type || 'expense',
        category_c: transactionData.category || 'Other',
        description_c: transactionData.description || '',
        date_c: transactionData.date || new Date().toISOString().split('T')[0],
        recurring_c: transactionData.recurring ? 'recurring' : '',
        merchant_c: transactionData.merchant || '',
        account_type_c: transactionData.accountType || '',
        imported_c: transactionData.imported || false,
        bank_id_c: transactionData.bankId || ''
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.createRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          // Transform back to UI format
          const record = successfulRecord.data;
          return {
            Id: record.Id,
            amount: record.amount_c || 0,
            type: record.type_c || 'expense',
            category: record.category_c || 'Other',
            description: record.description_c || record.Name || '',
            date: record.date_c || new Date().toISOString().split('T')[0],
            recurring: record.recurring_c === 'recurring' || false,
            merchant: record.merchant_c || '',
            accountType: record.account_type_c || '',
            imported: record.imported_c || false,
            bankId: record.bank_id_c || ''
          };
        }
      }
      
      throw new Error("Failed to create transaction");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating transaction in transaction service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, transactionData) {
    try {
      const apperClient = getApperClient();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Id: parseInt(id),
        Name: transactionData.description || 'Transaction',
        amount_c: parseFloat(transactionData.amount) || 0,
        type_c: transactionData.type || 'expense',
        category_c: transactionData.category || 'Other',
        description_c: transactionData.description || '',
        date_c: transactionData.date || new Date().toISOString().split('T')[0],
        recurring_c: transactionData.recurring ? 'recurring' : '',
        merchant_c: transactionData.merchant || '',
        account_type_c: transactionData.accountType || '',
        imported_c: transactionData.imported || false,
        bank_id_c: transactionData.bankId || ''
      };
      
      const params = {
        records: [dbData]
      };
      
      const response = await apperClient.updateRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to update transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        const successfulRecord = response.results.find(result => result.success);
        if (successfulRecord) {
          // Transform back to UI format
          const record = successfulRecord.data;
          return {
            Id: record.Id,
            amount: record.amount_c || 0,
            type: record.type_c || 'expense',
            category: record.category_c || 'Other',
            description: record.description_c || record.Name || '',
            date: record.date_c || new Date().toISOString().split('T')[0],
            recurring: record.recurring_c === 'recurring' || false,
            merchant: record.merchant_c || '',
            accountType: record.account_type_c || '',
            imported: record.imported_c || false,
            bankId: record.bank_id_c || ''
          };
        }
      }
      
      throw new Error("Failed to update transaction");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating transaction in transaction service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord(TABLE_NAME, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to delete transaction ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting transaction in transaction service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  // Bank connection functionality (preserved from original implementation)
  async connectBank({ bankId, credentials }) {
    // Simulate authentication time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate random connection failures (20% chance)
    if (Math.random() < 0.2) {
      const errors = [
        'Invalid credentials. Please check your username and password.',
        'Bank connection temporarily unavailable. Please try again later.',
        'Account locked. Please contact your bank.',
        'Two-factor authentication required. Please enable it in your bank settings.'
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }

    return {
      success: true,
      bankId,
      connectionId: `conn_${Date.now()}`,
      accountsFound: Math.floor(Math.random() * 3) + 1
    };
  },

  async importTransactions(bankId) {
    // Simulate import time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate sample imported transactions
    const sampleTransactions = [
      {
        date: new Date().toISOString().split('T')[0],
        amount: 45.67,
        description: "Starbucks Coffee #1234",
        merchant: "Starbucks",
        accountType: "checking",
        type: "expense"
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        amount: 89.23,
        description: "Shell Gas Station",
        merchant: "Shell",
        accountType: "checking",
        type: "expense"
      },
      {
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        amount: 156.78,
        description: "Whole Foods Market",
        merchant: "Whole Foods",
        accountType: "checking",
        type: "expense"
      },
      {
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        amount: 2500.00,
        description: "Direct Deposit - Payroll",
        merchant: "Employer",
        accountType: "checking",
        type: "income"
      }
    ];

    try {
      // Create transactions using the service's create method
      const importedTransactions = [];
      for (const rawTx of sampleTransactions) {
        const categorizedTx = this.categorizeTransaction(rawTx);
        const transactionData = {
          amount: rawTx.amount,
          description: rawTx.description,
          date: rawTx.date,
          category: categorizedTx.category,
          type: rawTx.type,
          merchant: rawTx.merchant,
          accountType: rawTx.accountType,
          imported: true,
          bankId: bankId
        };
        
        const created = await this.create(transactionData);
        importedTransactions.push(created);
      }

      return {
        success: true,
        count: importedTransactions.length,
        transactions: importedTransactions
      };
    } catch (error) {
      console.error("Error importing transactions:", error);
      throw error;
    }
  },

  categorizeTransaction(transaction) {
    const description = transaction.description.toLowerCase();
    const merchant = transaction.merchant?.toLowerCase() || '';
    
    // Predefined categorization rules
    const categoryRules = [
      // Food & Dining
      {
        keywords: ['starbucks', 'mcdonalds', 'subway', 'restaurant', 'cafe', 'pizza', 'burger'],
        category: 'Food & Dining'
      },
      // Transportation
      {
        keywords: ['shell', 'exxon', 'chevron', 'gas', 'uber', 'lyft', 'taxi', 'parking'],
        category: 'Transportation'
      },
      // Groceries
      {
        keywords: ['whole foods', 'safeway', 'kroger', 'walmart', 'grocery', 'supermarket'],
        category: 'Groceries'
      },
      // Shopping
      {
        keywords: ['amazon', 'target', 'best buy', 'apple', 'store', 'purchase'],
        category: 'Shopping'
      },
      // Housing
      {
        keywords: ['rent', 'mortgage', 'property', 'utilities', 'electric', 'water', 'internet'],
        category: 'Bills & Utilities'
      },
      // Income
      {
        keywords: ['payroll', 'salary', 'deposit', 'income', 'refund', 'cashback'],
        category: 'Income'
      },
      // Healthcare
      {
        keywords: ['pharmacy', 'doctor', 'hospital', 'medical', 'health', 'dental'],
        category: 'Healthcare'
      },
      // Entertainment
      {
        keywords: ['netflix', 'spotify', 'movie', 'theater', 'entertainment', 'subscription'],
        category: 'Entertainment'
      }
    ];

    // Find matching category
    for (const rule of categoryRules) {
      if (rule.keywords.some(keyword => 
        description.includes(keyword) || merchant.includes(keyword)
      )) {
        return { category: rule.category };
      }
    }

    // Default category based on amount/type
    if (transaction.type === 'income' || transaction.amount > 0) {
      return { category: 'Income' };
    } else {
      return { category: 'Other' };
    }
}
};