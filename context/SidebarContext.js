import React, { createContext, useContext, useState, useCallback } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children, getNavigation }) {
  const [visible, setVisible] = useState(false);
  const openSidebar = useCallback(() => setVisible(true), []);
  const closeSidebar = useCallback(() => setVisible(false), []);
  const toggleSidebar = useCallback(() => setVisible(v => !v), []);

  const handleNavigate = useCallback(
    route => {
      closeSidebar();
      const nav = getNavigation && getNavigation();
      if (nav && route) {
        if (typeof nav.replace === 'function') {
          nav.replace(route);
        } else if (typeof nav.navigate === 'function') {
          nav.navigate(route);
        } else if (typeof nav.reset === 'function') {
          nav.reset({ index: 0, routes: [{ name: route }] });
        }
      }
    },
    [getNavigation, closeSidebar]
  );

  return (
    <SidebarContext.Provider value={{ visible, openSidebar, closeSidebar, toggleSidebar, handleNavigate }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
