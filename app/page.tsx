"use client"
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TodoWithDependencies, Todo } from '@/types';
import { TodoForm } from '@/components/TodoForm';
import { TodoList } from '@/components/TodoList';

const DependencyGraph = dynamic(() => import('@/components/DependencyGraph'), {
  loading: () => <p>Loading graph...</p>,
  ssr: false
});

export default function Home() {
  const [newTodo, setNewTodo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [todos, setTodos] = useState<TodoWithDependencies[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDependencies, setSelectedDependencies] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const res = await fetch('/api/todos');
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const handleAddTodo = async () => {
    if (!newTodo.trim()) return;

    // Prevent setting due date earlier than dependencies.
    if (dueDate && selectedDependencies.length > 0) {
      const newDueDate = new Date(dueDate);
      for (const depId of selectedDependencies) {
        const dep = todos.find(t => t.id === depId);
        if (dep && dep.dueDate) {
          const depDueDate = new Date(dep.dueDate);
          if (newDueDate < depDueDate) {
            alert(`Invalid Date: The new task cannot be due before its dependency "${dep.title}" (Due: ${depDueDate.toLocaleString()}).`);
            return;
          }
        }
      }
    }

    setIsLoading(true);
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodo,
          dueDate: dueDate || null,
          dependencyIds: selectedDependencies,
        }),
      });
      setNewTodo('');
      setDueDate('');
      setSelectedDependencies([]);
      setIsDropdownOpen(false);
      fetchTodos();
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      });
      fetchTodos();
    } catch (error) {
      console.error('Failed to delete todo:', error);
    }
  };

  const isOverdue = (dateString: Date | null) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const toggleDependency = (id: number) => {
    setSelectedDependencies(prev =>
      prev.includes(id) ? prev.filter(depId => depId !== id) : [...prev, id]
    );
  };

  const getEarliestStartDate = (dependencies: { dueDate?: Date | null }[]) => {
    if (!dependencies || dependencies.length === 0) return null;

    let latestDate = new Date(0);
    let hasDueDate = false;

    dependencies.forEach(dep => {
      if (dep.dueDate) {
        hasDueDate = true;
        const depDate = new Date(dep.dueDate);
        if (depDate > latestDate) {
          latestDate = depDate;
        }
      }
    });

    return hasDueDate ? latestDate : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-orange-50 flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8 w-full">
          <h1 className="text-4xl font-bold text-gray-800">Things To Do App</h1>
          <button
            onClick={() => setShowGraph(!showGraph)}
            className="border border-teal-500 text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition duration-300 bg-transparent"
          >
            {showGraph ? 'Show List' : 'Show Graph'}
          </button>
        </div>

        {!showGraph ? (
          <>
            <TodoForm
              newTodo={newTodo}
              setNewTodo={setNewTodo}
              dueDate={dueDate}
              setDueDate={setDueDate}
              selectedDependencies={selectedDependencies}
              toggleDependency={toggleDependency}
              isDropdownOpen={isDropdownOpen}
              setIsDropdownOpen={setIsDropdownOpen}
              todos={todos}
              isLoading={isLoading}
              handleAddTodo={handleAddTodo}
            />
            <TodoList
              todos={todos}
              handleDeleteTodo={handleDeleteTodo}
              getEarliestStartDate={getEarliestStartDate}
              isOverdue={isOverdue}
            />
          </>
        ) : (
          <div className="graph-canvas-container">
            <DependencyGraph todos={todos} />
          </div>
        )}
      </div>
    </div>
  );
}
