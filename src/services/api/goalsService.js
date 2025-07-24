import goalsData from "@/services/mockData/goals.json";

// Simulate async delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage to persist changes during session
let goals = [...goalsData];

export const goalsService = {
  async getAll() {
    await delay(300);
    return [...goals];
  },

  async getById(id) {
    await delay(200);
    const goal = goals.find(g => g.Id === parseInt(id));
    if (!goal) {
      throw new Error("Goal not found");
    }
    return { ...goal };
  },

  async create(goalData) {
    await delay(400);
    const maxId = Math.max(...goals.map(g => g.Id), 0);
    const newGoal = {
      ...goalData,
      Id: maxId + 1,
    };
    goals.push(newGoal);
    return { ...newGoal };
  },

  async update(id, goalData) {
    await delay(400);
    const index = goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Goal not found");
    }
    goals[index] = { ...goals[index], ...goalData };
    return { ...goals[index] };
  },

  async delete(id) {
    await delay(300);
    const index = goals.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Goal not found");
    }
    goals.splice(index, 1);
    return true;
  }
};