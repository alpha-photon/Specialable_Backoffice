import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllTherapistProfiles,
  verifyTherapistProfile,
  unverifyTherapistProfile,
  getTherapistProfileById,
} from '../services/admin.service';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { formatDate } from '../lib/utils';
import { Check, X, Search, Eye, Shield, ShieldOff } from 'lucide-react';

export default function Therapists() {
  const [page, setPage] = useState(1);
  const [isVerified, setIsVerified] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-therapists', page, isVerified, role, search],
    queryFn: () => getAllTherapistProfiles({ page, limit: 20, isVerified, role, search }),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      verifyTherapistProfile(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-therapists'] });
      setShowDetails(false);
    },
  });

  const unverifyMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      unverifyTherapistProfile(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-therapists'] });
      setShowDetails(false);
    },
  });

  const viewDetails = async (profileId: string) => {
    try {
      const response = await getTherapistProfileById(profileId);
      setSelectedProfile(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error('Error fetching profile details:', error);
    }
  };

  const profiles = data?.data || [];
  const pagination = data?.pagination || {};

  // Separate profiles into verified, unverified, and pending
  const verifiedProfiles = profiles.filter((p: any) => p.isVerified);
  const unverifiedProfiles = profiles.filter((p: any) => !p.isVerified);
  const pendingProfiles = profiles.filter(
    (p: any) => !p.isVerified && p.isProfileComplete
  );

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground">Therapist/Doctor Management</h2>
        <p className="text-muted-foreground mt-2">Verify and manage therapist and doctor profiles</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Total Profiles</div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {pagination.total || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Verified</div>
            <div className="text-2xl font-bold text-green-500 mt-2">
              {verifiedProfiles.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Unverified</div>
            <div className="text-2xl font-bold text-yellow-500 mt-2">
              {unverifiedProfiles.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Pending Review</div>
            <div className="text-2xl font-bold text-orange-500 mt-2">
              {pendingProfiles.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search therapists..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground"
                />
              </div>
            </div>
            <select
              value={isVerified}
              onChange={(e) => {
                setIsVerified(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">All Verification Status</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-input rounded-md bg-background text-foreground"
            >
              <option value="">All Roles</option>
              <option value="therapist">Therapist</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Profile Details Modal */}
      {showDetails && selectedProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {selectedProfile.userId?.name || 'Therapist'} Profile
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="text-foreground">{selectedProfile.userId?.name}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Email</div>
                  <div className="text-foreground">{selectedProfile.userId?.email}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Role</div>
                  <div className="text-foreground capitalize">{selectedProfile.userId?.role}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Verification Status</div>
                  <div>
                    {selectedProfile.isVerified ? (
                      <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">
                        Verified
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
                {selectedProfile.isVerified && (
                  <>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Verified At</div>
                      <div className="text-foreground">
                        {formatDate(selectedProfile.verifiedAt)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Verified By</div>
                      <div className="text-foreground">
                        {selectedProfile.verifiedBy?.name || 'N/A'}
                      </div>
                    </div>
                  </>
                )}
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Location</div>
                  <div className="text-foreground">
                    {selectedProfile.location?.city || 'N/A'}, {selectedProfile.location?.state || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Experience</div>
                  <div className="text-foreground">
                    {selectedProfile.yearsOfExperience || 0} years
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rating</div>
                  <div className="text-foreground">
                    {selectedProfile.averageRating?.toFixed(1) || '0.0'} ({selectedProfile.totalReviews || 0} reviews)
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Total Appointments</div>
                  <div className="text-foreground">
                    {selectedProfile.totalAppointments || 0}
                  </div>
                </div>
              </div>

              {selectedProfile.qualifications && selectedProfile.qualifications.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Qualifications</div>
                  <div className="space-y-2">
                    {selectedProfile.qualifications.map((q: any, idx: number) => (
                      <div key={idx} className="border border-border rounded p-2">
                        <div className="font-medium">{q.degree}</div>
                        <div className="text-sm text-muted-foreground">
                          {q.institution} {q.year && `(${q.year})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.specializations && selectedProfile.specializations.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Specializations</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedProfile.specializations.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs"
                      >
                        {s.replace('-', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedProfile.professionalBio && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Professional Bio</div>
                  <div className="text-foreground">{selectedProfile.professionalBio}</div>
                </div>
              )}

              {selectedProfile.licenseNumber && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">License</div>
                  <div className="text-foreground">{selectedProfile.licenseNumber}</div>
                  {selectedProfile.licenseDocument && (
                    <a
                      href={selectedProfile.licenseDocument}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View License Document
                    </a>
                  )}
                </div>
              )}

              {selectedProfile.verificationNotes && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">Verification Notes</div>
                  <div className="text-foreground">{selectedProfile.verificationNotes}</div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border">
                {selectedProfile.isVerified ? (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (confirm('Are you sure you want to unverify this profile?')) {
                        unverifyMutation.mutate({ id: selectedProfile._id });
                      }
                    }}
                    disabled={unverifyMutation.isPending}
                  >
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Unverify
                  </Button>
                ) : (
                  <Button
                    variant="default"
                    onClick={() => {
                      verifyMutation.mutate({ id: selectedProfile._id });
                    }}
                    disabled={verifyMutation.isPending}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-lg text-muted-foreground">Loading therapists...</div>
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Therapist/Doctor Profiles ({pagination.total || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Role</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rating</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((profile: any) => (
                      <tr key={profile._id} className="border-b border-border">
                        <td className="p-4">
                          <div className="font-medium text-foreground">
                            {profile.userId?.name || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {profile.userId?.email || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs capitalize">
                            {profile.userId?.role || 'N/A'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {profile.location?.city || 'N/A'}, {profile.location?.state || 'N/A'}
                        </td>
                        <td className="p-4">
                          <div className="text-sm">
                            {profile.averageRating?.toFixed(1) || '0.0'}
                            <span className="text-muted-foreground ml-1">
                              ({profile.totalReviews || 0})
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          {profile.isVerified ? (
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded text-xs">
                              <Check className="w-3 h-3 inline mr-1" />
                              Verified
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded text-xs">
                              <X className="w-3 h-3 inline mr-1" />
                              Unverified
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => viewDetails(profile._id)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            {profile.isVerified ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm('Are you sure you want to unverify this profile?')) {
                                    unverifyMutation.mutate({ id: profile._id });
                                  }
                                }}
                                disabled={unverifyMutation.isPending}
                              >
                                <ShieldOff className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  verifyMutation.mutate({ id: profile._id });
                                }}
                                disabled={verifyMutation.isPending}
                              >
                                <Shield className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

