import React from 'react';
import { TodoWithDependencies, Todo } from '@/types';

interface TodoListProps {
    todos: TodoWithDependencies[];
    handleDeleteTodo: (id: number) => void;
    getEarliestStartDate: (dependencies: { dueDate?: Date | null }[]) => Date | null;
    isOverdue: (dateString: Date | null) => boolean;
}

export const TodoList: React.FC<TodoListProps> = ({
    todos,
    handleDeleteTodo,
    getEarliestStartDate,
    isOverdue,
}) => {
    return (
        <ul>
            {todos.map((todo) => {
                const earliestStart = getEarliestStartDate(todo.dependencies);
                return (
                    <li
                        key={todo.id}
                        className="flex items-center bg-white p-4 mb-4 rounded-lg shadow-subtle"
                    >
                        {todo.imageUrl && (
                            <div className="flex-shrink-0 w-20 h-20 mr-4 rounded-lg overflow-hidden">
                                <img
                                    src={todo.imageUrl}
                                    alt={todo.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex-grow flex justify-between items-center min-w-0">
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-gray-800 font-medium truncate">{todo.title}</span>
                                {todo.dueDate && (
                                    <span
                                        className={`text-xs ${isOverdue(todo.dueDate) ? 'text-red-600 font-bold' : 'text-gray-500'
                                            }`}
                                    >
                                        Due: {new Date(todo.dueDate).toLocaleString()}
                                    </span>
                                )}
                                {todo.dependencies && todo.dependencies.length > 0 && (
                                    <div className="mt-1">
                                        <span className="text-xs text-gray-500 block truncate">
                                            Depends on: {todo.dependencies.map((dep) => dep.title).join(', ')}
                                        </span>
                                        {earliestStart && (
                                            <span className={`text-xs block mt-0.5 ${earliestStart < new Date() ? 'text-orange-500 font-bold' : 'text-teal-600 font-semibold'}`}>
                                                Start after: {earliestStart.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteTodo(todo.id);
                                }}
                                className="text-gray-400 hover:text-red-500 transition duration-300 ml-auto p-2 flex-shrink-0"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
};
