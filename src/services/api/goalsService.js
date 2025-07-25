// Initialize ApperClient with Project ID and Public Key
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const TABLE_NAME = 'goal_c';

export const goalsService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [
          {
            fieldName: "created_at_c",
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
        name: record.Name || '',
        targetAmount: record.target_amount_c || 0,
        currentAmount: record.current_amount_c || 0,
        targetDate: record.target_date_c || new Date().toISOString().split('T')[0],
        icon: record.icon_c || 'Target',
        notes: record.notes_c || '',
        createdAt: record.created_at_c || new Date().toISOString()
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching goals from goals service:", error?.response?.data?.message);
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
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "notes_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error("Goal not found");
      }
      
      // Transform database fields to UI format
      const record = response.data;
      return {
        Id: record.Id,
        name: record.Name || '',
        targetAmount: record.target_amount_c || 0,
        currentAmount: record.current_amount_c || 0,
        targetDate: record.target_date_c || new Date().toISOString().split('T')[0],
        icon: record.icon_c || 'Target',
        notes: record.notes_c || '',
        createdAt: record.created_at_c || new Date().toISOString()
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching goal with ID ${id} from goals service:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(goalData) {
    try {
      const apperClient = getApperClient();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Name: goalData.name || 'Goal',
        target_amount_c: parseFloat(goalData.targetAmount) || 0,
        current_amount_c: parseFloat(goalData.currentAmount) || 0,
        target_date_c: goalData.targetDate || new Date().toISOString().split('T')[0],
        icon_c: goalData.icon || 'Target',
        notes_c: goalData.notes || '',
        created_at_c: goalData.createdAt || new Date().toISOString()
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
          console.error(`Failed to create goal ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
            name: record.Name || '',
            targetAmount: record.target_amount_c || 0,
            currentAmount: record.current_amount_c || 0,
            targetDate: record.target_date_c || new Date().toISOString().split('T')[0],
            icon: record.icon_c || 'Target',
            notes: record.notes_c || '',
            createdAt: record.created_at_c || new Date().toISOString()
          };
        }
      }
      
      throw new Error("Failed to create goal");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating goal in goals service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, goalData) {
    try {
      const apperClient = getApperClient();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
        Id: parseInt(id),
        Name: goalData.name || 'Goal',
        target_amount_c: parseFloat(goalData.targetAmount) || 0,
        current_amount_c: parseFloat(goalData.currentAmount) || 0,
        target_date_c: goalData.targetDate || new Date().toISOString().split('T')[0],
        icon_c: goalData.icon || 'Target',
        notes_c: goalData.notes || '',
        created_at_c: goalData.createdAt || new Date().toISOString()
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
          console.error(`Failed to update goal ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
            name: record.Name || '',
            targetAmount: record.target_amount_c || 0,
            currentAmount: record.current_amount_c || 0,
            targetDate: record.target_date_c || new Date().toISOString().split('T')[0],
            icon: record.icon_c || 'Target',
            notes: record.notes_c || '',
            createdAt: record.created_at_c || new Date().toISOString()
          };
        }
      }
      
      throw new Error("Failed to update goal");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating goal in goals service:", error?.response?.data?.message);
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
          console.error(`Failed to delete goal ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting goal in goals service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  }
};