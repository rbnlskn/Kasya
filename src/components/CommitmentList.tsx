
import React from 'react';

interface CommitmentListProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  placeholder: React.ReactNode;
}

export const CommitmentList = <T extends { id: string }>({
  items,
  renderItem,
  placeholder,
}: CommitmentListProps<T>) => {

  if (items.length === 0) {
    return <>{placeholder}</>;
  }

  return (
    <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 divide-y divide-gray-50">
      {items.map(item => (
        <div key={item.id}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
};
