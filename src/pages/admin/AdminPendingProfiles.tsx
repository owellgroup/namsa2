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
import { CheckCircle, XCircle, Eye, FileText, Image, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminPendingProfiles: React.FC = () => {
  const [profiles, setProfiles] = useState<MemberDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<MemberDetails | null>(null);
  const [ipiNumber, setIpiNumber] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewDocs, setReviewDocs] = useState<any | null>(null);
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

  const openReview = async (profile: MemberDetails) => {
    try {
      setSelectedProfile(profile);
      setReviewDocs(null);
      setReviewOpen(true);
      // Fetch documents + profile using admin endpoint
      const docs = await adminAPI.getUserDocuments(profile.user.id);
      setReviewDocs(docs);
    } catch (error: any) {
      toast({
        title: 'Failed to load documents',
        description: error?.response?.data || 'Error fetching user documents',
        variant: 'destructive',
      });
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
                      onClick={() => openReview(profile)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Profile
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

        <ReviewDialog open={reviewOpen} onOpenChange={setReviewOpen} profile={selectedProfile} docs={reviewDocs} />
      </div>
    </DashboardLayout>
  );
};

export default AdminPendingProfiles;
 
// Review Dialog UI
// Note: Injected at file bottom to keep component concise
function ReviewDialog({ open, onOpenChange, profile, docs }: { open: boolean; onOpenChange: (v: boolean) => void; profile: MemberDetails | null; docs: any }) {
  if (!profile) return null as any;
  const status = profile.status?.statusName || 'PENDING';
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Artist Submission Review</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="profile">
          <TabsList>
            <TabsTrigger value="profile">
              <UserIcon /> Profile
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-1" /> Documents
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input value={profile.firstName} disabled />
              </div>
              <div>
                <Label>Surname</Label>
                <Input value={profile.surname} disabled />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={profile.phoneNumber} disabled />
              </div>
              <div>
                <Label>Artist ID</Label>
                <Input value={(profile as any).ArtistId || (profile as any).artistId || '-'} disabled />
              </div>
              <div>
                <Label>IPI Number</Label>
                <Input value={(profile as any).IPI_number || (profile as any).ipiNumber || '-'} disabled />
              </div>
              <div className="md:col-span-2">
                <Label>Status</Label>
                <Input value={status} disabled />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="documents">
            <div className="space-y-4">
              {docs?.passportphoto || docs?.passportPhoto ? (
                <DocRow
                  title="Passport Photo"
                  url={(docs.passportphoto || docs.passportPhoto).imageUrl}
                />
              ) : null}
              {docs?.idDocument ? (
                <DocRow title="ID Document" url={docs.idDocument.fileUrl} />
              ) : null}
              {docs?.bankConfirmationLetter ? (
                <DocRow title="Bank Confirmation Letter" url={docs.bankConfirmationLetter.fileUrl} />
              ) : null}
              {docs?.proofOfPayment ? (
                <DocRow title="Proof Of Payment" url={docs.proofOfPayment.fileUrl} />
              ) : null}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function DocRow({ title, url }: { title: string; url: string }) {
  return (
    <div className="flex items-center justify-between p-3 rounded border">
      <div className="flex items-center gap-2">
        <Image className="h-4 w-4" />
        <span className="font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => window.open(url, '_blank')}>View</Button>
      </div>
    </div>
  );
}
