import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  PictureAsPdf,
  CheckCircle,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { apiService } from '../../services/api';
import { Receipt } from '../../types/receipt';

interface ReceiptUploadProps {
  onUploadSuccess?: (receipt: Receipt) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
}

const ReceiptUpload: React.FC<ReceiptUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  maxFiles = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError(null);
      setSuccess(null);

      if (acceptedFiles.length === 0) {
        setError('No valid files selected. Please select JPG, PNG, or PDF files.');
        return;
      }

      if (acceptedFiles.length > maxFiles) {
        setError(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      // Validate file types
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
      const invalidFiles = acceptedFiles.filter(
        (file) => !validTypes.includes(file.type.toLowerCase())
      );

      if (invalidFiles.length > 0) {
        setError('Invalid file type. Only JPG, PNG, WEBP, and PDF files are allowed.');
        return;
      }

      // Validate file sizes (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = acceptedFiles.filter((file) => file.size > maxSize);

      if (oversizedFiles.length > 0) {
        setError('Some files exceed the maximum size of 10MB.');
        return;
      }

      setUploadedFiles(acceptedFiles);
      setUploading(true);
      setUploadProgress(0);

      try {
        let completedFiles = 0;
        const uploadPromises = acceptedFiles.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);

          // Upload file
          const response = await apiService.post<{ success: boolean; data: Receipt; message: string }>(
            '/Receipts/upload',
            formData
          );

          completedFiles++;
          const overallProgress = (completedFiles / acceptedFiles.length) * 100;
          setUploadProgress(Math.min(overallProgress, 100));

          if (response.data && (response.data as any).success && (response.data as any).data) {
            const receiptData = (response.data as any).data;
            if (onUploadSuccess) {
              onUploadSuccess(receiptData);
            }
            return receiptData;
          } else {
            throw new Error((response.data as any)?.message || 'Upload failed');
          }
        });

        await Promise.all(uploadPromises);
        setSuccess(`Successfully uploaded ${acceptedFiles.length} receipt(s). OCR processing will begin automatically.`);
        setUploadedFiles([]);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.errorData?.message || err.message || 'Failed to upload receipt(s)';
        setError(errorMessage);
        if (onUploadError) {
          onUploadError(errorMessage);
        }
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    },
    [maxFiles, onUploadSuccess, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxFiles,
    disabled: uploading,
  });

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const getFileIcon = (file: File) => {
    if (file.type.includes('pdf')) {
      return <PictureAsPdf />;
    }
    return <ImageIcon />;
  };

  return (
    <Box>
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: uploading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: uploading ? 'grey.300' : 'primary.main',
            backgroundColor: uploading ? 'background.paper' : 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <Box sx={{ textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            {isDragActive ? 'Drop files here' : 'Upload Receipt'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Drag and drop receipt images or PDFs here, or click to select files
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Supported formats: JPG, PNG, WEBP, PDF (Max 10MB per file)
          </Typography>
        </Box>
      </Paper>

      {uploading && (
        <Box sx={{ mt: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {uploadedFiles.length > 0 && !uploading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Selected Files:
          </Typography>
          {uploadedFiles.map((file, index) => (
            <Paper key={index} sx={{ p: 1, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              {getFileIcon(file)}
              <Typography variant="body2" sx={{ flex: 1 }}>
                {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </Typography>
              <IconButton size="small" onClick={() => handleRemoveFile(index)}>
                <Delete />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mt: 2 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
    </Box>
  );
};

export default ReceiptUpload;

