import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { router } from './routes'
import { queryClient } from './lib/queryClient'
import './styles/globals.css'
import './i18n/config';
import { VideoCallProvider } from './contexts/VideoCallContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <VideoCallProvider>
                <RouterProvider router={router} />
            </VideoCallProvider>
        </QueryClientProvider>
    </React.StrictMode>,
)
