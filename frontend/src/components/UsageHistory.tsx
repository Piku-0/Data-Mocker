'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from 'lucide-react';

// Define the shape of a single usage log
interface UsageLog {
  prompt: string;
  timestamp: string;
}

export function UsageHistory() {
  const { data: usageLogs, isLoading } = useQuery<UsageLog[]>({
    queryKey: ['usageHistory'],
    queryFn: async () => {
      const response = await apiClient.get('/users/me/usage');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage History</CardTitle>
        <CardDescription>A log of your recent data generation prompts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Prompt</TableHead>
              <TableHead className="text-right">Date & Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usageLogs?.map((log, index) => (
              <TableRow key={index}>
                <TableCell className="font-mono text-xs">{log.prompt}</TableCell>
                <TableCell className="text-right text-xs">
                  {new Date(log.timestamp).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}