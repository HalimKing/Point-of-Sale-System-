import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Globe, Save, Upload, AlertCircle, RefreshCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CompanyInfo {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  website: string;
  returnPolicy: string;
  thankYouMessage: string;
  logo?: string;
}

const POSManagement: React.FC<CompanyInfo> = (companySettings) => {
  const { data, setData, post, processing, errors, recentlySuccessful } = useForm<CompanyInfo & { logoFile: File | null }>({
    companyName: companySettings.companyName || '',
    email: companySettings.email || '',
    phone: companySettings.phone || '',
    address: companySettings.address || '',
    country: companySettings.country || '',
    website: companySettings.website || '',
    returnPolicy: companySettings.returnPolicy || '',
    thankYouMessage: companySettings.thankYouMessage || '',
    logoFile: null,
  });

  const [logoPreview, setLogoPreview] = useState<string>('/storage/' + companySettings.logo || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(name as keyof CompanyInfo, value);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        // You can set an error state here if needed
        console.error('Please upload an image file');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        // You can set an error state here if needed
        console.error('File size must be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setLogoFile(file);
      setData('logoFile', file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post('/admin/settings/update', {
      forceFormData: true, // This ensures proper file upload handling
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Success Message */}
      {recentlySuccessful && (
        <div className="max-w-7xl mx-auto mb-6">
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Company information updated successfully!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your company information and receipt settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Update your company details and logo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo Section */}
              <div className="space-y-4">
                <Label>Company Logo</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={logoPreview} alt="Company Logo" />
                    <AvatarFallback className="bg-muted">
                      <Building2 className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Label htmlFor="logo-upload">
                        <Button type="button" variant="outline" asChild>
                          <span className="cursor-pointer">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Logo
                          </span>
                        </Button>
                      </Label>
                    </div>
                    {errors.logoFile && (
                      <p className="text-sm text-destructive">{errors.logoFile}</p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={data.companyName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.companyName && (
                    <p className="text-sm text-destructive">{errors.companyName}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={data.phone}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="website"
                      type="text"
                      name="website"
                      value={data.website}
                      onChange={handleInputChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Address Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    type="text"
                    name="address"
                    value={data.address}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">{errors.address}</p>
                  )}
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    type="text"
                    name="country"
                    value={data.country}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.country && (
                    <p className="text-sm text-destructive">{errors.country}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Receipt Messages</CardTitle>
              <CardDescription>
                Configure messages that appear on customer receipts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Return Policy */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="returnPolicy">Return Policy *</Label>
                </div>
                <Textarea
                  id="returnPolicy"
                  name="returnPolicy"
                  value={data.returnPolicy}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Enter your return policy message..."
                  required
                />
                {errors.returnPolicy && (
                  <p className="text-sm text-destructive">{errors.returnPolicy}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  This message will be displayed on receipts and return documentation.
                </p>
              </div>

              <Separator />

              {/* Thank You Message */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <Label htmlFor="thankYouMessage">Thank You Message *</Label>
                </div>
                <Textarea
                  id="thankYouMessage"
                  name="thankYouMessage"
                  value={data.thankYouMessage}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Enter your thank you message for receipts..."
                  required
                />
                {errors.thankYouMessage && (
                  <p className="text-sm text-destructive">{errors.thankYouMessage}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  This message will be displayed at the bottom of receipts.
                </p>
              </div>
            </CardContent>
          </Card>
         
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={processing}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Settings',
    href: '/settings/index',
  },
];

export default function Dashboard({ companySettings }: { companySettings: CompanyInfo }) {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Settings" />
      <POSManagement {...companySettings} />
    </AppLayout>
  );
}