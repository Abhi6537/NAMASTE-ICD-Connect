import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Search, 
  GitBranch, 
  FileText, 
  Activity, 
  BarChart3, 
  ArrowRight,
  Code,
  Zap,
  Shield,
  Globe,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Play,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/apiService';

export default function Index() {
  const BASE_URL = 'https://namaste-icd-api.vercel.app';
  
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState({});
  const [responses, setResponses] = useState({});
  
  // Form states for each endpoint
  const [searchParams, setSearchParams] = useState({ q: 'fever', source: 'both', ayush_system: '' });
  const [mapParams, setMapParams] = useState({ namaste_id: 'NAM001', include_fhir: false });
  const [bulkMapBody, setBulkMapBody] = useState('{\n  "terms": [\n    {"namaste_id": "NAM001"},\n    {"namaste_id": "NAM002", "patient_id": "P001"}\n  ]\n}');
  const [fhirParams, setFhirParams] = useState({ namaste_id: 'NAM001', patient_id: '123456' });

  const features = [
    {
      icon: Search,
      title: 'Terminology Search',
      description: 'Search and explore medical terms across NAMASTE and ICD-11 databases with confidence scores and synonyms.',
      endpoint: 'GET /api/v1/search',
      color: 'text-primary',
      link: '/search'
    },
    {
      icon: GitBranch,
      title: 'Terminology Mapping',
      description: 'Convert NAMASTE terms to ICD-11 codes with single or bulk mapping operations and FHIR resource generation.',
      endpoint: 'POST /api/v1/map',
      color: 'text-accent',
      link: '/mapping'
    },
    {
      icon: FileText,
      title: 'FHIR Conditions',
      description: 'Retrieve and manage FHIR Condition resources for patients with standardized healthcare data exchange.',
      endpoint: 'GET /api/v1/fhir/condition',
      color: 'text-success',
      link: '/fhir'
    },
    {
      icon: BarChart3,
      title: 'System Statistics',
      description: 'Monitor API performance, response times, and usage statistics in real-time with interactive charts.',
      endpoint: 'GET /health',
      color: 'text-chart-1',
      link: '/stats'
    }
  ];

  const apiEndpoints = [
    {
      id: 'health',
      icon: Activity,
      title: 'Health Check',
      method: 'GET',
      endpoint: '/health',
      description: 'Verify API availability and health status. Returns status, timestamp, and version information.',
      color: 'success',
      params: [],
      testable: true
    },
    {
      id: 'search',
      icon: Search,
      title: 'Search Terminology',
      method: 'GET',
      endpoint: '/api/v1/search',
      description: 'Search medical terms across NAMASTE and ICD-11 databases with advanced filtering.',
      color: 'success',
      params: [
        { name: 'q', type: 'string', required: true, desc: 'Search query term' },
        { name: 'source', type: 'enum', required: false, desc: 'Options: "namaste", "icd11", "both"', options: ['both', 'namaste', 'icd11'] },
        { name: 'ayush_system', type: 'enum', required: false, desc: 'AYUSH system filter', options: ['', 'ayurveda', 'yoga', 'unani', 'siddha', 'homeopathy'] }
      ],
      testable: true
    },
    {
      id: 'map',
      icon: GitBranch,
      title: 'Map Single Terminology',
      method: 'POST',
      endpoint: '/api/v1/map',
      description: 'Map a NAMASTE term to its corresponding ICD-11 code.',
      color: 'primary',
      params: [
        { name: 'namaste_id', type: 'string', required: true, desc: 'NAMASTE terminology identifier' },
        { name: 'include_fhir', type: 'boolean', required: false, desc: 'Include FHIR Condition resource' }
      ],
      testable: true
    },
    {
      id: 'bulk-map',
      icon: GitBranch,
      title: 'Bulk Map Terminologies',
      method: 'POST',
      endpoint: '/api/v1/bulk-map',
      description: 'Map multiple NAMASTE terms to ICD-11 codes in a single request.',
      color: 'primary',
      params: [],
      bodyExample: '{\n  "terms": [\n    {"namaste_id": "NAM001"},\n    {"namaste_id": "NAM002", "patient_id": "P001"}\n  ]\n}',
      testable: true
    },
    {
      id: 'fhir',
      icon: FileText,
      title: 'Get FHIR Condition Resource',
      method: 'GET',
      endpoint: '/api/v1/fhir/condition',
      description: 'Retrieve a FHIR R4 compliant Condition resource for a patient.',
      color: 'success',
      params: [
        { name: 'namaste_id', type: 'string', required: true, desc: 'NAMASTE terminology identifier' },
        { name: 'patient_id', type: 'string', required: true, desc: 'Unique patient identifier' }
      ],
      testable: true
    }
  ];

  const exampleRequests = [
    {
      id: 'search-example',
      title: 'Search for "fever"',
      method: 'GET',
      url: `${BASE_URL}/api/v1/search?q=fever&source=both`,
      fetchOptions: { method: 'GET' }
    },
    {
      id: 'map-example',
      title: 'Map NAMASTE to ICD-11',
      method: 'POST',
      url: `${BASE_URL}/api/v1/map?namaste_id=NAM001`,
      fetchOptions: { method: 'POST' }
    },
    {
      id: 'fhir-example',
      title: 'Get FHIR Condition',
      method: 'GET',
      url: `${BASE_URL}/api/v1/fhir/condition?namaste_id=NAM001&patient_id=P001`,
      fetchOptions: { method: 'GET' }
    },
    {
      id: 'bulk-example',
      title: 'Bulk Map Multiple Terms',
      method: 'POST',
      url: `${BASE_URL}/api/v1/bulk-map`,
      body: {
        terms: [
          { namaste_id: "NAM001" },
          { namaste_id: "NAM002", patient_id: "P001" }
        ]
      },
      fetchOptions: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          terms: [
            { namaste_id: "NAM001" },
            { namaste_id: "NAM002", patient_id: "P001" }
          ]
        })
      }
    }
  ];

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const buildUrl = (endpoint, params) => {
    const queryString = Object.entries(params)
      .filter(([_, value]) => value !== '' && value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    return `${BASE_URL}${endpoint}${queryString ? '?' + queryString : ''}`;
  };

  const executeRequest = async (endpointId) => {
    setLoading({ ...loading, [endpointId]: true });
    
    try {
      let result;
      
      switch(endpointId) {
        case 'health':
          result = await apiService.checkHealth();
          setResponses({
            ...responses,
            [endpointId]: {
              status: 200,
              statusText: 'OK',
              data: result,
              url: `${BASE_URL}/health`
            }
          });
          break;
          
        case 'search':
          result = await apiService.searchRaw({
            q: searchParams.q,
            source: searchParams.source as any,
            ayush_system: searchParams.ayush_system as any
          });
          setResponses({
            ...responses,
            [endpointId]: {
              status: 200,
              statusText: 'OK',
              data: result,
              url: buildUrl('/api/v1/search', searchParams)
            }
          });
          break;
          
        case 'map':
          result = await apiService.mapTerminology({
            namaste_id: mapParams.namaste_id,
            include_fhir: mapParams.include_fhir
          });
          setResponses({
            ...responses,
            [endpointId]: {
              status: 200,
              statusText: 'OK',
              data: result,
              url: buildUrl('/api/v1/map', mapParams)
            }
          });
          break;
          
        case 'bulk-map':
          try {
            const parsedBody = JSON.parse(bulkMapBody);
            result = await apiService.bulkMap(parsedBody);
            setResponses({
              ...responses,
              [endpointId]: {
                status: 200,
                statusText: 'OK',
                data: result,
                url: `${BASE_URL}/api/v1/bulk-map`
              }
            });
          } catch (parseError) {
            throw new Error('Invalid JSON in request body');
          }
          break;
          
        case 'fhir':
          result = await apiService.getFHIRCondition({
            namaste_id: fhirParams.namaste_id,
            patient_id: fhirParams.patient_id
          });
          setResponses({
            ...responses,
            [endpointId]: {
              status: 200,
              statusText: 'OK',
              data: result,
              url: buildUrl('/api/v1/fhir/condition', fhirParams)
            }
          });
          break;
          
        default:
          return;
      }
      
      // Switch to response tab after successful request
      setActiveTab({ ...activeTab, [endpointId]: 'response' });
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch';
      setResponses({
        ...responses,
        [endpointId]: {
          status: 'Error',
          statusText: errorMessage,
          data: { error: errorMessage }
        }
      });
      setActiveTab({ ...activeTab, [endpointId]: 'response' });
    } finally {
      setLoading({ ...loading, [endpointId]: false });
    }
  };

  const executeExampleRequest = async (exampleId) => {
    setExampleLoading({ ...exampleLoading, [exampleId]: true });
    
    const example = exampleRequests.find(ex => ex.id === exampleId);
    if (!example) return;

    try {
      const response = await fetch(example.url, example.fetchOptions);
      const data = await response.json();
      
      setExampleResponses({
        ...exampleResponses,
        [exampleId]: {
          status: response.status,
          statusText: response.statusText,
          data: data
        }
      });
    } catch (error) {
      setExampleResponses({
        ...exampleResponses,
        [exampleId]: {
          status: 'Error',
          statusText: error.message,
          data: { error: error.message }
        }
      });
    } finally {
      setExampleLoading({ ...exampleLoading, [exampleId]: false });
    }
  };

  const renderParamInputs = (endpoint) => {
    switch(endpoint.id) {
      case 'search':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">q (required)</label>
              <input
                type="text"
                value={searchParams.q}
                onChange={(e) => setSearchParams({ ...searchParams, q: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                placeholder="Enter search term"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">source</label>
              <select
                value={searchParams.source}
                onChange={(e) => setSearchParams({ ...searchParams, source: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
              >
                <option value="both">both</option>
                <option value="namaste">namaste</option>
                <option value="icd11">icd11</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">ayush_system (optional)</label>
              <select
                value={searchParams.ayush_system}
                onChange={(e) => setSearchParams({ ...searchParams, ayush_system: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
              >
                <option value="">None</option>
                <option value="ayurveda">ayurveda</option>
                <option value="yoga">yoga</option>
                <option value="unani">unani</option>
                <option value="siddha">siddha</option>
                <option value="homeopathy">homeopathy</option>
              </select>
            </div>
          </div>
        );
      case 'map':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">namaste_id (required)</label>
              <input
                type="text"
                value={mapParams.namaste_id}
                onChange={(e) => setMapParams({ ...mapParams, namaste_id: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                placeholder="e.g., NAM001"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={mapParams.include_fhir}
                onChange={(e) => setMapParams({ ...mapParams, include_fhir: e.target.checked })}
                className="w-4 h-4"
                id="include_fhir"
              />
              <label htmlFor="include_fhir" className="text-xs font-semibold text-muted-foreground">include_fhir</label>
            </div>
          </div>
        );
      case 'bulk-map':
        return (
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Request Body (JSON)</label>
            <textarea
              value={bulkMapBody}
              onChange={(e) => setBulkMapBody(e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded text-sm font-mono"
              rows={8}
            />
          </div>
        );
      case 'fhir':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">namaste_id (required)</label>
              <input
                type="text"
                value={fhirParams.namaste_id}
                onChange={(e) => setFhirParams({ ...fhirParams, namaste_id: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                placeholder="e.g., NAM001"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">patient_id (required)</label>
              <input
                type="text"
                value={fhirParams.patient_id}
                onChange={(e) => setFhirParams({ ...fhirParams, patient_id: e.target.value })}
                className="w-full px-3 py-2 bg-muted border border-border rounded text-sm"
                placeholder="e.g., 123456"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary">
            NAMASTE-ICD-FHIR API
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Bridging Tradition with Global Health Standards
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Bridge the gap between traditional AYUSH medical systems and modern healthcare standards with seamless ICD-11 and FHIR integration
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/search">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/stats">
              <Button size="lg" variant="outline" className="gap-2">
                <Activity className="h-4 w-4" /> View Dashboard
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Key Benefits */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 bg-primary/5 border border-primary/20 rounded-lg text-center"
        >
          <Zap className="h-8 w-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Fast & Reliable</h3>
          <p className="text-sm text-muted-foreground">Sub-second response times with 99.9% uptime</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 bg-accent/5 border border-accent/20 rounded-lg text-center"
        >
          <Shield className="h-8 w-8 text-accent mx-auto mb-3" />
          <h3 className="font-semibold mb-2">FHIR Compliant</h3>
          <p className="text-sm text-muted-foreground">Fully compliant with HL7 FHIR R4 standards</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 bg-success/5 border border-success/20 rounded-lg text-center"
        >
          <Globe className="h-8 w-8 text-success mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Multi-System</h3>
          <p className="text-sm text-muted-foreground">Support for Ayurveda, Yoga, Unani, Siddha & Homeopathy</p>
        </motion.div>
        <motion.div
          whileHover={{ y: -4 }}
          className="p-6 bg-chart-1/5 border border-chart-1/20 rounded-lg text-center"
        >
          <Code className="h-8 w-8 text-chart-1 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">RESTful API</h3>
          <p className="text-sm text-muted-foreground">Simple, intuitive JSON-based REST endpoints</p>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-3xl font-bold mb-6 text-center">Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <Link to={feature.link}>
                <Card className="glow-card glow-card-hover h-full cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                      <CardTitle>{feature.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className="w-fit font-mono text-xs">
                      {feature.endpoint}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive API Documentation */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold text-center mb-6">Interactive API Reference</h2>
        
        {apiEndpoints.map((endpoint, idx) => {
          const isExpanded = expandedEndpoint === endpoint.id;
          const currentTab = activeTab[endpoint.id] || 'params';
          const response = responses[endpoint.id];
          
          return (
            <Card key={idx} className="glow-card">
              <CardHeader className="cursor-pointer" onClick={() => setExpandedEndpoint(isExpanded ? null : endpoint.id)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-wrap flex-1">
                    <Badge className={
                      endpoint.method === 'GET' 
                        ? 'bg-success/10 text-success border-success' 
                        : 'bg-primary/10 text-primary border-primary'
                    }>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono bg-muted px-3 py-1 rounded">
                      {endpoint.endpoint}
                    </code>
                    <endpoint.icon className={`h-4 w-4 text-${endpoint.color}`} />
                  </div>
                  {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
                <CardTitle className="text-lg mt-2">{endpoint.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="space-y-4">
                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-border">
                    <button
                      onClick={() => setActiveTab({ ...activeTab, [endpoint.id]: 'params' })}
                      className={`px-4 py-2 text-sm font-medium ${
                        currentTab === 'params' 
                          ? 'border-b-2 border-primary text-primary' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      Parameters
                    </button>
                    <button
                      onClick={() => setActiveTab({ ...activeTab, [endpoint.id]: 'try' })}
                      className={`px-4 py-2 text-sm font-medium ${
                        currentTab === 'try' 
                          ? 'border-b-2 border-primary text-primary' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      Try It Out
                    </button>
                    {response && (
                      <button
                        onClick={() => setActiveTab({ ...activeTab, [endpoint.id]: 'response' })}
                        className={`px-4 py-2 text-sm font-medium ${
                          currentTab === 'response' 
                            ? 'border-b-2 border-primary text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        Response
                      </button>
                    )}
                  </div>

                  {/* Tab Content */}
                  {currentTab === 'params' && (
                    <div className="space-y-3">
                      {endpoint.params.length > 0 ? (
                        endpoint.params.map((param, pidx) => (
                          <div key={pidx} className="p-3 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <code className="font-mono text-sm font-semibold text-primary">{param.name}</code>
                              <Badge variant="outline" className="text-xs">{param.type}</Badge>
                              {param.required && (
                                <Badge className="text-xs bg-destructive/10 text-destructive border-destructive">
                                  Required
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{param.desc}</p>
                            {param.options && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Options: {param.options.filter(o => o).join(', ')}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground p-3 bg-muted/30 rounded-lg border border-border">
                          {endpoint.bodyExample ? '✓ Request body required' : '✓ No parameters required'}
                        </div>
                      )}
                    </div>
                  )}

                  {currentTab === 'try' && (
                    <div className="space-y-4">
                      {renderParamInputs(endpoint)}
                      
                      <Button 
                        onClick={() => executeRequest(endpoint.id)}
                        disabled={loading[endpoint.id]}
                        className="w-full gap-2"
                      >
                        {loading[endpoint.id] ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending Request...
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            Execute Request
                          </>
                        )}
                      </Button>

                      {/* Request Preview */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground">Request URL:</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              let url;
                              switch(endpoint.id) {
                                case 'health': url = `${BASE_URL}/health`; break;
                                case 'search': url = buildUrl('/api/v1/search', searchParams); break;
                                case 'map': url = buildUrl('/api/v1/map', mapParams); break;
                                case 'bulk-map': url = `${BASE_URL}/api/v1/bulk-map`; break;
                                case 'fhir': url = buildUrl('/api/v1/fhir/condition', fhirParams); break;
                              }
                              handleCopy(url, `url-${endpoint.id}`);
                            }}
                            className="h-6 px-2"
                          >
                            {copiedIndex === `url-${endpoint.id}` ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <code className="text-xs font-mono bg-muted p-3 rounded block overflow-x-auto break-all">
                          {endpoint.id === 'health' && `${BASE_URL}/health`}
                          {endpoint.id === 'search' && buildUrl('/api/v1/search', searchParams)}
                          {endpoint.id === 'map' && buildUrl('/api/v1/map', mapParams)}
                          {endpoint.id === 'bulk-map' && `${BASE_URL}/api/v1/bulk-map`}
                          {endpoint.id === 'fhir' && buildUrl('/api/v1/fhir/condition', fhirParams)}
                        </code>
                      </div>
                    </div>
                  )}

                  {currentTab === 'response' && response && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge className={
                          response.status >= 200 && response.status < 300
                            ? 'bg-success/10 text-success border-success'
                            : 'bg-destructive/10 text-destructive border-destructive'
                        }>
                          Status: {response.status} {response.statusText}
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-muted-foreground">Response Body:</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(JSON.stringify(response.data, null, 2), `response-${endpoint.id}`)}
                            className="h-6 px-2"
                          >
                            {copiedIndex === `response-${endpoint.id}` ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <pre className="text-xs font-mono bg-muted p-4 rounded overflow-x-auto max-h-96 overflow-y-auto border border-border">
                          {JSON.stringify(response.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </section>



      {/* Base URL */}
      <section>
        <Card className="glow-card bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Base URL & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-2">API Base URL:</p>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-4 py-2 rounded block break-all flex-1">
                  {BASE_URL}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(BASE_URL, 'base-url')}
                >
                  {copiedIndex === 'base-url' ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg border border-border">
              <p className="text-sm mb-2">
                <strong>Usage Example:</strong>
              </p>
              <code className="text-xs font-mono bg-background px-3 py-2 rounded block">
                {'{BASE_URL}'}/api/v1/search?q=fever&source=both
              </code>
            </div>
            <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg border border-success">
              <Shield className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-success text-sm">Public API</p>
                <p className="text-xs text-muted-foreground mt-1">
                  No authentication required. All endpoints are publicly accessible for development and testing.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Explore our features and start integrating AYUSH terminology with modern healthcare standards today
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/search">
              <Button size="lg">
                Try Search API
              </Button>
            </Link>
            <Link to="/mapping">
              <Button size="lg" variant="outline">
                Explore Mapping
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}