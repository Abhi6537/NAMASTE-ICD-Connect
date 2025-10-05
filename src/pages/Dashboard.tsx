import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, TrendingUp, CheckCircle, XCircle, Server } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiService, HealthStatus, ApiStats } from '@/services/apiService';
import { LoadingShimmer } from '@/components/LoadingShimmer';

export default function Dashboard() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [stats, setStats] = useState<ApiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      if (loading) setLoading(true);
      const [healthData, statsData] = await Promise.all([
        apiService.checkHealth(),
        apiService.getStats()
      ]);
      setHealth(healthData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    subtitle,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    subtitle?: string;
  }) => (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className="glow-card glow-card-hover h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <Icon className={`h-5 w-5 ${color}`} />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{value}</div>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your NAMASTE-ICD-FHIR API system health and performance
        </p>
      </div>

      {/* Simple Health Status */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            API Health Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !stats ? (
            <LoadingShimmer className="h-16 w-full" />
          ) : error ? (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg border border-destructive">
              <XCircle className="h-6 w-6 text-destructive" />
              <div>
                <p className="font-medium text-destructive">Connection Failed</p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg border border-success">
              <CheckCircle className="h-6 w-6 text-success animate-glow-pulse" />
              <div>
                <p className="font-medium text-success">
                  {health?.status === 'healthy' ? 'Healthy' : health?.status}
                </p>
                <p className="text-sm text-muted-foreground">
                  All services operational • Uptime: {stats ? formatUptime(stats.uptime_seconds) : '0s'}
                </p>
              </div>
              <Badge variant="outline" className="ml-auto bg-success/20 text-success border-success">
                Live
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Requests"
          value={stats?.total_requests || 0}
          icon={TrendingUp}
          color="text-primary"
          subtitle="Useful API calls only"
        />
        <StatCard
          title="Avg Response Time"
          value={`${stats?.average_response_time || 0}ms`}
          icon={Clock}
          color="text-accent"
          subtitle={`Min: ${stats?.min_response_time || 0}ms • Max: ${stats?.max_response_time || 0}ms`}
        />
        <StatCard
          title="Success Rate"
          value={`${stats?.success_rate || 0}%`}
          icon={Activity}
          color="text-success"
          subtitle="Request success rate"
        />
        <StatCard
          title="Uptime"
          value={stats ? formatUptime(stats.uptime_seconds) : '0s'}
          icon={Server}
          color="text-chart-1"
          subtitle="Since last restart"
        />
      </div>

      {/* Endpoint Usage */}
      {stats && stats.endpoint_counts && Object.keys(stats.endpoint_counts).length > 0 && (
        <Card className="glow-card">
          <CardHeader>
            <CardTitle>Endpoint Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.endpoint_counts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([endpoint, count]) => (
                  <div key={endpoint} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <code className="text-sm font-mono">{endpoint}</code>
                    <Badge variant="outline">{count} calls</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.a
              href="/search"
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-primary/10 rounded-lg border border-primary hover:bg-primary/20 transition-colors"
            >
              <h3 className="font-semibold text-primary mb-1">Search Terminology</h3>
              <p className="text-sm text-muted-foreground">
                Find and explore medical terms across NAMASTE and ICD-11
              </p>
            </motion.a>
            <motion.a
              href="/mapping"
              whileHover={{ scale: 1.02 }}
              className="p-4 bg-accent/10 rounded-lg border border-accent hover:bg-accent/20 transition-colors"
            >
              <h3 className="font-semibold text-accent mb-1">Map Terminology</h3>
              <p className="text-sm text-muted-foreground">
                Convert NAMASTE terms to ICD-11 codes and FHIR resources
              </p>
            </motion.a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}