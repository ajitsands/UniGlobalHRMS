import React, { useState } from 'react';
import {
  AppShell,
  Card,
  NavMenuItem,
  ThemeProvider,
  ToastProvider,
} from '@controls';
import {
  BookOpen,
  Calculator,
  Clock,
  FileText,
  LayoutDashboard,
  Layers,
  ShieldCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { ControlGalleryPage } from './pages/ControlGalleryPage';

const INITIAL_MENUS: NavMenuItem[] = [
  { id: 'ui-kit', label: 'Common Controls', labelAr: 'مكتبة العناصر', icon: <Layers size={16} /> },
  { id: 'dashboard', label: 'Dashboard', labelAr: 'لوحة التحكم', icon: <LayoutDashboard size={16} /> },
  {
    id: 'employees',
    label: 'Employees',
    labelAr: 'الموظفون',
    icon: <Users size={16} />,
    children: [
      { id: 'emp-directory', label: 'Employee Directory', labelAr: 'دليل الموظفين', icon: <Users size={14} /> },
      { id: 'emp-onboarding', label: 'Onboarding & Docs', labelAr: 'التعيين والوثائق', icon: <UserPlus size={14} /> },
      { id: 'emp-letters', label: 'HR Letters & Assets', labelAr: 'الخطابات والعهد', icon: <FileText size={14} /> },
    ],
  },
  {
    id: 'attendance',
    label: 'Attendance & Leave',
    labelAr: 'الحضور والإجازات',
    icon: <Clock size={16} />,
    children: [
      { id: 'att-biometric', label: 'Biometric Punches', labelAr: 'سجل البصمة', icon: <Clock size={14} /> },
      { id: 'att-leave', label: 'Leave Requests', labelAr: 'طلبات الإجازة', icon: <FileText size={14} /> },
    ],
  },
  {
    id: 'payroll',
    label: 'Payroll & EOSB',
    labelAr: 'الرواتب والمكافآت',
    icon: <Calculator size={16} />,
    children: [
      { id: 'pay-run', label: 'Monthly Payroll Run', labelAr: 'مسير الرواتب', icon: <Calculator size={14} /> },
      { id: 'pay-eosb', label: 'EOSB & Final Settlement', labelAr: 'نهاية الخدمة', icon: <FileText size={14} /> },
    ],
  },
  { id: 'audit', label: 'Audit & Logs', labelAr: 'سجلات التدقيق', icon: <ShieldCheck size={16} /> },
  { id: 'manual', label: 'User Manual', labelAr: 'دليل المستخدم', icon: <BookOpen size={16} /> },
];

const MENU_ORDER_KEY = 'uniglobal_hrms_menu_order_v1';
const ACTIVE_MENU_KEY = 'uniglobal_hrms_active_menu_v1';

function loadOrderedMenus(): NavMenuItem[] {
  try {
    const raw = localStorage.getItem(MENU_ORDER_KEY);
    if (!raw) return INITIAL_MENUS;
    const order: string[] = JSON.parse(raw);
    const map = new Map(INITIAL_MENUS.map((m) => [m.id, m]));
    const ordered = order.map((id) => map.get(id)).filter((m): m is NavMenuItem => Boolean(m));
    const missing = INITIAL_MENUS.filter((m) => !order.includes(m.id));
    return [...ordered, ...missing];
  } catch {
    return INITIAL_MENUS;
  }
}

export const App: React.FC = () => {
  const [menus, setMenus] = useState<NavMenuItem[]>(loadOrderedMenus);
  const [activeMenuId, setActiveMenuId] = useState<string>(
    () => localStorage.getItem(ACTIVE_MENU_KEY) || 'ui-kit'
  );

  const handleReorderMenus = (next: NavMenuItem[]) => {
    setMenus(next);
    try {
      localStorage.setItem(MENU_ORDER_KEY, JSON.stringify(next.map((m) => m.id)));
    } catch {
      // ignore
    }
  };

  const handleSelectMenu = (id: string) => {
    setActiveMenuId(id);
    try {
      localStorage.setItem(ACTIVE_MENU_KEY, id);
    } catch {
      // ignore
    }
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <AppShell
          menuItems={menus}
          onReorderMenus={handleReorderMenus}
          activeMenuId={activeMenuId}
          onSelectMenu={handleSelectMenu}
        >
        {activeMenuId === 'ui-kit' ? (
          <ControlGalleryPage />
        ) : activeMenuId === 'manual' ? (
          <Card title="UniGlobal HRMS — User Manual" subtitle="Step-by-step application guide">
            <ol style={{ paddingInlineStart: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <li><strong>Workspace & Theme:</strong> Click <em>Customize</em> in the header to switch between Vertical, Horizontal, Floating/Docking, or Minimal menus and UniGlobal Light / Single / Gradient themes.</li>
              <li><strong>Quick Access:</strong> Click the Pin icon next to any sidebar menu item to pin it to the top Quick Access bar.</li>
              <li><strong>Admin Menu Flow:</strong> Admins can drag and drop menu items in Vertical mode and click the Lock icon to fix the menu order.</li>
              <li><strong>Interactive Dashboard:</strong> Use the Bar / Line / Pie / Table toggle on every dashboard widget to switch visualizations.</li>
            </ol>
          </Card>
        ) : (
          <Card
            title={`Module: ${menus.find((m) => m.id === activeMenuId)?.label}`}
            subtitle="Ready for feature branch development (Ajit / Ancy) using @controls"
          >
            <p style={{ margin: 0, color: 'var(--ug-text-secondary)' }}>
              This module placeholder will be built in the upcoming feature phase using the locked{' '}
              <code>@controls</code> library.
            </p>
          </Card>
        )}
        </AppShell>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
