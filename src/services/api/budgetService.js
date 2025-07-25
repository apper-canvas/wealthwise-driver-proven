// Budget Service - Apper API integration
// Initialize ApperClient with Project ID and Public Key
const getApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

const TABLE_NAME = 'budget_c';

export const budgetService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      
const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "category_c" } },
          { field: { Name: "limit_c" } },
          { field: { Name: "period_c" } },
          { field: { Name: "spent_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "CreatedOn" } }
        ],
        orderBy: [
          {
            fieldName: "category_c",
            sorttype: "ASC"
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
category: record.category_c || '',
        limit: record.limit_c || 0,
        period: record.period_c || 'monthly',
        spent: record.spent_c || 0,
        description: record.description_c || '',
        created_at: record.CreatedOn || ''
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching budgets from budget service:", error?.response?.data?.message);
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
          { field: { Name: "category_c" } },
          { field: { Name: "limit_c" } },
          { field: { Name: "period_c" } },
          { field: { Name: "spent_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "CreatedOn" } }
        ]
      };
      
      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (!response.data) {
        throw new Error("Budget not found");
      }
      
      // Transform database fields to UI format
      const record = response.data;
return {
        Id: record.Id,
        category: record.category_c || '',
        limit: record.limit_c || 0,
        period: record.period_c || 'monthly',
        spent: record.spent_c || 0,
        description: record.description_c || '',
        created_at: record.CreatedOn || ''
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching budget with ID ${id} from budget service:`, error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async create(budgetData) {
    try {
      const apperClient = getApperClient();
      
      // Transform UI data to database format - only include Updateable fields
const dbData = {
        Name: budgetData.category || 'Budget',
        category_c: budgetData.category || '',
        limit_c: parseFloat(budgetData.limit) || 0,
        period_c: budgetData.period || 'monthly',
        spent_c: parseFloat(budgetData.spent) || 0,
        description_c: budgetData.description || ''
        // CreatedOn is a system field and will be automatically set by the database
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
          console.error(`Failed to create budget ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
            category: record.category_c || '',
            limit: record.limit_c || 0,
            period: record.period_c || 'monthly',
            spent: record.spent_c || 0,
            description: record.description_c || '',
            created_at: record.CreatedOn || ''
          };
        }
      }
      
      throw new Error("Failed to create budget");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating budget in budget service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
  },

  async update(id, budgetData) {
    try {
      const apperClient = getApperClient();
      
      // Transform UI data to database format - only include Updateable fields
      const dbData = {
Id: parseInt(id),
        Name: budgetData.category || 'Budget',
        category_c: budgetData.category || '',
        limit_c: parseFloat(budgetData.limit) || 0,
        period_c: budgetData.period || 'monthly',
        spent_c: parseFloat(budgetData.spent) || 0,
        description_c: budgetData.description || ''
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
          console.error(`Failed to update budget ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
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
            category: record.category_c || '',
            limit: record.limit_c || 0,
            period: record.period_c || 'monthly',
            spent: record.spent_c || 0,
            description: record.description_c || '',
            created_at: record.CreatedOn || ''
          };
        }
      }
      
      throw new Error("Failed to update budget");
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating budget in budget service:", error?.response?.data?.message);
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
          console.error(`Failed to delete budget ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return response.results.some(result => result.success);
      }
      
      return false;
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting budget in budget service:", error?.response?.data?.message);
      } else {
        console.error(error.message);
      }
      throw error;
    }
}
};