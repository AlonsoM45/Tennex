import React from 'react';
import '@styles/app.scss';
import { TaskPanel } from './TaskPanel';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


// Create a client
const queryClient = new QueryClient();

function Application() {
  return (
    <QueryClientProvider client={queryClient}>
      <TaskPanel />
    </QueryClientProvider>
  );
}

export default Application;
