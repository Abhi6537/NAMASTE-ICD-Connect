import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Code, BookOpen, FileJson, Tag, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiService, SearchResult } from '@/services/apiService';
import { CardSkeleton } from '@/components/LoadingShimmer';
import { useToast } from '@/hooks/use-toast';

export default function TerminologySearch() {
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<'namaste' | 'icd11' | 'both'>('both');
  const [ayushSystem, setAyushSystem] = useState<string>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<'cards' | 'json'>('cards');
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Search query required',
        description: 'Please enter a search term',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setRawResponse(null);
    
    try {
      const [processedData, rawData] = await Promise.all([
        apiService.search({
          q: query,
          source,
          ayush_system: ayushSystem === 'all' ? undefined : (ayushSystem as any),
        }),
        apiService.searchRaw({
          q: query,
          source,
          ayush_system: ayushSystem === 'all' ? undefined : (ayushSystem as any),
        })
      ]);

      setResults(processedData);
      setRawResponse(rawData);
      
      toast({
        title: 'Search completed',
        description: `Found ${processedData.length} result${processedData.length !== 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Search error:', error);
      
      toast({
        title: 'Search failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const getConfidenceBadge = (confidence?: number) => {
    if (confidence === undefined || confidence === null) return null;
    
    const percentage = (confidence * 100).toFixed(0);
    
    if (confidence >= 0.8) {
      return <Badge className="bg-green-600 text-white">High • {percentage}%</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-600 text-white">Medium • {percentage}%</Badge>;
    } else {
      return <Badge className="bg-red-600 text-white">Low • {percentage}%</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2">Terminology Search</h2>
        <p className="text-muted-foreground">
          Search across NAMASTE and ICD-11 medical terminology databases
        </p>
      </div>

      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Enter medical term (e.g., fever, headache...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-11"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="h-11 px-8">
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <Select value={source} onValueChange={(v: any) => setSource(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both</SelectItem>
                  <SelectItem value="namaste">NAMASTE</SelectItem>
                  <SelectItem value="icd11">ICD-11</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">AYUSH System (Optional)</label>
              <Select value={ayushSystem} onValueChange={setAyushSystem}>
                <SelectTrigger>
                  <SelectValue placeholder="All systems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="ayurveda">Ayurveda</SelectItem>
                  <SelectItem value="yoga">Yoga</SelectItem>
                  <SelectItem value="unani">Unani</SelectItem>
                  <SelectItem value="siddha">Siddha</SelectItem>
                  <SelectItem value="homeopathy">Homeopathy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : results.length > 0 ? (
        <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="cards" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Card View
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              JSON View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="mt-6">
            <AnimatePresence mode="popLayout">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {results.map((result: any, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card className="glow-card glow-card-hover h-full">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{result.term}</CardTitle>
                            {result.term_hindi && (
                              <p className="text-base text-muted-foreground font-medium">{result.term_hindi}</p>
                            )}
                          </div>
                          {getConfidenceBadge(result.confidence)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary font-medium">
                            {result.source}
                          </Badge>
                          
                          {result.id && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {result.source === 'ICD-11' ? 'ICD' : 'ID'}: {result.id}
                            </Badge>
                          )}
                          
                          {result.code && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Code: {result.code}
                            </Badge>
                          )}
                          
                          {result.ayush_system && (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                              {result.ayush_system}
                            </Badge>
                          )}
                          
                          {result.system && (
                            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                              {result.system}
                            </Badge>
                          )}
                          
                          {result.system_name && (
                            <Badge variant="outline" className="bg-teal-50 text-teal-700 border-teal-200">
                              {result.system_name}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {(result.category || result.subcategory) && (
                          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                            <Layers className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              {result.category && (
                                <div>
                                  <span className="font-medium">Category:</span>{' '}
                                  <span className="text-muted-foreground">{result.category}</span>
                                </div>
                              )}
                              {result.subcategory && (
                                <div className="text-muted-foreground">{result.subcategory}</div>
                              )}
                            </div>
                          </div>
                        )}

                        {result.description && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">Description</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed pl-6">
                              {result.description}
                            </p>
                          </div>
                        )}

                        {result.synonyms && result.synonyms.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Tag className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-semibold">Synonyms</span>
                            </div>
                            <div className="flex flex-wrap gap-2 pl-6">
                              {result.synonyms.map((synonym: string, idx: number) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {synonym}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(index)}
                          className="w-full justify-between mt-4"
                        >
                          <span className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            View Raw JSON
                          </span>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedCards.has(index) ? 'rotate-180' : ''
                            }`}
                          />
                        </Button>

                        <AnimatePresence>
                          {expandedCards.has(index) && (
                            <motion.pre
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-64"
                            >
                              {JSON.stringify(result, null, 2)}
                            </motion.pre>
                          )}
                        </AnimatePresence>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="json" className="mt-6">
            <Card className="glow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Complete API Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[600px]">
                  {JSON.stringify(rawResponse, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}