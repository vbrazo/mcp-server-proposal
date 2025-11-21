'use client';

import { ComplianceFinding } from '@/lib/api';
import { SeverityBadge } from './SeverityBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileCode, AlertCircle } from 'lucide-react';

interface ComplianceTableProps {
  findings: ComplianceFinding[];
}

export function ComplianceTable({ findings }: ComplianceTableProps) {
  if (findings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No findings to display</p>
        </CardContent>
      </Card>
    );
  }

  // Group findings by file
  const findingsByFile = findings.reduce((acc, finding) => {
    if (!acc[finding.file]) {
      acc[finding.file] = [];
    }
    acc[finding.file].push(finding);
    return acc;
  }, {} as Record<string, ComplianceFinding[]>);

  return (
    <div className="space-y-4">
      {Object.entries(findingsByFile).map(([file, fileFindings]) => (
        <Card key={file}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">{file}</CardTitle>
              <span className="ml-auto text-sm text-muted-foreground">
                {fileFindings.length} {fileFindings.length === 1 ? 'issue' : 'issues'}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fileFindings.map((finding) => (
              <div
                key={finding.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <SeverityBadge severity={finding.severity} />
                    <span className="text-sm font-medium">{finding.ruleName}</span>
                  </div>
                  {finding.line && (
                    <span className="text-sm text-muted-foreground">
                      Line {finding.line}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground mb-2">{finding.message}</p>
                
                {finding.code && (
                  <div className="bg-muted rounded-md p-2 mb-2">
                    <code className="text-xs font-mono">{finding.code}</code>
                  </div>
                )}
                
                {finding.fixSuggestion && (
                  <div className="mt-2 border-l-2 border-primary pl-3">
                    <p className="text-xs font-medium text-primary mb-1">💡 Suggested Fix:</p>
                    <p className="text-xs text-muted-foreground">{finding.fixSuggestion}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

