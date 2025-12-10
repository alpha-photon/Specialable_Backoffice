import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAllAppointments } from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDateTime } from '../lib/utils';

export default function Appointments() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-appointments', page, status],
    queryFn: () => getAllAppointments({ page, limit: 20, status }),
  });

  const appointments = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Appointments</h2>
        <p className="text-muted-foreground mt-2">View all platform appointments</p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading appointments...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Appointments ({pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment: any) => (
                  <div key={appointment._id} className="border border-border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {appointment.therapistId?.name || 'Therapist'} with{' '}
                          {appointment.patientId?.name || 'Patient'}
                        </h3>
                        {appointment.childId && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Child: {appointment.childId.name || appointment.childId}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDateTime(appointment.appointmentDate)} • {appointment.appointmentTime}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Type: {appointment.consultationType} • Duration: {appointment.duration} min
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          appointment.status === 'confirmed'
                            ? 'bg-green-500/10 text-green-500'
                            : appointment.status === 'completed'
                            ? 'bg-blue-500/10 text-blue-500'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-yellow-500/10 text-yellow-500'
                        }`}
                      >
                        {appointment.status}
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

