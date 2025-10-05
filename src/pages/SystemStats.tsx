import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Activity, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiService, ApiStats } from '@/services/apiService';
import { LoadingShimmer } from '@/components/LoadingShimmer';

export default function SystemStats() {
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    const interval = setInterval(() => {
      loadStats();
    }, 3000); // Update every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      if (loading) setLoading(true);
      const statsData = await apiService.getStats();
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data
  const responseTimeData = stats?.recent_response_times.map((time, idx) => ({
    request: idx + 1,
    responseTime: time,
  })) || [];

  const performanceData = stats ? [
    { 
      name: 'Excellent (<100ms)', 
      value: stats.recent_response_times.filter(t => t < 100).length, 
      color: 'hsl(var(--success))' 
    },
    { 
      name: 'Good (100-500ms)', 
      value: stats.recent_response_times.filter(t => t >= 100 && t < 500).length, 
      color: 'hsl(var(--primary))' 
    },
    { 
      name: 'Slow (>500ms)', 
      value: stats.recent_response_times.filter(t => t >= 500).length, 
      color: 'hsl(var(--warning))' 
    },
  ] : [];

  // Endpoint usage data for bar chart
  const endpointData = stats?.endpoint_counts ? 
    Object.entries(stats.endpoint_counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([endpoint, count]) => ({
        endpoint: endpoint.length > 20 ? '...' + endpoint.slice(-20) : endpoint,
        calls: count
      })) : [];

  if (loading && !stats) {
    return (
      <div className="space-y-6 animate-fade-in">
        <LoadingShimmer className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LoadingShimmer className="h-32" />
          <LoadingShimmer className="h-32" />
          <LoadingShimmer className="h-32" />
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="glow-card">
          <CardContent className="p-6">
            <div className="text-center text-destructive">
              <p className="font-semibold mb-2">Failed to load statistics</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={loadStats} className="mt-4" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">System Statistics</h2>
          <p className="text-muted-foreground">
            Monitor API performance metrics and response times in real-time
          </p>
        </div>
        <Button onClick={loadStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ y: -4 }}>
          <Card className="glow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <TrendingUp className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.total_requests || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">API calls made</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="glow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Activity className="h-5 w-5 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats?.average_response_time || 0}ms</div>
              <p className="text-xs text-muted-foreground mt-1">
                Min: {stats?.min_response_time || 0}ms • Max: {stats?.max_response_time || 0}ms
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -4 }}>
          <Card className="glow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <BarChart3 className="h-5 w-5 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats?.success_rate || 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">API reliability</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Line Chart */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Response Times (Recent Requests)</CardTitle>
          </CardHeader>
          <CardContent>
            {responseTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={responseTimeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="request"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    label={{ value: 'ms', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data yet. Make some API calls to see statistics.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Distribution Pie Chart */}
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {performanceData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    outerRadius={80}
                    fill="hsl(var(--primary))"
                    dataKey="value"
                  >
                    {performanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data yet. Make some API calls to see statistics.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Endpoint Usage Bar Chart */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle>Top Endpoints by Request Count</CardTitle>
        </CardHeader>
        <CardContent>
          {endpointData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={endpointData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="endpoint"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  label={{ value: 'Requests', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="calls"
                  fill="hsl(var(--accent))"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              No data yet. Make some API calls to see statistics.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Code Distribution */}
      {stats && stats.status_code_distribution && Object.keys(stats.status_code_distribution).length > 0 && (
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Status Code Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(stats.status_code_distribution).map(([code, count]) => (
                <div key={code} className="p-4 bg-muted/50 rounded-lg border border-border text-center">
                  <div className="text-2xl font-bold">{code}</div>
                  <div className="text-sm text-muted-foreground mt-1">{count} requests</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}