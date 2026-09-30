import React, { useState } from 'react';
import { ChefHat, CheckSquare, Square } from 'lucide-react';
import type { ActionItem } from '../../types';

interface ActionChecklistProps {
  initialActions: ActionItem[];
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ initialActions }) => {
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  React.useEffect(() => {
    setActions(initialActions);
  }, [initialActions]);

  const toggle = (id: string) => {
    setActions(prev => prev.map(a => 
      a.id === id ? { ...a, completed: !a.completed } : a
    ));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <ChefHat size={16} color="#34d399" />
          Kitchen Shift Action Directives
        </h4>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          {actions.filter(a => a.completed).length} / {actions.length} Completed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {actions.map(action => (
          <div
            key={action.id}
            onClick={() => toggle(action.id)}
            className={`action-item ${action.completed ? 'done' : ''}`}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ marginTop: '2px', color: action.completed ? '#34d399' : 'var(--text-dim)' }}>
              {action.completed ? <CheckSquare size={17} /> : <Square size={17} />}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.2rem' }}>
                <span className="badge badge-indigo" style={{ fontSize: '0.65rem' }}>
                  {action.role}
                </span>
                <span className={`badge badge-${action.urgency === 'Immediate' ? 'rose' : action.urgency === 'Today' ? 'amber' : 'emerald'}`} style={{ fontSize: '0.65rem' }}>
                  {action.urgency}
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: action.completed ? 'var(--text-dim)' : 'var(--text-main)', margin: 0 }}>
                {action.directive}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
