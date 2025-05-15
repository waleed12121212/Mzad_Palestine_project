import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

class ImageService {
  async uploadImage(file: File): Promise<{ url: string; path: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('http://mazadpalestine.runasp.net/Image/upload', formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        }
      });

      if (!response.data?.success || !response.data?.data?.url) {
        throw new Error('فشل تحميل الصورة');
      }

      const imageUrl = response.data.data.url.startsWith('http') 
        ? response.data.data.url 
        : `http://mazadpalestine.runasp.net${response.data.data.url}`;

      return {
        url: imageUrl,
        path: response.data.data.path
      };
    } catch (error: any) {
      console.error('Image upload error:', error);
      throw new Error(error.response?.data?.message || 'فشل تحميل الصورة');
    }
  }

  async deleteImage(imagePath: string): Promise<void> {
    try {
      const path = imagePath.includes('mazadpalestine.runasp.net') 
        ? imagePath.split('mazadpalestine.runasp.net')[1]
        : imagePath;

      await axios.delete(`http://mazadpalestine.runasp.net${path}`, {
        headers: getAuthHeader()
      });
    } catch (error: any) {
      console.error('Image deletion error:', error);
      throw new Error(error.response?.data?.message || 'فشل حذف الصورة');
    }
  }
}

export const imageService = new ImageService(); 