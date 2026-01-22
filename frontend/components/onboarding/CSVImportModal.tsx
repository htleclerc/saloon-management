"use client";

import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle, CheckCircle2 } from 'lucide-react';
import { parseCSVFile, downloadCSV } from '@/lib/utils/csvParser';
import type { CSVImportResult } from '@/types';

interface CSVImportModalProps<T> {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: T[]) => void;
    validator: (row: Record<string, string>, rowIndex: number) => { isValid: boolean; data?: T; error?: string };
    templateContent: string;
    templateFileName: string;
    title: string;
    description?: string;
}

export default function CSVImportModal<T>({
    isOpen,
    onClose,
    onImport,
    validator,
    templateContent,
    templateFileName,
    title,
    description,
}: CSVImportModalProps<T>) {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState<CSVImportResult<T> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (selectedFile: File) => {
        if (!selectedFile.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        setFile(selectedFile);
        setIsProcessing(true);

        try {
            const parseResult = await parseCSVFile(selectedFile, validator);
            setResult(parseResult);
        } catch (error) {
            console.error('Error parsing CSV:', error);
            alert('Failed to parse CSV file');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDownloadTemplate = () => {
        downloadCSV(templateContent, templateFileName);
    };

    const handleImport = () => {
        if (result && result.data.length > 0) {
            onImport(result.data);
            handleClose();
        }
    };

    const handleClose = () => {
        setFile(null);
        setResult(null);
        setIsProcessing(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>
                    {description && <p className="text-sm text-gray-600">{description}</p>}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Download template */}
                    <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl border border-purple-100">
                        <div>
                            <p className="font-bold text-gray-900">Télécharger le modèle CSV</p>
                            <p className="text-sm text-gray-600">Utilisez ce fichier comme exemple</p>
                        </div>
                        <button
                            onClick={handleDownloadTemplate}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span className="font-medium">Télécharger</span>
                        </button>
                    </div>

                    {/* File upload */}
                    <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'
                            }`}
                    >
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-700 font-medium mb-2">
                            Glissez-déposez votre fichier CSV ici
                        </p>
                        <p className="text-sm text-gray-500 mb-4">ou</p>
                        <label className="cursor-pointer inline-block px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white rounded-xl font-bold hover:scale-[1.02] transition-transform">
                            Parcourir les fichiers
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileInput}
                                className="hidden"
                            />
                        </label>
                        {file && (
                            <p className="mt-4 text-sm text-gray-600">
                                Fichier sélectionné: <span className="font-bold">{file.name}</span>
                            </p>
                        )}
                    </div>

                    {/* Processing */}
                    {isProcessing && (
                        <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto mb-2"></div>
                            <p className="text-gray-600">Traitement du fichier...</p>
                        </div>
                    )}

                    {/* Results */}
                    {result && !isProcessing && (
                        <div className="space-y-4">
                            {/* Success count */}
                            {result.validCount > 0 && (
                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-bold text-green-900">
                                            {result.validCount} élément(s) valide(s)
                                        </p>
                                        <p className="text-sm text-green-700">Prêt à importer</p>
                                    </div>
                                </div>
                            )}

                            {/* Errors */}
                            {result.errorCount > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                        <div>
                                            <p className="font-bold text-red-900">
                                                {result.errorCount} erreur(s) trouvée(s)
                                            </p>
                                            <p className="text-sm text-red-700">
                                                Ces lignes seront ignorées
                                            </p>
                                        </div>
                                    </div>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {result.errors.map((error, index) => (
                                            <div
                                                key={index}
                                                className="text-sm p-2 bg-red-50 rounded-lg border border-red-100"
                                            >
                                                <span className="font-bold text-red-900">Ligne {error.row}:</span>{' '}
                                                <span className="text-red-700">{error.error}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={handleClose}
                        className="flex-1 py-3 px-6 border-2 border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={!result || result.validCount === 0}
                        className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${result && result.validCount > 0
                                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] text-white hover:scale-[1.02] shadow-lg'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Importer {result && result.validCount > 0 ? `(${result.validCount})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
}
