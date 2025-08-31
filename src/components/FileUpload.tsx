import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import Papa from 'papaparse';
import { ChurnRecord, UploadPreview } from '../types';
import { parseCSVData } from '../utils/dataProcessing';

interface FileUploadProps {
  onUpload: (data: ChurnRecord[], preview: UploadPreview) => void;
  existingData: ChurnRecord[];
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload, existingData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'preview' | 'complete'>('idle');
  const [previewData, setPreviewData] = useState<UploadPreview | null>(null);

  const processFile = useCallback((file: File) => {
    setFileName(file.name);
    setUploadStatus('processing');
    
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Create a Set of existing Stripe User IDs for fast lookup
        const existingIds = new Set(existingData.map(item => item.stripeUserId));
        
        const newRecords: ChurnRecord[] = [];
        const duplicates: ChurnRecord[] = [];
        let errors = 0;
        
        results.data.forEach((row: any) => {
          try {
            const record = parseCSVData(row);
            
            // Validate required fields
            if (!record.stripeUserId || !record.email) {
              errors++;
              return;
            }
            
            // Check for duplicates using Stripe User ID
            if (existingIds.has(record.stripeUserId)) {
              duplicates.push(record);
            } else {
              newRecords.push(record);
            }
          } catch (e) {
            errors++;
          }
        });
        
        // Create preview
        const preview: UploadPreview = {
          newRecords: newRecords.length,
          duplicates: duplicates.length,
          errors,
          show: true,
          sampleNewRecords: newRecords.slice(0, 3),
          sampleDuplicates: duplicates.slice(0, 3)
        };
        
        setPreviewData(preview);
        setUploadStatus('preview');
        
        // Auto-confirm if no duplicates
        if (duplicates.length === 0 && newRecords.length > 0) {
          setTimeout(() => {
            onUpload(newRecords, preview);
            setUploadStatus('complete');
            setTimeout(() => {
              setUploadStatus('idle');
              setFileName('');
              setPreviewData(null);
            }, 3000);
          }, 1000);
        }
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        alert('Error parsing CSV file. Please check the format.');
        setFileName('');
        setUploadStatus('idle');
      }
    });
  }, [existingData, onUpload]);

  const handleConfirmUpload = () => {
    if (previewData && previewData.newRecords > 0) {
      // Re-parse to get full data
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (input?.files?.[0]) {
        Papa.parse(input.files[0], {
          header: true,
          complete: (results) => {
            const existingIds = new Set(existingData.map(item => item.stripeUserId));
            const newRecords = results.data
              .map((row: any) => parseCSVData(row))
              .filter((record: ChurnRecord) => 
                record.stripeUserId && 
                record.email && 
                !existingIds.has(record.stripeUserId)
              );
            
            onUpload(newRecords, previewData);
            setUploadStatus('complete');
            setTimeout(() => {
              setUploadStatus('idle');
              setFileName('');
              setPreviewData(null);
            }, 3000);
          }
        });
      }
    }
  };

  const handleCancelUpload = () => {
    setUploadStatus('idle');
    setFileName('');
    setPreviewData(null);
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === 'text/csv') {
      processFile(files[0]);
    } else {
      alert('Please upload a CSV file');
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0].type === 'text/csv') {
      processFile(files[0]);
    } else {
      alert('Please upload a CSV file');
    }
  };

  if (uploadStatus === 'preview' && previewData) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Upload Preview</h3>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm">
              Found {previewData.newRecords + previewData.duplicates} total records in file
            </span>
          </div>
          
          {previewData.newRecords > 0 && (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-700">
                {previewData.newRecords} new unique records will be added
              </span>
            </div>
          )}
          
          {previewData.duplicates > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-700">
                {previewData.duplicates} duplicate records will be skipped
              </span>
            </div>
          )}
          
          {previewData.errors > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700">
                {previewData.errors} records have errors and will be skipped
              </span>
            </div>
          )}
        </div>

        {previewData.duplicates > 0 && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleConfirmUpload}
              disabled={previewData.newRecords === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add {previewData.newRecords} New Records
            </button>
            <button
              onClick={handleCancelUpload}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      } ${uploadStatus !== 'idle' ? 'pointer-events-none' : ''}`}
    >
      <input
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={uploadStatus !== 'idle'}
      />
      
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {uploadStatus === 'processing' ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
            <p className="text-sm text-gray-700">Processing {fileName}...</p>
          </>
        ) : uploadStatus === 'complete' ? (
          <>
            <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-700">Upload complete!</p>
          </>
        ) : fileName ? (
          <>
            <FileText className="w-8 h-8 text-green-500 mb-2" />
            <p className="text-sm text-gray-700">Ready: {fileName}</p>
          </>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Drop CSV file here or click to upload</p>
            <p className="text-xs text-gray-500 mt-1">Required columns: Email, Stripe User ID, Plans, etc.</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;