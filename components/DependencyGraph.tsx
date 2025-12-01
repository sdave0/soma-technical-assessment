"use client";

import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
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

  const nodePositions: { [key: number]: { x: number; y: number } } = {};
  const gridSize = 200;
  let x = 0;
  let y = 0;

  todos.forEach((todo, index) => {
    initialNodes.push({
      id: todo.id.toString(),
      data: { label: todo.title, dueDate: todo.dueDate },
      position: { x, y },
      type: 'default',
    });
    nodePositions[todo.id] = { x, y };

    x += gridSize;
    if ((index + 1) % 3 === 0) {
      x = 0;
      y += gridSize;
    }
  });

  todos.forEach(todo => {
    // Find critical dependency (latest due date)
    let criticalDepId = -1;
    let maxDate = 0;

    if (todo.dependencies && todo.dependencies.length > 0) {
      todo.dependencies.forEach(dep => {
        if (dep.dueDate) {
          const d = new Date(dep.dueDate).getTime();
          if (d > maxDate) {
            maxDate = d;
            criticalDepId = dep.id;
          }
        }
      });
    }

    if (todo.dependencies) {
      todo.dependencies.forEach(dep => {
        const isCritical = dep.id === criticalDepId;
        initialEdges.push({
          id: `e${dep.id}-${todo.id}`,
          source: dep.id.toString(),
          target: todo.id.toString(),
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 20,
            height: 20,
            color: isCritical ? '#ef4444' : '#b1b1b7',
          },
          style: {
            stroke: isCritical ? '#ef4444' : '#b1b1b7',
            strokeWidth: isCritical ? 2 : 1,
          },
          animated: isCritical,
          label: isCritical ? 'Critical' : undefined,
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
        <MiniMap />
        <Controls />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
};

export default DependencyGraph;
