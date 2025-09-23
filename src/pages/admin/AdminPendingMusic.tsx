import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { adminAPI } from '@/services/api';
import { ArtistWork } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Play, Download } from 'lucide-react';

const AdminPendingMusic: React.FC = () => {
  const [music, setMusic] = useState<ArtistWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<ArtistWork | null>(null);
  const [isrcCode, setIsrcCode] = useState('');
  const [rejectionNotes, setRejectionNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadMusic();
  }, []);

  const loadMusic = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingMusic();
      setMusic(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load pending music",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (musicItem: ArtistWork) => {
    if (!isrcCode.trim()) {
      toast({
        title: "ISRC Code Required",
        description: "Please enter an ISRC code for approval",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(musicItem.id);
      await adminAPI.approveMusic(musicItem.id, isrcCode);
      toast({
        title: "Music Approved",
        description: `"${musicItem.title}" has been approved`,
      });
      setIsrcCode('');
      setSelectedMusic(null);
      loadMusic();
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error?.response?.data?.message || "Failed to approve music",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (musicItem: ArtistWork) => {
    if (!rejectionNotes.trim()) {
      toast({
        title: "Rejection Notes Required",
        description: "Please enter notes for rejection",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessing(musicItem.id);
      await adminAPI.rejectMusic(musicItem.id, rejectionNotes);
      toast({
        title: "Music Rejected",
        description: `"${musicItem.title}" has been rejected`,
      });
      setRejectionNotes('');
      setSelectedMusic(null);
      loadMusic();
    } catch (error: any) {
      toast({
        title: "Rejection Failed",
        description: error?.response?.data?.message || "Failed to reject music",
        variant: "destructive",
      });
    } finally {
      setProcessing(null);
    }
  };

  const formatDuration = (duration: string) => {
    if (!duration) return 'Unknown';
    const seconds = parseInt(duration);
    if (isNaN(seconds)) return duration;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Pending Music">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pending Music">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Music Approvals</h1>
          <p className="text-muted-foreground">Review and approve/reject music uploads</p>
        </div>

        {music.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">No pending music to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {music.map((musicItem) => (
              <Card key={musicItem.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">
                      {musicItem.title}
                    </CardTitle>
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                      PENDING
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Artist</p>
                    <p className="font-medium">{musicItem.artist || musicItem.user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Album</p>
                    <p className="font-medium">{musicItem.albumName || 'Not specified'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{formatDuration(musicItem.duration)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">File Type</p>
                    <p className="font-medium">{musicItem.fileType || 'Unknown'}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Upload Date</p>
                    <p className="font-medium">
                      {new Date(musicItem.uploadedDate).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(musicItem.fileUrl, '_blank')}
                      className="flex-1"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Play
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = musicItem.fileUrl;
                        link.download = musicItem.title;
                        link.click();
                      }}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMusic(musicItem)}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMusic(musicItem)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Approval Modal */}
        {selectedMusic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Approve Music</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="isrcCode">ISRC Code *</Label>
                  <Input
                    id="isrcCode"
                    value={isrcCode}
                    onChange={(e) => setIsrcCode(e.target.value)}
                    placeholder="Enter ISRC code"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(selectedMusic)}
                    disabled={processing === selectedMusic.id}
                    className="flex-1"
                  >
                    {processing === selectedMusic.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMusic(null);
                      setIsrcCode('');
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
        {selectedMusic && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Reject Music</CardTitle>
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
                    onClick={() => handleReject(selectedMusic)}
                    disabled={processing === selectedMusic.id}
                    className="flex-1"
                  >
                    {processing === selectedMusic.id ? 'Processing...' : 'Reject'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedMusic(null);
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

export default AdminPendingMusic;
