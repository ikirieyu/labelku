import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Copy, 
  Share2,
  MessageCircle,
  Send,
  Mail,
  FileText,
  CheckCircle
} from 'lucide-react';
import {
  generateReceiptPDF,
  formatReceiptText,
  downloadPDF,
  copyToClipboard,
  shareViaWhatsApp,
  shareViaTelegram,
  shareViaEmail,
  type ReceiptData
} from '@/lib/pdf-generator-enhanced';

interface ReceiptOutputProps {
  receiptData: ReceiptData;
  onClose: () => void;
}

export default function ReceiptOutput({ receiptData, onClose }: ReceiptOutputProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const receiptText = formatReceiptText(receiptData);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      const blob = await generateReceiptPDF(receiptData);
      setPdfBlob(blob);
      const filename = `resi-${receiptData.trackingNumber}.pdf`;
      downloadPDF(blob, filename);
      
      toast({
        title: "PDF Berhasil Dibuat",
        description: `Resi ${receiptData.trackingNumber} telah diunduh.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat PDF. Silakan coba lagi.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    const success = await copyToClipboard(receiptText);
    if (success) {
      toast({
        title: "Berhasil Disalin",
        description: "Informasi resi telah disalin ke clipboard.",
      });
    } else {
      toast({
        title: "Gagal Menyalin",
        description: "Tidak dapat menyalin ke clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleShareWhatsApp = () => {
    shareViaWhatsApp(receiptText, pdfBlob || undefined);
    toast({
      title: "Membuka WhatsApp",
      description: "Mengarahkan ke WhatsApp untuk berbagi resi.",
    });
  };

  const handleShareTelegram = () => {
    shareViaTelegram(receiptText);
    toast({
      title: "Membuka Telegram",
      description: "Mengarahkan ke Telegram untuk berbagi resi.",
    });
  };

  const handleShareEmail = () => {
    shareViaEmail(receiptText, pdfBlob || undefined);
    toast({
      title: "Membuka Email",
      description: "Mengarahkan ke aplikasi email untuk berbagi resi.",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <CardTitle className="text-xl text-green-600">Resi Berhasil Dibuat!</CardTitle>
          </div>
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
            ✕
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Receipt Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">📦 RESI PENGIRIMAN</h3>
              <p className="font-mono text-lg text-blue-600">{receiptData.trackingNumber}</p>
              <p className="text-sm text-gray-600">{receiptData.courier.toUpperCase()} - {receiptData.service}</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">👤 PENGIRIM:</h4>
                <p className="font-medium">{receiptData.senderName}</p>
                <p>{receiptData.senderPhone}</p>
                <p className="text-gray-600">{receiptData.senderAddress}</p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">📍 PENERIMA:</h4>
                <p className="font-medium">{receiptData.recipientName}</p>
                <p>{receiptData.recipientPhone}</p>
                <p className="text-gray-600">{receiptData.recipientAddress}</p>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div>
              <h4 className="font-semibold mb-2">📦 INFORMASI PAKET:</h4>
              <p><span className="font-medium">Isi:</span> {receiptData.packageContents}</p>
              <p><span className="font-medium">Berat:</span> {receiptData.weight} gram</p>
              {receiptData.notes && (
                <p><span className="font-medium">Catatan:</span> {receiptData.notes}</p>
              )}
            </div>
            
            <div className="text-center mt-4 text-sm text-gray-500">
              📅 {new Date().toLocaleDateString('id-ID')}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Primary Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                size="lg"
              >
                <Download className="h-5 w-5 mr-2" />
                {isGenerating ? 'Membuat PDF...' : 'Unduh PDF'}
              </Button>

              <Button 
                onClick={handleCopyText}
                variant="outline"
                size="lg"
              >
                <Copy className="h-5 w-5 mr-2" />
                Salin Teks
              </Button>
            </div>

            {/* Share Options */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Share2 className="h-4 w-4" />
                <span className="font-medium">Bagikan Resi:</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Button 
                  onClick={handleShareWhatsApp}
                  variant="outline"
                  className="bg-green-50 hover:bg-green-100 border-green-200"
                >
                  <MessageCircle className="h-4 w-4 mr-2 text-green-600" />
                  WhatsApp
                </Button>

                <Button 
                  onClick={handleShareTelegram}
                  variant="outline"
                  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                >
                  <Send className="h-4 w-4 mr-2 text-blue-600" />
                  Telegram
                </Button>

                <Button 
                  onClick={handleShareEmail}
                  variant="outline"
                  className="bg-gray-50 hover:bg-gray-100 border-gray-200"
                >
                  <Mail className="h-4 w-4 mr-2 text-gray-600" />
                  Email
                </Button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 p-4 rounded-lg text-sm">
            <h4 className="font-semibold text-blue-800 mb-2">💡 Petunjuk:</h4>
            <ul className="text-blue-700 space-y-1">
              <li>• <strong>Unduh PDF:</strong> File resi akan tersimpan di perangkat Anda</li>
              <li>• <strong>Salin Teks:</strong> Informasi resi disalin untuk ditempel di aplikasi lain</li>
              <li>• <strong>Bagikan:</strong> Kirim resi langsung melalui WhatsApp, Telegram, atau Email</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}