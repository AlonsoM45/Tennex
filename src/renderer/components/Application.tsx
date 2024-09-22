import React from 'react';
import '@styles/app.scss';
import { TaskPanel } from './TaskPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend'

// Create a client
const queryClient = new QueryClient();

function Application() {
  return (    
    <DndProvider backend={HTML5Backend}>
      <QueryClientProvider client={queryClient}>
        <TaskPanel />
      </QueryClientProvider>
    </DndProvider>
  );
}

export default Application;
