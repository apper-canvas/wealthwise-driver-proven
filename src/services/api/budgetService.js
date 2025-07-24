import budgetData from "@/services/mockData/budgets.json";

// Simulate async delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let budgets = [...budgetData];

export const budgetService = {
  async getAll() {
    await delay(300);
    return [...budgets];
  },

  async getById(id) {
    await delay(200);
    const budget = budgets.find(b => b.Id === parseInt(id));
    if (!budget) {
      throw new Error("Budget not found");
    }
    return { ...budget };
  },

  async create(budgetData) {
    await delay(400);
    const maxId = Math.max(...budgets.map(b => b.Id), 0);
    const newBudget = {
      ...budgetData,
      Id: maxId + 1,
    };
    budgets.push(newBudget);
    return { ...newBudget };
  },

  async update(id, budgetData) {
    await delay(400);
    const index = budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }
    budgets[index] = { ...budgets[index], ...budgetData };
    return { ...budgets[index] };
  },

  async delete(id) {
    await delay(300);
    const index = budgets.findIndex(b => b.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Budget not found");
    }
    budgets.splice(index, 1);
    return true;
  }
};