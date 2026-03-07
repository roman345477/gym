import { Page } from '../App';
import { LayoutDashboard, History, TrendingUp } from 'lucide-react';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const tabs = [
  { id: 'dashboard' as Page, icon: LayoutDashboard, label: 'Home' },
  { id: 'history' as Page, icon: History, label: 'History' },
  { id: 'progress' as Page, icon: TrendingUp, label: 'Progress' },
];

export default function BottomNav({ currentPage, onNavigate }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-[#12121a]/95 backdrop-blur-xl border-t border-white/5 safe-bottom">
        <div className="flex items-stretch">
          {tabs.map(({ id, icon: Icon, label }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                className="bottom-tab"
              >
                <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  active ? 'bg-[#6c63ff]/20' : ''
                }`}>
                  <Icon
                    size={20}
                    className={active ? 'text-[#6c63ff]' : 'text-white/40'}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                  {active && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6c63ff]" />
                  )}
                </div>
                <span className={`text-[11px] font-medium transition-colors ${
                  active ? 'text-[#6c63ff]' : 'text-white/30'
                }`}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
