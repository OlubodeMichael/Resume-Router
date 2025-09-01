"use client";

import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import { useResume } from "@/context/resumeProvider";

export default function ResumeForm() {
  const { parseResume, isLoading, error, parsedResume, clearError } = useResume();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  console.log(parsedResume);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a PDF or DOCX file');
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    clearError();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (selectedFile) {
      await parseResume(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    clearError();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension === 'pdf' ? '📄' : '📝';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload Your Resume</h3>
        <p className="text-slate-600 text-sm">
          Upload your resume in PDF or DOCX format to extract your information
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <div>
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">
              Drag and drop your resume here, or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-slate-500">
              Supports PDF and DOCX files up to 10MB
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-4">
            <div className="text-2xl">{getFileIcon(selectedFile.name)}</div>
            <div className="text-left">
              <p className="font-medium text-slate-900">{selectedFile.name}</p>
              <p className="text-sm text-slate-500">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 text-slate-400 hover:text-red-500 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {parsedResume && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <p className="text-green-700 text-sm">
            Resume parsed successfully! Found information for {parsedResume.fullName || 'Unknown'}
          </p>
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && !isLoading && (
        <div className="mt-6">
          <button
            onClick={handleUpload}
            disabled={!selectedFile}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Upload className="w-5 h-5" />
            <span>Parse Resume</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mt-6">
          <div className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Processing your resume...</span>
          </div>
        </div>
      )}
    </div>
  );
}