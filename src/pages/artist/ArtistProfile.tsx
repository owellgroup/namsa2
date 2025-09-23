import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { artistAPI, lookupAPI } from '@/services/api';
import { MemberDetails, MemberDetailsForm } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ArtistProfile: React.FC = () => {
  const [profile, setProfile] = useState<MemberDetails | null>(null);
  const [form, setForm] = useState<MemberDetailsForm>({
    firstName: '',
    surname: '',
    email: '',
    phoneNumber: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [lookups, setLookups] = useState({
    titles: [],
    maritalStatuses: [],
    memberCategories: [],
    genders: [],
    bankNames: [],
  });
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        
        // Load lookups
        const [titles, maritalStatuses, memberCategories, genders, bankNames] = await Promise.all([
          lookupAPI.getTitles().catch(() => []),
          lookupAPI.getMaritalStatuses().catch(() => []),
          lookupAPI.getMemberCategories().catch(() => []),
          lookupAPI.getGenders().catch(() => []),
          lookupAPI.getBankNames().catch(() => []),
        ]);
        
        setLookups({
          titles,
          maritalStatuses,
          memberCategories,
          genders,
          bankNames,
        });
        
        // Load profile
        const data = await artistAPI.getProfile();
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          surname: data.surname || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          idNumber: data.idNumber || undefined,
          pseudonym: data.pseudonym || '',
          groupNameORStageName: data.groupNameORStageName || '',
          noOFDependents: data.noOFDependents || undefined,
          typeOfWork: data.typeOfWork || '',
          line1: data.line1 || '',
          line2: data.line2 || '',
          city: data.city || '',
          region: data.region || '',
          poBox: data.poBox || '',
          postalCode: data.postalCode || '',
          country: data.country || '',
          birthDate: data.birthDate || '',
          placeOfBirth: data.placeOfBirth || '',
          idOrPassportNumber: data.idOrPassportNumber || '',
          nationality: data.nationality || '',
          occupation: data.occupation || '',
          nameOfEmployer: data.nameOfEmployer || '',
          addressOfEmployer: data.addressOfEmployer || '',
          nameOfTheBand: data.nameOfTheBand || '',
          dateFounded: data.dateFounded || '',
          numberOfBand: data.numberOfBand || undefined,
          accountHolderName: data.accountHolderName || '',
          bankAccountNumber: data.bankAccountNumber || '',
          bankAccountType: data.bankAccountType || '',
          bankBranchName: data.bankBranchName || '',
          bankBranchNumber: data.bankBranchNumber || '',
          bankNameId: data.bankName?.id || undefined,
          titleId: data.tittle?.id || undefined,
          maritalStatusId: data.maritalStatus?.id || undefined,
          memberCategoryId: data.memberCategory?.id || undefined,
          genderId: data.gender?.id || undefined,
        });
      } catch (error) {
        // Profile doesn't exist yet, show create form
        setIsCreating(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      if (isCreating) {
        const created = await artistAPI.createProfile(form);
        setProfile(created);
        setIsCreating(false);
        toast({
          title: "Profile Created",
          description: "Your profile has been created successfully!",
        });
      } else {
      const updated = await artistAPI.updateProfile(form);
      setProfile(updated);
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Profile">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Create Your Profile' : 'Member Details'}
              {profile?.status && (
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                  profile.status.statusName === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  profile.status.statusName === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile.status.statusName}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="titleId">Title</Label>
                  <Select value={form.titleId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, titleId: value ? parseInt(value) : undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.titles.map((title: any) => (
                        <SelectItem key={title.id} value={title.id.toString()}>{title.titleName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    name="firstName" 
                    value={form.firstName} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="surname">Surname *</Label>
                  <Input 
                    id="surname" 
                    name="surname" 
                    value={form.surname} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="idNumber">ID Number</Label>
                  <Input 
                    id="idNumber" 
                    name="idNumber" 
                    type="number"
                    value={form.idNumber || ''} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="pseudonym">Pseudonym</Label>
                  <Input 
                    id="pseudonym" 
                    name="pseudonym" 
                    value={form.pseudonym} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="groupNameORStageName">Group/Stage Name</Label>
                  <Input 
                    id="groupNameORStageName" 
                    name="groupNameORStageName" 
                    value={form.groupNameORStageName} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="genderId">Gender</Label>
                  <Select value={form.genderId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, genderId: value ? parseInt(value) : undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.genders.map((gender: any) => (
                        <SelectItem key={gender.id} value={gender.id.toString()}>{gender.genderName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maritalStatusId">Marital Status</Label>
                  <Select value={form.maritalStatusId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, maritalStatusId: value ? parseInt(value) : undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.maritalStatuses.map((status: any) => (
                        <SelectItem key={status.id} value={status.id.toString()}>{status.statusName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="memberCategoryId">Member Category</Label>
                  <Select value={form.memberCategoryId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, memberCategoryId: value ? parseInt(value) : undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.memberCategories.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>{category.categoryName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    value={form.email} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    value={form.phoneNumber} 
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="noOFDependents">Number of Dependents</Label>
                  <Input 
                    id="noOFDependents" 
                    name="noOFDependents" 
                    type="number"
                    value={form.noOFDependents || ''} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="typeOfWork">Type of Work</Label>
                  <Input 
                    id="typeOfWork" 
                    name="typeOfWork" 
                    value={form.typeOfWork} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="line1">Address Line 1</Label>
                  <Input 
                    id="line1" 
                    name="line1" 
                    value={form.line1} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="line2">Address Line 2</Label>
                  <Input 
                    id="line2" 
                    name="line2" 
                    value={form.line2} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={form.city} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input 
                    id="region" 
                    name="region" 
                    value={form.region} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="poBox">PO Box</Label>
                  <Input 
                    id="poBox" 
                    name="poBox" 
                    value={form.poBox} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input 
                    id="postalCode" 
                    name="postalCode" 
                    value={form.postalCode} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country" 
                    value={form.country} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Birth and Identity */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Birth and Identity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input 
                    id="birthDate" 
                    name="birthDate" 
                    type="date"
                    value={form.birthDate} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="placeOfBirth">Place of Birth</Label>
                  <Input 
                    id="placeOfBirth" 
                    name="placeOfBirth" 
                    value={form.placeOfBirth} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="idOrPassportNumber">ID/Passport Number</Label>
                  <Input 
                    id="idOrPassportNumber" 
                    name="idOrPassportNumber" 
                    value={form.idOrPassportNumber} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input 
                    id="nationality" 
                    name="nationality" 
                    value={form.nationality} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input 
                    id="occupation" 
                    name="occupation" 
                    value={form.occupation} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Employment */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Employment</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nameOfEmployer">Employer Name</Label>
                  <Input 
                    id="nameOfEmployer" 
                    name="nameOfEmployer" 
                    value={form.nameOfEmployer} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="addressOfEmployer">Employer Address</Label>
                  <Input 
                    id="addressOfEmployer" 
                    name="addressOfEmployer" 
                    value={form.addressOfEmployer} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Band Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Band Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="nameOfTheBand">Band Name</Label>
                  <Input 
                    id="nameOfTheBand" 
                    name="nameOfTheBand" 
                    value={form.nameOfTheBand} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="dateFounded">Date Founded</Label>
                  <Input 
                    id="dateFounded" 
                    name="dateFounded" 
                    type="date"
                    value={form.dateFounded} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfBand">Number of Band Members</Label>
                  <Input 
                    id="numberOfBand" 
                    name="numberOfBand" 
                    type="number"
                    value={form.numberOfBand || ''} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Banking Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Banking Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bankNameId">Bank Name</Label>
                  <Select value={form.bankNameId?.toString() || ''} onValueChange={(value) => setForm(prev => ({ ...prev, bankNameId: value ? parseInt(value) : undefined }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bank" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.bankNames.map((bank: any) => (
                        <SelectItem key={bank.id} value={bank.id.toString()}>{bank.bankName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input 
                    id="accountHolderName" 
                    name="accountHolderName" 
                    value={form.accountHolderName} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountNumber">Bank Account Number</Label>
                  <Input 
                    id="bankAccountNumber" 
                    name="bankAccountNumber" 
                    value={form.bankAccountNumber} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bankAccountType">Bank Account Type</Label>
                  <Input 
                    id="bankAccountType" 
                    name="bankAccountType" 
                    value={form.bankAccountType} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bankBranchName">Bank Branch Name</Label>
                  <Input 
                    id="bankBranchName" 
                    name="bankBranchName" 
                    value={form.bankBranchName} 
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="bankBranchNumber">Bank Branch Number</Label>
                  <Input 
                    id="bankBranchNumber" 
                    name="bankBranchNumber" 
                    value={form.bankBranchNumber} 
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            {/* Admin-only fields display (read-only) */}
            {profile && profile.status?.statusName === 'APPROVED' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Membership Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Artist ID</Label>
                    <Input value={profile.ArtistId || 'Not assigned'} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>IPI Number</Label>
                    <Input value={profile.IPI_number || 'Not assigned'} disabled />
                  </div>
                </div>
                {profile.notes && (
                  <div className="space-y-2 mt-4">
                    <Label>Admin Notes</Label>
                    <Textarea value={profile.notes} disabled rows={3} />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : (isCreating ? 'Create Profile' : 'Save Changes')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ArtistProfile;

