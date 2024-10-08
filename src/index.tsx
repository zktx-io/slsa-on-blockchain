import React from 'react';

import { Theme } from '@radix-ui/themes';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';
import { RecoilRoot } from 'recoil';

import '@mysten/dapp-kit/dist/index.css';
import '@radix-ui/themes/styles.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <RecoilRoot>
      <Theme appearance="dark">
        <SnackbarProvider
          anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        />
        <App />
      </Theme>
    </RecoilRoot>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
