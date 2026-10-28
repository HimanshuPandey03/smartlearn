import React from 'react';
import EmptyState from '@/components/ui/EmptyState';
import { Wrench } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">{title}</h1>
        <p className="text-slate-600">This feature is currently under development.</p>
      </div>
      <EmptyState 
        icon={Wrench} 
        title="Coming Soon!" 
        description={`The ${title} page will be available in a future update.`} 
      />
    </div>
  );
};

export default ComingSoon;
