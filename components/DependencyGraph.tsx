"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
} from 'reactflow';

import 'reactflow/dist/style.css';

interface TodoNode {
  id: string;
  data: { label: string; dueDate?: Date | null };
  position: { x: number; y: number };
  type?: string;
}

interface TodoEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  markerEnd?: {
    type: MarkerType;
    width: number;
    height: number;
    color?: string;
  };
  style?: React.CSSProperties;
  animated?: boolean;
  label?: string;
}

import { TodoWithDependencies } from '@/types';

interface DependencyGraphProps {
  todos: TodoWithDependencies[];
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ todos }) => {
  const initialNodes: TodoNode[] = [];
  const initialEdges: TodoEdge[] = [];

  // 1. Calculate Levels for Hierarchical Layout
  const levels: { [key: number]: number } = {};
  const todoMap = new Map(todos.map(t => [t.id, t]));

  // Initialize all levels to 0
  todos.forEach(t => levels[t.id] = 0);

  // Function to calculate depth recursively
  const getDepth = (id: number, visited = new Set<number>()): number => {
    if (visited.has(id)) return 0; // Cycle detection/prevention
    visited.add(id);
    
    const todo = todoMap.get(id);
    if (!todo || !todo.dependencies || todo.dependencies.length === 0) {
      return 0;
    }

    let maxDepth = 0;
    todo.dependencies.forEach(dep => {
       maxDepth = Math.max(maxDepth, getDepth(dep.id, new Set(visited)));
    });
    
    return maxDepth + 1;
  };

  // Calculate depth for all nodes
  todos.forEach(t => {
    levels[t.id] = getDepth(t.id);
  });

  // 2. Group by Level
  const nodesByLevel: { [key: number]: TodoWithDependencies[] } = {};
  Object.entries(levels).forEach(([id, level]) => {
    if (!nodesByLevel[level]) nodesByLevel[level] = [];
    const todo = todoMap.get(Number(id));
    if (todo) nodesByLevel[level].push(todo);
  });

  // 3. Assign Positions
  const HORIZONTAL_SPACING = 250;
  const VERTICAL_SPACING = 150;

  Object.entries(nodesByLevel).forEach(([levelStr, levelNodes]) => {
    const level = Number(levelStr);
    const levelWidth = levelNodes.length * HORIZONTAL_SPACING;
    let currentX = -(levelWidth / 2); // Center the level

    levelNodes.forEach(todo => {
      initialNodes.push({
        id: todo.id.toString(),
        data: { label: todo.title, dueDate: todo.dueDate },
        position: { x: currentX, y: level * VERTICAL_SPACING },
        type: 'default',
      });
      currentX += HORIZONTAL_SPACING;
    });
  });

  // Create edges
  todos.forEach(todo => {
    if (todo.dependencies) {
      todo.dependencies.forEach(dep => {
        // Highlight if the dependency is overdue
        const isOverdue = dep.dueDate ? new Date(dep.dueDate) < new Date() : false;
        
        initialEdges.push({
          id: `e${dep.id}-${todo.id}`,
          source: dep.id.toString(),
          target: todo.id.toString(),
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isOverdue ? '#ef4444' : '#b1b1b7',
          },
          style: {
            stroke: isOverdue ? '#ef4444' : '#b1b1b7',
            strokeWidth: isOverdue ? 2 : 1,
          },
          animated: isOverdue,
          label: isOverdue ? 'Overdue' : undefined,
        });
      });
    }
  });

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid #eee', borderRadius: '8px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
