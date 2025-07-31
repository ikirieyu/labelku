import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Truck, User, MapPin, Package, Printer, RotateCcw, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTrackingNumber } from '@/lib/pdf-generator-enhanced';
import ReceiptOutput from '@/components/ReceiptOutput';
import type { ReceiptData } from '@/lib/pdf-generator-enhanced';

interface ShippingData {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  recipientName: string;
  recipientPhone: string;
  recipientAddress: string;
  packageContents: string;
  weight: string;
  notes: string;
  courier: string;
  service: string;
  paperSize: string;
  orientation: string;
}

interface CourierService {
  name: string;
  price: number;
  estimatedDays: string;
}

export default function ShippingGenerator() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<ShippingData>({
    senderName: '',
    senderPhone: '',
    senderAddress: '',
    recipientName: '',
    recipientPhone: '',
    recipientAddress: '',
    packageContents: '',
    weight: '',
    notes: '',
    courier: '',
    service: '',
    paperSize: '100x150mm',
    orientation: 'portrait'
  });

  const [services, setServices] = useState<CourierService[]>([]);
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [showReceiptOutput, setShowReceiptOutput] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<ReceiptData | null>(null);

  const couriers = [
    { value: 'jnt', label: 'J&T Express' },
    { value: 'jne', label: 'JNE' },
    { value: 'lion', label: 'Lion Parcel' },
    { value: 'pos', label: 'Pos Indonesia' },
    { value: 'tiki', label: 'TIKI' },
    { value: 'wahana', label: 'Wahana' }
  ];

  const paperSizes = [
    '30x55mm', '40x30mm', '40x50mm', '50x33mm', '50x40mm', '50x50mm', 
    '50x100mm', '60x20mm', '76x130mm', '80x100mm', '100x100mm', 
    '100x150mm', '100x180mm', 'Custom'
  ];

  const handleInputChange = (field: keyof ShippingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkShippingCost = async () => {
    if (!formData.courier || !formData.weight || !formData.senderAddress || !formData.recipientAddress) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Pastikan alamat pengirim, penerima, berat paket, dan ekspedisi sudah dipilih.",
        variant: "destructive"
      });
      return;
    }

    setIsCheckingPrice(true);
    
    // Simulate API call for checking shipping cost
    setTimeout(() => {
      const mockServices: CourierService[] = [
        { name: 'Reguler', price: 15000, estimatedDays: '2-3 hari' },
        { name: 'Express', price: 25000, estimatedDays: '1-2 hari' },
        { name: 'Same Day', price: 35000, estimatedDays: 'Hari ini' }
      ];
      
      setServices(mockServices);
      setIsCheckingPrice(false);
      toast({
        title: "Ongkir Berhasil Dicek",
        description: "Pilih layanan pengiriman yang diinginkan."
      });
    }, 1500);
  };

  const generateReceipt = async () => {
    if (!formData.senderName || !formData.recipientName || !formData.packageContents || !formData.weight || !formData.service) {
      toast({
        title: "Data Tidak Lengkap",
        description: "Pastikan semua data wajib sudah diisi dan layanan pengiriman dipilih.",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedService = services.find(s => s.name === formData.service);
      const trackingNumber = generateTrackingNumber(formData.courier);
      
      const receiptData = {
        ...formData,
        shippingCost: selectedService?.price || 0,
        trackingNumber
      };

      setGeneratedReceipt(receiptData);
      setShowReceiptOutput(true);

      toast({
        title: "Resi Berhasil Dibuat",
        description: `Resi pengiriman dengan nomor ${trackingNumber} telah berhasil dibuat.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat membuat resi. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      senderName: '',
      senderPhone: '',
      senderAddress: '',
      recipientName: '',
      recipientPhone: '',
      recipientAddress: '',
      packageContents: '',
      weight: '',
      notes: '',
      courier: '',
      service: '',
      paperSize: '100x150mm',
      orientation: 'portrait'
    });
    setServices([]);
    toast({
      title: "Form Direset",
      description: "Semua data formulir telah dihapus."
    });
  };

  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Truck className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800" align="left"
            >LabelKu <br></br>by IKIRIEYU | イキリユ</h1>
        </div>
        <p className="text-gray-600">Buat resi pengiriman dan cek ongkos kirim dengan mudah</p>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardContent className="p-6 space-y-8">
            
            {/* Data Pengiriman Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Data Pengiriman</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="senderName">Nama Pengirim</Label>
                  <Input
                    id="senderName"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    placeholder="Masukkan nama pengirim"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">Nomor HP Pengirim</Label>
                  <Input
                    id="senderPhone"
                    value={formData.senderPhone}
                    onChange={(e) => handleInputChange('senderPhone', e.target.value)}
                    placeholder="Masukkan nomor HP pengirim"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Alamat Asal Lengkap</Label>
                <Textarea
                  id="senderAddress"
                  value={formData.senderAddress}
                  onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                  placeholder="Masukkan alamat lengkap pengirim"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Penerima Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h2 className="text-xl font-semibold text-gray-800">Penerima</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Nama Penerima</Label>
                  <Input
                    id="recipientName"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    placeholder="Masukkan nama penerima"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhone">Nomor HP Penerima</Label>
                  <Input
                    id="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={(e) => handleInputChange('recipientPhone', e.target.value)}
                    placeholder="Masukkan nomor HP penerima"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Alamat Lengkap Penerima</Label>
                <Textarea
                  id="recipientAddress"
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                  placeholder="Masukkan alamat lengkap penerima"
                  rows={3}
                />
              </div>
            </div>

            <Separator />

            {/* Informasi Paket Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Package className="h-5 w-5 text-orange-600" />
                <h2 className="text-xl font-semibold text-gray-800">Informasi Paket</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="packageContents">Isi Paket</Label>
                  <Input
                    id="packageContents"
                    value={formData.packageContents}
                    onChange={(e) => handleInputChange('packageContents', e.target.value)}
                    placeholder="Contoh: Baju, Elektronik, dll"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Berat (gram)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder="500"
                    min="1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Catatan (opsional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Catatan tambahan untuk pengiriman"
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Pilihan Ekspedisi Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-800">Pilih Ekspedisi</h2>
              </div>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="courier">Pilih Ekspedisi</Label>
                  <Select value={formData.courier} onValueChange={(value) => handleInputChange('courier', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ekspedisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {couriers.map((courier) => (
                        <SelectItem key={courier.value} value={courier.value}>
                          {courier.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={checkShippingCost} 
                  disabled={isCheckingPrice}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isCheckingPrice ? 'Mengecek...' : 'Cek Ongkos Kirim'}
                </Button>
              </div>

              {services.length > 0 && (
                <div className="space-y-2">
                  <Label>Pilih Layanan</Label>
                  <div className="grid gap-2">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`service-${index}`}
                          name="service"
                          value={service.name}
                          checked={formData.service === service.name}
                          onChange={(e) => handleInputChange('service', e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label htmlFor={`service-${index}`} className="flex-1 cursor-pointer">
                          <div className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                            <div>
                              <span className="font-medium">{service.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({service.estimatedDays})</span>
                            </div>
                            <span className="font-semibold text-blue-600">
                              Rp {service.price.toLocaleString()}
                            </span>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Ukuran Kertas Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Printer className="h-5 w-5 text-indigo-600" />
                <h2 className="text-xl font-semibold text-gray-800">Ukuran Kertas</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paperSize">Ukuran Kertas</Label>
                  <Select value={formData.paperSize} onValueChange={(value) => handleInputChange('paperSize', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih ukuran kertas" />
                    </SelectTrigger>
                    <SelectContent>
                      {paperSizes.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size} {size === '100x150mm' ? '(Default)' : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orientation">Orientasi</Label>
                  <Select value={formData.orientation} onValueChange={(value) => handleInputChange('orientation', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih orientasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="landscape">Landscape</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button 
                onClick={generateReceipt}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                <FileText className="h-5 w-5 mr-2" />
                Generate Resi
              </Button>
              <Button 
                onClick={resetForm}
                variant="outline"
                size="lg"
                className="px-8"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    {/* Receipt Output Modal */}
    {showReceiptOutput && generatedReceipt && (
      <ReceiptOutput 
        receiptData={generatedReceipt}
        onClose={() => setShowReceiptOutput(false)}
      />
    )}
    </>
  );
}
