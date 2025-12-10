import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllChildren } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';

export default function Children() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-children', page],
    queryFn: () => getAllChildren({ page, limit: 20 }),
  });

  const children = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Children/Patients</h2>
        <p className="text-muted-foreground mt-2">View all registered children</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading children...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Children ({pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {children.map((child: any) => (
                  <div key={child._id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{child.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Parent: {child.parentId?.name || 'N/A'} • DOB: {formatDate(child.dateOfBirth)}
                        </p>
                        {child.primaryDoctor && (
                          <p className="text-sm text-muted-foreground">
                            Primary Doctor: {child.primaryDoctor?.name || child.primaryDoctor}
                          </p>
                        )}
                        {child.primaryTherapist && (
                          <p className="text-sm text-muted-foreground">
                            Primary Therapist: {child.primaryTherapist?.name || child.primaryTherapist}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {formatDate(child.createdAt)}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          child.isActive
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-gray-500/10 text-gray-500'
                        }`}
                      >
                        {child.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

