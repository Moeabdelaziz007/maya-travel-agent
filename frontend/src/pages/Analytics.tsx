import React, { useEffect, useState } from 'react';
import { analyticsService } from '../api/services';

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await analyticsService.summary();
        setData(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="p-6">Loading analytics…</div>;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
      <div className="bg-white rounded-xl p-4 shadow border">
        <div className="text-sm text-gray-500">Total events</div>
        <div className="text-3xl font-semibold">{data?.total ?? 0}</div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border">
        <div className="text-sm text-gray-500 mb-2">Events by type</div>
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(data?.byType || {}, null, 2)}
        </pre>
      </div>
      <div className="bg-white rounded-xl p-4 shadow border">
        <div className="text-sm text-gray-500 mb-2">Last 10 events</div>
        <pre className="text-xs whitespace-pre-wrap">
          {JSON.stringify(data?.last10 || [], null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default AnalyticsPage;
