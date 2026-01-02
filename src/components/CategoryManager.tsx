
import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { EMOJI_LIST } from '../data/emojis';
import { X, Trash2, Plus, GripVertical } from 'lucide-react';

interface CategoryManagerProps {
  categories: Category[];
  onSave: (category: Category) => void;
  onDelete: (id: string) => void;
  onReorder: (newCategories: Category[]) => void;
  onClose: () => void;
  isExiting?: boolean;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ categories, onSave, onDelete, onReorder, onClose, isExiting }) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  
  const [localCategories, setLocalCategories] = useState(categories);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  // Sync local state when parent props change to ensure UI updates immediately
  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  if (!categories && !isExiting) return null; // Safety check

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory?.name) {
      onSave(editingCategory);
      setEditingCategory(null);
    }
  };

  const handleDelete = () => {
    if (editingCategory && window.confirm('Delete this category?')) {
      onDelete(editingCategory.id);
      setEditingCategory(null);
    }
  };

  const onDragStart = (index: number) => {
    setDraggedItemIndex(index);
  };

  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    
    const newItems = [...localCategories];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setLocalCategories(newItems);
    setDraggedItemIndex(index);
  };

  const onDragEnd = () => {
    setDraggedItemIndex(null);
    onReorder(localCategories);
  };

  const getStyle = (color: string) => {
      if (color.startsWith('#')) return { backgroundColor: color };
      return {}; 
  };

  return (
    <>
    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none p-4">
      <div className="absolute inset-0 bg-black/50 transition-opacity pointer-events-auto" onClick={onClose}></div>
      <div className={`bg-surface w-full max-w-md rounded-3xl max-h-[85vh] flex flex-col relative z-10 pointer-events-auto ${isExiting ? 'animate-out zoom-out-95 duration-200 fill-mode-forwards' : 'animate-in zoom-in-95 duration-200'}`}>
        
        <div className="px-6 pt-6 pb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-text-primary">Edit Categories</h2>
            <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-5 h-5 text-text-secondary" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-12">
            <div className="mb-4 text-center">
                <p className="text-xs font-medium text-text-secondary">Tap to Edit • Hold & Drag to Reorder</p>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
                {localCategories.map((cat, index) => (
                    <div 
                        key={cat.id}
                        draggable
                        onDragStart={() => onDragStart(index)}
                        onDragOver={(e) => onDragOver(e, index)}
                        onDragEnd={onDragEnd}
                        onClick={() => setEditingCategory(cat)}
                        className={`flex flex-col items-center justify-center p-2 bg-surface rounded-lg active:scale-95 transition-transform ${draggedItemIndex === index ? 'opacity-50' : ''} cursor-pointer group`}
                    >
                        {/* SQUIRCLE ICON: Standardized */}
                        <div 
                            className={`w-12 h-12 flex items-center justify-center text-xl mb-2 relative shadow-sm rounded-lg ${!cat.color.startsWith('#') ? cat.color : ''}`}
                            style={getStyle(cat.color)}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"><GripVertical className="w-3 h-3 text-gray-500"/></div>
                        </div>
                        <span className="text-[10px] font-bold text-text-primary text-center leading-tight w-full px-1">{cat.name}</span>
                    </div>
                ))}
                
                <button 
                    onClick={() => setEditingCategory({ id: `cat_${Date.now()}`, name: '', icon: '😊', color: CATEGORY_COLORS[0] })} 
                    className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-border rounded-lg text-text-secondary hover:border-primary/60 hover:text-primary/60 transition-colors active:scale-95 h-24"
                >
                   <Plus className="w-6 h-6 mb-1" />
                   <span className="text-[10px] font-bold">Add</span>
               </button>
            </div>
        </div>
      </div>
    </div>

    {/* EDIT MODAL */}
    {editingCategory && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50" onClick={() => setEditingCategory(null)}>
            <div className="bg-surface w-[90%] max-w-md p-6 rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                     <h2 className="font-bold text-lg text-text-primary">Edit Category</h2>
                     <button onClick={() => setEditingCategory(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X className="w-4 h-4 text-text-secondary"/></button>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                  <div className="flex justify-center">
                      {/* SQUIRCLE ICON: rounded-lg for large preview */}
                      <button 
                          type="button" 
                          onClick={() => setEmojiPickerOpen(true)} 
                          className={`w-24 h-24 rounded-lg flex items-center justify-center text-5xl shadow-sm transition-transform hover:scale-105 active:scale-95 ${!editingCategory.color.startsWith('#') ? editingCategory.color : ''}`}
                          style={getStyle(editingCategory.color)}
                      >
                          {editingCategory.icon}
                      </button>
                  </div>
                  
                  <div>
                    <label className="text-xs font-bold uppercase mb-1 block text-text-secondary tracking-wider">Name</label>
                    <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="w-full bg-slate-100 dark:bg-slate-800 border border-border rounded-lg py-3 px-4 font-bold text-text-primary focus:ring-2 focus:ring-primary outline-none" required placeholder="Category Name" />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase mb-2 block text-text-secondary tracking-wider">Color</label>
                    <div className="flex flex-wrap gap-3">
                      {CATEGORY_COLORS.map(c => (
                          <button 
                            key={c} 
                            type="button" 
                            onClick={() => setEditingCategory({ ...editingCategory, color: c })} 
                            className={`w-8 h-8 rounded-full ${editingCategory.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''} transition-all border border-black/5 ${!c.startsWith('#') ? c : ''}`} 
                            style={getStyle(c)}
                          />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2 border-t border-border mt-4">
                    <button type="button" onClick={handleDelete} className="p-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"><Trash2 className="w-5 h-5" /></button>
                    <button type="submit" className="flex-1 py-3 bg-primary text-white font-bold rounded-lg shadow-lg hover:bg-primary-hover">Save</button>
                  </div>
                </form>
            </div>
        </div>
    )}

    {/* EMOJI PICKER SHEET */}
    {emojiPickerOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50" onClick={() => setEmojiPickerOpen(false)}>
            <div className="bg-surface w-[90%] max-w-md rounded-3xl max-h-[60vh] overflow-y-auto p-4 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 px-2">
                    <h3 className="font-bold text-lg text-text-primary">Select Emoji</h3>
                    <button onClick={() => setEmojiPickerOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-8 gap-2">
                    {EMOJI_LIST.map(emoji => (
                        <button key={emoji} onClick={() => { if (editingCategory) setEditingCategory({ ...editingCategory, icon: emoji }); setEmojiPickerOpen(false); }} className="text-2xl h-10 w-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )}
    </>
  );
};
export default CategoryManager;
