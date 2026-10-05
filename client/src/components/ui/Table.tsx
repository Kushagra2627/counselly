import React from 'react';
import './Table.css';
import { EmptyState } from './EmptyState';

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function Table<T extends { id?: string | number }>({
  columns,
  data,
  emptyMessage = 'No data available',
  onRowClick
}: TableProps<T>) {
  if (data.length === 0) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr 
              key={item.id || i}
              onClick={() => onRowClick?.(item)}
              className={onRowClick ? 'table-row-clickable' : ''}
            >
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(item) : (item as any)[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
