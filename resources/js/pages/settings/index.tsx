import React, { useState } from 'react';
import { Building2, Phone, Mail, MapPin, Globe, Save, Upload, AlertCircle, RefreshCw, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Textarea } from '@/components/ui/textarea';
import { BreadcrumbItem } from '@/types';

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

    post('/settings/update', {
      forceFormData: true, // This ensures proper file upload handling
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {recentlySuccessful && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800 font-medium">Company information updated successfully!</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Logo</h2>
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt={logoPreview} className="w-full h-full object-cover" loading="lazy"  />
                ) : (
                  <Building2 className="w-16 h-16 text-gray-400" />
                )}
              </div>
              <div>
                <Label htmlFor="logo-upload" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </Label>
                {errors.logoFile && (
                  <p className="text-sm text-red-600 mt-2">{errors.logoFile}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
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
                  <p className="text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  <p className="text-sm text-red-600">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  <p className="text-sm text-red-600">{errors.website}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Address Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </Label>
                <Input
                  id="address"
                  type="text"
                  name="address"
                  value={data.address}
                  onChange={handleInputChange}
                  required
                />
                {errors.address && (
                  <p className="text-sm text-red-600">{errors.address}</p>
                )}
              </div>
             
              <div className='md:col-span-2'>
                <Label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </Label>
                <Input
                  id="country"
                  type="text"
                  name="country"
                  value={data.country}
                  onChange={handleInputChange}
                  required
                />
                {errors.country && (
                  <p className="text-sm text-red-600">{errors.country}</p>
                )}
              </div>
            </div>
          </div>

          {/* Receipt Messages Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Receipt Messages</h2>
            
            {/* Return Policy */}
            <div className="space-y-2 mb-6">
              <Label htmlFor="returnPolicy" className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-600" />
                Return Policy *
              </Label>
              <Textarea
                id="returnPolicy"
                name="returnPolicy"
                value={data.returnPolicy}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your return policy message..."
                required
              />
              {errors.returnPolicy && (
                <p className="text-sm text-red-600">{errors.returnPolicy}</p>
              )}
              <p className="text-sm text-gray-500">
                This message will be displayed on receipts and return documentation.
              </p>
            </div>

            {/* Thank You Message */}
            <div className="space-y-2">
              <Label htmlFor="thankYouMessage" className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-blue-600" />
                Thank You Message *
              </Label>
              <Textarea
                id="thankYouMessage"
                name="thankYouMessage"
                value={data.thankYouMessage}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter your thank you message for receipts..."
                required
              />
              {errors.thankYouMessage && (
                <p className="text-sm text-red-600">{errors.thankYouMessage}</p>
              )}
              <p className="text-sm text-gray-500">
                This message will be displayed at the bottom of receipts.
              </p>
            </div>
          </div>
         
          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {processing ? 'Saving...' : 'Save Changes'}
            </button>
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