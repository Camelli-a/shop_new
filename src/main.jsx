import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntdApp, ConfigProvider } from 'antd';
import 'antd/dist/reset.css';
import './index.css';

import { RouterProvider } from 'react-router';
import router from './router';
import { ServiceProvider } from './contexts/ServiceContext';
import { AuthProvider } from './contexts/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f766e',
          colorInfo: '#2563eb',
          colorSuccess: '#16a34a',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 8,
          fontFamily:
            '"Nunito Sans", "PingFang SC", "Microsoft YaHei", sans-serif',
        },
      }}
    >
      <AntdApp>
        <ServiceProvider>
          <AuthProvider>
            <RouterProvider router={router}>
            </RouterProvider>
          </AuthProvider>
        </ServiceProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
);
