import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import RightPanel from './RightPanel';
import useStore from '../../store/useStore';
import './Layout.css';

export default function Layout() {
  const { sidebarCollapsed } = useStore();

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar />
      <div className="app-main-wrapper">
        <Header />
        <div className="app-content-area">
          <main className="app-main">
            <Outlet />
          </main>
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
