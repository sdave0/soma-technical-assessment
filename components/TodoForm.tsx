import React from 'react';
import { TodoWithDependencies } from '@/types';

interface TodoFormProps {
    newTodo: string;
    setNewTodo: (value: string) => void;
    dueDate: string;
    setDueDate: (value: string) => void;
    selectedDependencies: number[];
    toggleDependency: (id: number) => void;
    isDropdownOpen: boolean;
    setIsDropdownOpen: (value: boolean) => void;
    todos: TodoWithDependencies[];
    isLoading: boolean;
    handleAddTodo: () => void;
}

export const TodoForm: React.FC<TodoFormProps> = ({
    newTodo,
    setNewTodo,
    dueDate,
    setDueDate,
    selectedDependencies,
    toggleDependency,
    isDropdownOpen,
    setIsDropdownOpen,
    todos,
    isLoading,
    handleAddTodo,
}) => {
    return (
        <div className="flex flex-col gap-2 mb-6 bg-white p-4 rounded-lg shadow-subtle w-full">
            <div className="flex flex-col sm:flex-row items-center rounded-lg bg-gray-100 focus-within:bg-white transition duration-300">
                <input
                    type="text"
                    className="w-full sm:flex-grow p-3 bg-transparent focus:outline-none text-gray-700 min-w-0"
                    placeholder="Add a new todo"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    disabled={isLoading}
                />
                <input
                    type="datetime-local"
                    className={`w-full sm:w-auto p-3 bg-transparent focus:outline-none text-sm
                      ${dueDate ? 'text-gray-700' : 'text-transparent'}
                      focus:text-gray-700`}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full text-left p-2 text-sm text-gray-600 bg-gray-50 rounded hover:bg-gray-100 focus:outline-none flex justify-between items-center"
                >
                    <span>
                        {selectedDependencies.length > 0
                            ? `${selectedDependencies.length} Dependencies Selected`
                            : 'Select Dependencies (Optional)'}
                    </span>
                    <svg
                        className={`w-4 h-4 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </button>

                {isDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                        {todos.length === 0 ? (
                            <div className="p-2 text-sm text-gray-500">No existing tasks to depend on.</div>
                        ) : (
                            todos.map((todo) => (
                                <div
                                    key={todo.id}
                                    className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => toggleDependency(todo.id)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedDependencies.includes(todo.id)}
                                        onChange={() => { }}
                                        className="mr-2 h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700 truncate">{todo.title}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            <button
                onClick={handleAddTodo}
                disabled={isLoading}
                className={`flex-shrink-0 bg-teal-500 text-white px-4 py-3 rounded-lg hover:bg-teal-600 transition duration-300 mt-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {isLoading ? 'Adding...' : 'Add'}
            </button>
        </div>
    );
};
