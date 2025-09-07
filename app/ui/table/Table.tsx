import React from "react";

export interface TableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  editable?: boolean;
}

interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}
/* eslint-disable  @typescript-eslint/no-explicit-any */
export default function Table<T extends Record<string, any>>({ columns, data, emptyMessage = "No data available.", onEdit, onDelete }: TableProps<T>) {
  if (!data.length) {
    return <div>{emptyMessage}</div>;
  }
  return (
    <table className="min-w-full border border-gray-300">
      <thead>
        <tr className="bg-gray-800">
          {columns.map((col) => (
            <th key={String(col.key)} className="border border-gray-300 px-4 py-2">{col.label}</th>
          ))}
          {(onEdit || onDelete) && (
            <th className="border border-gray-300 px-4 py-2">Actions</th>
          )}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={typeof row.$id === "string" ? row.$id : i} className="hover:bg-gray-700">
            {columns.map((col) => (
              <td key={String(col.key)} className="border border-gray-300 px-4 py-2">
                {col.render ? col.render(row[col.key], row) : (row[col.key] as React.ReactNode)}
              </td>
            ))}
            {(onEdit || onDelete) && (
              <td className="border border-gray-300 px-4 py-2">
                {onEdit && <button className="mr-2 px-2 py-1 bg-blue-600 text-white rounded" onClick={() => onEdit(row)}>Edit</button>}
                {onDelete && <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => onDelete(row)}>Delete</button>}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
