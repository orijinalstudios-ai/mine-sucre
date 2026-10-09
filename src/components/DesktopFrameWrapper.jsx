import React from 'react';
import AppLayout from './AppLayout';

export default function DesktopFrameWrapper({ children }) {
  return <AppLayout>{children}</AppLayout>;
}
