import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/api';
import { MemberDetails } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Eye } from 'lucide-react';

const AdminPendingProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<MemberDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MemberDetails | null>(null);
  const [ipiNumber, setIpiNumber] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingProfiles();
      setProfiles(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load pending profiles",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (profile: MemberDetails) => {
    if (!ipiNumber.trim()) {
      toast({
        title: "IPI Number Required",
        description: "Please enter an IPI number for approval",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(profile.id);
      await adminAPI.approveProfile(profile.id, ipiNumber);
      toast({
        title: "Profile Approved",
        description: `${profile.firstName} ${profile.surname}'s profile has been approved`,
      });
      setIpiNumber('');
      setSelectedProfile(null);
      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.response?.data?.message || "Failed to approve profile",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (profile: MemberDetails) => {
    if (!rejectionNotes.trim()) {
      toast({
        title: "Rejection Notes Required",
        description: "Please enter notes for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(profile.id);
      await adminAPI.rejectProfile(profile.id, rejectionNotes);
      toast({
        title: "Profile Rejected",
        description: `${profile.firstName} ${profile.surname}'s profile has been rejected`,
      });
      setRejectionNotes('');
      setSelectedProfile(null);
      loadProfiles();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error?.response?.data?.message || "Failed to reject profile",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Pending Profiles">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pending Profiles">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Profile Approvals</h1>
          <p className="text-muted-foreground">Review and approve/reject artist profiles</p>
        </div>

        {profiles.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No pending profiles to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <Card key={profile.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {profile.firstName} {profile.surname}
                    </CardTitle>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      PENDING
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{profile.phoneNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium">{profile.nationality || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Occupation</p>
                    <p className="font-medium">{profile.occupation || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Account Holder</p>
                    <p className="font-medium">{profile.accountHolderName || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Bank Account</p>
                    <p className="font-medium">{profile.bankAccountNumber || 'Not specified'}</p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedProfile(profile)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleApprove(profile)}
                      disabled={processing === profile.id}
                      className="flex-1 text-green-600 hover:text-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      {processing === profile.id ? 'Processing...' : 'Approve'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(profile)}
                      disabled={processing === profile.id}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      {processing === profile.id ? 'Processing...' : 'Reject'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Approve Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="ipiNumber">IPI Number *</Label>
                  <Input
                    id="ipiNumber"
                    value={ipiNumber}
                    onChange={(e) => setIpiNumber(e.target.value)}
                    placeholder="Enter IPI number"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(selectedProfile)}
                    disabled={processing === selectedProfile.id}
                    className="flex-1"
                  >
                    {processing === selectedProfile.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProfile(null);
                      setIpiNumber('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Rejection Modal */}
        {selectedProfile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejectionNotes">Rejection Notes *</Label>
                  <Input
                    id="rejectionNotes"
                    value={rejectionNotes}
                    onChange={(e) => setRejectionNotes(e.target.value)}
                    placeholder="Enter rejection reason"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(selectedProfile)}
                    disabled={processing === selectedProfile.id}
                    className="flex-1"
                  >
                    {processing === selectedProfile.id ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedProfile(null);
                      setRejectionNotes('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPendingProfiles;
