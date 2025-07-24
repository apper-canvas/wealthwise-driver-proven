import transactionData from "@/services/mockData/transactions.json";

// Simulate async delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let transactions = [...transactionData];

export const transactionService = {
  async getAll() {
    await delay(300);
    return [...transactions];
  },

  async getById(id) {
    await delay(200);
    const transaction = transactions.find(t => t.Id === parseInt(id));
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    return { ...transaction };
  },

  async create(transactionData) {
    await delay(400);
    const maxId = Math.max(...transactions.map(t => t.Id), 0);
    const newTransaction = {
      ...transactionData,
      Id: maxId + 1,
    };
    transactions.push(newTransaction);
    return { ...newTransaction };
  },

  async update(id, transactionData) {
    await delay(400);
    const index = transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
    transactions[index] = { ...transactions[index], ...transactionData };
    return { ...transactions[index] };
  },

  async delete(id) {
    await delay(300);
    const index = transactions.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Transaction not found");
    }
transactions.splice(index, 1);
    return true;
  },

  // Bank connection functionality
  async connectBank({ bankId, credentials }) {
    await delay(2000); // Simulate authentication time
    
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
    await delay(3000); // Simulate import time
    
    // Generate sample imported transactions
    const sampleTransactions = [
      {
        date: new Date().toISOString().split('T')[0],
        amount: -45.67,
        description: "Starbucks Coffee #1234",
        merchant: "Starbucks",
        accountType: "checking"
      },
      {
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        amount: -89.23,
        description: "Shell Gas Station",
        merchant: "Shell",
        accountType: "checking"
      },
      {
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        amount: -156.78,
        description: "Whole Foods Market",
        merchant: "Whole Foods",
        accountType: "checking"
      },
      {
        date: new Date(Date.now() - 259200000).toISOString().split('T')[0],
        amount: 2500.00,
        description: "Direct Deposit - Payroll",
        merchant: "Employer",
        accountType: "checking"
      },
      {
        date: new Date(Date.now() - 345600000).toISOString().split('T')[0],
        amount: -1200.00,
        description: "Rent Payment",
        merchant: "Property Management",
        accountType: "checking"
      },
      {
        date: new Date(Date.now() - 432000000).toISOString().split('T')[0],
        amount: -67.45,
        description: "Amazon.com Purchase",
        merchant: "Amazon",
        accountType: "credit"
      }
    ];

    // Transform and categorize imported transactions
    const maxId = Math.max(...transactions.map(t => t.Id), 0);
    let newId = maxId + 1;

    const importedTransactions = sampleTransactions.map((rawTx, index) => {
      const categorizedTx = this.categorizeTransaction(rawTx);
      return {
        Id: newId + index,
        amount: rawTx.amount,
        description: rawTx.description,
        date: rawTx.date,
        category: categorizedTx.category,
        type: rawTx.amount > 0 ? 'income' : 'expense',
        merchant: rawTx.merchant,
        accountType: rawTx.accountType,
        imported: true,
        bankId: bankId
      };
    });

    // Add to transactions array
    transactions.push(...importedTransactions);

    return {
      success: true,
      count: importedTransactions.length,
      transactions: importedTransactions
    };
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
        category: 'Housing'
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

    // Default category based on amount
    if (transaction.amount > 0) {
      return { category: 'Income' };
    } else {
      return { category: 'Other' };
    }
  }
};