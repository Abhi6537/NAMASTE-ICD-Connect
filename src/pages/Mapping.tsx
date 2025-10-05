import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, ArrowRight, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/apiService';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { useToast } from '@/hooks/use-toast';

export default function Mapping() {
  const [namasteId, setNamasteId] = useState('');
  const [includeFhir, setIncludeFhir] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const { toast } = useToast();

  const handleMap = async () => {
    if (!namasteId.trim()) {
      toast({
        title: 'NAMASTE ID required',
        description: 'Please enter a NAMASTE ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.mapTerminology({
        namaste_id: namasteId,
        include_fhir: includeFhir,
      });
      setResult(data);
      toast({
        title: 'Mapping successful',
        description: 'Terminology mapped successfully',
      });
    } catch (error) {
      toast({
        title: 'Mapping failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMatchInfo = () => {
    if (!result) return null;
    
    const match = result.best_icd11_match;
    if (match?.found) {
      return {
        code: match.code || 'N/A',
        title: match.title || 'N/A',
        confidence: match.confidence_score || 0
      };
    }
    return {
      code: 'N/A',
      title: match?.message || 'No match found',
      confidence: 0
    };
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2">Terminology Mapping</h2>
        <p className="text-muted-foreground">
          Map NAMASTE terminology to ICD-11 codes and FHIR resources
        </p>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="single">Single Mapping</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-6">
          {/* Input Form */}
          <Card className="glow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Map Single Term
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="namaste-id">NAMASTE ID</Label>
                <Input
                  id="namaste-id"
                  placeholder="Enter NAMASTE ID"
                  value={namasteId}
                  onChange={(e) => setNamasteId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleMap()}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="include-fhir"
                  checked={includeFhir}
                  onCheckedChange={setIncludeFhir}
                />
                <Label htmlFor="include-fhir">Include FHIR Condition</Label>
              </div>

              <Button onClick={handleMap} disabled={loading} className="w-full">
                {loading ? 'Mapping...' : 'Map Terminology'}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {loading ? (
            <Card className="glow-card">
              <CardContent className="p-6">
                <LoadingShimmer className="h-64" />
              </CardContent>
            </Card>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glow-card glow-card-hover">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Mapping Result</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowJson(!showJson)}
                    >
                      <Code className="h-4 w-4 mr-2" />
                      {showJson ? 'Hide' : 'Show'} JSON
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!showJson ? (
                    <>
                      {/* Flow Diagram */}
                      <div className="flex items-center justify-between gap-4 p-6 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground mb-1">NAMASTE</div>
                          <div className="font-semibold text-lg">{result.namaste_term?.term || 'N/A'}</div>
                          <Badge className="mt-2 bg-primary/10 text-primary border-primary">
                            {result.namaste_term?.id || 'Source'}
                          </Badge>
                          {result.namaste_term?.ayush_system && (
                            <div className="text-xs text-muted-foreground mt-2">
                              System: {result.namaste_term.ayush_system}
                            </div>
                          )}
                        </div>

                        <motion.div
                          animate={{ x: [0, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowRight className="h-8 w-8 text-primary" />
                        </motion.div>

                        <div className="flex-1">
                          <div className="text-sm text-muted-foreground mb-1">ICD-11</div>
                          <div className="font-semibold text-lg">{getMatchInfo()?.title}</div>
                          <Badge className="mt-2 bg-accent/10 text-accent border-accent">
                            {getMatchInfo()?.code}
                          </Badge>
                        </div>

                        {result.fhir_condition && (
                          <>
                            <motion.div
                              animate={{ x: [0, 10, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
                            >
                              <ArrowRight className="h-8 w-8 text-accent" />
                            </motion.div>

                            <div className="flex-1">
                              <div className="text-sm text-muted-foreground mb-1">FHIR</div>
                              <div className="font-semibold text-lg">Condition Resource</div>
                              <Badge className="mt-2 bg-success/10 text-success border-success">
                                Generated
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      {/* NAMASTE Term Details */}
                      {result.namaste_term && (
                        <div className="p-4 border rounded-lg">
                          <div className="text-sm font-medium mb-3">NAMASTE Term Details</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">ID:</span> {result.namaste_term.id}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Category:</span> {result.namaste_term.category || 'N/A'}
                            </div>
                            {result.namaste_term.description && (
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">Description:</span> {result.namaste_term.description}
                              </div>
                            )}
                            {result.namaste_term.synonyms && result.namaste_term.synonyms.length > 0 && (
                              <div className="md:col-span-2">
                                <span className="text-muted-foreground">Synonyms:</span> {result.namaste_term.synonyms.join(', ')}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Mapping Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-muted/50 rounded-lg">
                          <div className="text-sm text-muted-foreground mb-1">Confidence Score</div>
                          <Badge
                            className={
                              (getMatchInfo()?.confidence || 0) >= 0.8
                                ? 'bg-success text-white'
                                : (getMatchInfo()?.confidence || 0) >= 0.5
                                ? 'bg-warning text-white'
                                : 'bg-destructive text-white'
                            }
                          >
                            {((getMatchInfo()?.confidence || 0) * 100).toFixed(0)}%
                          </Badge>
                        </div>

                        {result.mapping?.status && (
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Mapping Status</div>
                            <div className="font-semibold text-sm">{result.mapping.status}</div>
                          </div>
                        )}

                        {result.mapping?.mapping_method && (
                          <div className="p-4 bg-muted/50 rounded-lg">
                            <div className="text-sm text-muted-foreground mb-1">Mapping Method</div>
                            <div className="text-sm">{result.mapping.mapping_method.replace(/_/g, ' ')}</div>
                          </div>
                        )}
                      </div>

                      {/* Best Match Details */}
                      {result.best_icd11_match && !result.best_icd11_match.found && (
                        <div className="p-4 border rounded-lg border-warning/50 bg-warning/5">
                          <div className="text-sm font-medium mb-2 text-warning">Mapping Information</div>
                          <div className="text-sm space-y-1">
                            <div><span className="text-muted-foreground">Message:</span> {result.best_icd11_match.message}</div>
                            <div><span className="text-muted-foreground">Quality:</span> {result.best_icd11_match.mapping_quality}</div>
                            {result.best_icd11_match.recommendation && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                ℹ️ {result.best_icd11_match.recommendation}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* FHIR Condition Summary */}
                      {result.fhir_condition && (
                        <div className="p-4 border rounded-lg">
                          <div className="text-sm font-medium mb-3">FHIR Condition Summary</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Resource ID:</span> 
                              <span className="text-xs ml-1 font-mono">{result.fhir_condition.id}</span>
                            </div>
                            {result.fhir_condition.subject && (
                              <div>
                                <span className="text-muted-foreground">Patient:</span> {result.fhir_condition.subject.reference || 'N/A'}
                              </div>
                            )}
                            {result.fhir_condition.recordedDate && (
                              <div>
                                <span className="text-muted-foreground">Recorded:</span> {new Date(result.fhir_condition.recordedDate).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {result.metadata && (
                        <div className="p-4 border rounded-lg">
                          <div className="text-sm font-medium mb-3">Mapping Metadata</div>
                          <div className="grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-muted-foreground">Confidence Threshold:</span> {result.metadata.confidence_threshold}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Max Results:</span> {result.metadata.max_results}
                            </div>
                            <div>
                              <span className="text-muted-foreground">Version:</span> {result.metadata.mapping_version}
                            </div>
                            {result.mapping?.created_at && (
                              <div>
                                <span className="text-muted-foreground">Created:</span> {new Date(result.mapping.created_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Raw JSON */
                    <motion.pre
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 border"
                    >
                      {JSON.stringify(result, null, 2)}
                    </motion.pre>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : null}
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="glow-card">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Bulk mapping interface - Coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}