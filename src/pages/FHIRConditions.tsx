import { useState } from 'react';
import { FileText, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiService } from '@/services/apiService';
import { LoadingShimmer } from '@/components/LoadingShimmer';
import { useToast } from '@/hooks/use-toast';

export default function FHIRConditions() {
  const [namasteId, setNamasteId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [condition, setCondition] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showJson, setShowJson] = useState(false);
  const { toast } = useToast();

  const handleFetch = async () => {
    if (!namasteId.trim() || !patientId.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please enter both NAMASTE ID and Patient ID',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const data = await apiService.getFHIRCondition({
        namaste_id: namasteId,
        patient_id: patientId,
      });
      setCondition(data);
      toast({
        title: 'FHIR Condition fetched',
        description: 'Successfully retrieved FHIR Condition resource',
      });
    } catch (error) {
      toast({
        title: 'Fetch failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold mb-2">FHIR Conditions</h2>
        <p className="text-muted-foreground">
          Retrieve FHIR Condition resources for patients
        </p>
      </div>

      {/* Input Form */}
      <Card className="glow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Fetch FHIR Condition
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fhir-namaste-id">NAMASTE ID</Label>
              <Input
                id="fhir-namaste-id"
                placeholder="Enter NAMASTE ID"
                value={namasteId}
                onChange={(e) => setNamasteId(e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input
                id="patient-id"
                placeholder="Enter Patient ID"
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="mt-2"
              />
            </div>
          </div>

          <Button onClick={handleFetch} disabled={loading} className="w-full">
            {loading ? 'Fetching...' : 'Fetch FHIR Condition'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {loading ? (
        <Card className="glow-card">
          <CardContent className="p-6">
            <LoadingShimmer className="h-96" />
          </CardContent>
        </Card>
      ) : condition ? (
        <Card className="glow-card glow-card-hover">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>FHIR Condition Resource</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowJson(!showJson)}
              >
                <Code className="h-4 w-4 mr-2" />
                {showJson ? 'Hide' : 'Show'} Full JSON
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!showJson ? (
              <>
                {/* Resource Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Resource Type</div>
                    <div className="font-semibold">{condition.resourceType || 'Condition'}</div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Resource ID</div>
                    <div className="font-mono text-xs">{condition.id}</div>
                  </div>
                  {condition.meta?.lastUpdated && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                      <div className="text-xs">{new Date(condition.meta.lastUpdated).toLocaleString()}</div>
                    </div>
                  )}
                </div>

                {/* Patient Reference */}
                {condition.subject && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Patient Reference</div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reference:</span> {condition.subject.reference}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span> {condition.subject.type}
                      </div>
                    </div>
                  </div>
                )}

                {/* Condition Codes */}
                {condition.code?.coding && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-3">Condition Codes</div>
                    <div className="space-y-2">
                      {condition.code.coding.map((code: any, idx: number) => (
                        <div key={idx} className="flex items-start justify-between p-3 bg-muted/50 rounded">
                          <div className="flex-1">
                            <div className="font-medium">{code.display || code.code}</div>
                            <div className="text-xs text-muted-foreground mt-1">{code.system}</div>
                            {code.userSelected && (
                              <div className="text-xs text-green-500 mt-1">✓ User Selected</div>
                            )}
                          </div>
                          <Badge variant="outline">{code.code}</Badge>
                        </div>
                      ))}
                    </div>
                    {condition.code.text && (
                      <div className="mt-3 p-2 bg-muted/30 rounded text-sm">
                        <span className="text-muted-foreground">Description:</span> {condition.code.text}
                      </div>
                    )}
                  </div>
                )}

                {/* FHIR Profile */}
                {condition.meta?.profile && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">FHIR Profile</div>
                    <div className="text-xs text-muted-foreground break-all">
                      {condition.meta.profile[0]}
                    </div>
                  </div>
                )}

                {/* Recorded Date */}
                {condition.recordedDate && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Recorded Date</div>
                    <div className="text-sm">
                      {new Date(condition.recordedDate).toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                {condition.note && condition.note.length > 0 && (
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Clinical Notes</div>
                    <div className="space-y-2">
                      {condition.note.map((note: any, idx: number) => (
                        <div key={idx} className="text-sm p-2 bg-muted/30 rounded border-l-2 border-primary">
                          {note.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Full JSON */
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96 border">
                {JSON.stringify(condition, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}