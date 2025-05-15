import axios from 'axios';

export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  parentCategoryId: string | null;
  isActive: boolean;
  listingsCount: number;
  subCategories?: Category[];
  listings?: any[]; // Replace with proper listing type if available
}

export interface CreateCategoryData {
  name: string;
  description: string;
  imageUrl: string;
  parentCategoryId: string | null;
}

export interface UpdateCategoryData {
  name: string;
  description: string;
}

class CategoryService {
  private readonly baseUrl = `/Category`;

  // Get all categories
  async getAllCategories(): Promise<Category[]> {
    const response = await axios.get(`${this.baseUrl}/get-all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  }

  // Get active categories
  async getActiveCategories(): Promise<Category[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/actives`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Active categories response:', response); // للتحقق من شكل البيانات
      return response.data.data || [];
    } catch (error) {
      console.error('Error in getActiveCategories:', error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<Category> {
    try {
      const response = await axios.get(`${this.baseUrl}/get/${id}`);
      console.log('Category response:', response); // للتحقق من شكل البيانات
      // تأكد من أن البيانات موجودة في response.data.data
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error in getCategoryById:', error);
      throw error;
    }
  }

  // Get subcategories by parent ID
  async getSubcategoriesByParentId(parentId: string): Promise<Category[]> {
    const response = await axios.get(`${this.baseUrl}/by-parent/${parentId}`);
    return response.data;
  }

  // Create new category (Admin only)
  async createCategory(data: CreateCategoryData): Promise<Category> {
    console.log("بيانات الإرسال:", data);
    console.log("التوكن المستخدم:", localStorage.getItem('token'));
    const response = await axios.post(`${this.baseUrl}/Create`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  // Update category (Admin only)
  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await axios.put(`${this.baseUrl}/update/${id}`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }

  // Delete category (Admin only)
  async deleteCategory(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/delete/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
}

export const categoryService = new CategoryService(); 