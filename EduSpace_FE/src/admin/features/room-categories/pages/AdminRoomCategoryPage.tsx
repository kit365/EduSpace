import React, { useState } from 'react';
import { useAdminCategories, useUpdateCategory } from '@/client/features/customer/spaces/hooks/useSpaces';
import { Loader2, Star, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { RoomCategoryDto } from '@/client/features/room';

export function AdminRoomCategoryPage() {
  const { data: categories, loading, refresh } = useAdminCategories();
  const { update, loading: updating } = useUpdateCategory();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<RoomCategoryDto>>({});

  const handleToggleFeatured = async (category: RoomCategoryDto) => {
    try {
      await update(category.id, { isFeatured: !category.isFeatured });
      refresh();
    } catch (err) {
      alert('Failed to update');
    }
  };

  const handleEdit = (category: RoomCategoryDto) => {
    setEditingId(category.id);
    setEditForm({ 
        description: category.description, 
        image: category.image 
    });
  };

  const handleSave = async (id: number) => {
    try {
      await update(id, editForm);
      setEditingId(null);
      refresh();
    } catch (err) {
      alert('Save failed');
    }
  };

  if (loading) return <div className="flex p-20 justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý danh mục phòng</h1>
          <p className="text-gray-500">Chỉnh sửa thông tin và đánh dấu danh mục nổi bật</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="aspect-video relative">
              <img 
                src={category.image} 
                className="w-full h-full object-cover" 
                alt={category.name} 
              />
              <button 
                onClick={() => handleToggleFeatured(category)}
                className={`absolute top-2 right-2 p-2 rounded-full shadow-lg ${category.isFeatured ? 'bg-yellow-400 text-white' : 'bg-white/80 text-gray-400 hover:text-yellow-400'}`}
              >
                <Star className="w-5 h-5 fill-current" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{category.name}</h3>
                  <code className="text-xs bg-gray-100 px-1 rounded text-gray-500">{category.slug}</code>
                </div>
              </div>

              {editingId === category.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea 
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">URL Hình ảnh</label>
                    <input 
                      type="text"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                      value={editForm.image || ''}
                      onChange={(e) => setEditForm({...editForm, image: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleSave(category.id)}
                      disabled={updating}
                      className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 flex items-center justify-center gap-1"
                    >
                      {updating && <Loader2 className="w-4 h-4 animate-spin" />}
                      Lưu
                    </button>
                    <button 
                      onClick={() => setEditingId(null)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {category.description || 'Không có mô tả'}
                  </p>
                  <button 
                    onClick={() => handleEdit(category)}
                    className="w-full py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Chỉnh sửa
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
