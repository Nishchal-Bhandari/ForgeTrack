import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ChevronLeft,
  X,
  Database,
  Columns
} from 'lucide-react';
import { clsx } from 'clsx';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StepIndicator from '../../components/ui/StepIndicator';
import ProgressBar from '../../components/ui/ProgressBar';

export const CsvUpload = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);

  const steps = ['Upload CSV', 'Map Columns', 'Validate Data', 'Import'];

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setCurrentStep(1);
    } else {
      alert('Please upload a .csv file');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="animate-fade-in space-y-6">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={clsx(
                'min-h-[300px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer group',
                isDragging 
                  ? 'border-accent bg-accent/10' 
                  : 'border-border-default bg-surface/30 hover:border-border-strong hover:bg-surface/50'
              )}
              onClick={() => document.getElementById('csv-upload').click()}
            >
              <input 
                id="csv-upload" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={(e) => {
                  const f = e.target.files[0];
                  if (f) {
                    setFile(f);
                    setCurrentStep(1);
                  }
                }}
              />
              
              <div className={clsx(
                'w-16 h-16 bg-surface-inset rounded-2xl flex items-center justify-center text-fg-tertiary transition-all duration-300 group-hover:scale-110 group-hover:text-accent shadow-inner',
                isDragging && 'scale-110 text-accent'
              )}>
                <Upload size={32} strokeWidth={1.5} />
              </div>
              
              <div className="text-center">
                <p className="text-lg font-semibold text-fg-primary">
                  {isDragging ? 'Drop it here!' : 'Drop your CSV here'}
                </p>
                <p className="text-sm text-fg-tertiary mt-1">
                  or <span className="text-accent underline">click to browse</span>
                </p>
              </div>
              
              <p className="text-[10px] font-bold text-fg-tertiary uppercase tracking-widest mt-4">
                .csv files only, max 10MB
              </p>
            </div>
            
            <div className="bg-surface-inset border border-border-subtle p-6 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-fg-secondary uppercase tracking-[0.1em] flex items-center gap-2">
                <AlertCircle size={14} />
                Required Columns
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Name', 'USN', 'Branch', 'Batch'].map(col => (
                  <span key={col} className="bg-surface-raised px-2.5 py-1 rounded-md text-[10px] font-mono text-fg-primary border border-border-subtle">
                    {col}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="flex flex-col">
              <h4 className="text-xs font-bold text-fg-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={14} />
                Source Preview: <span className="text-fg-tertiary">{file?.name}</span>
              </h4>
              <div className="bg-surface-inset rounded-lg overflow-x-auto border border-border-subtle">
                <table className="w-full text-left text-[11px] font-mono">
                  <thead>
                    <tr className="border-b border-border-subtle bg-surface-raised">
                      <th className="px-4 py-2 text-fg-tertiary uppercase">Row</th>
                      <th className="px-4 py-2 text-fg-tertiary">Col 1</th>
                      <th className="px-4 py-2 text-fg-tertiary">Col 2</th>
                      <th className="px-4 py-2 text-fg-tertiary">Col 3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {[1, 2, 3].map(r => (
                      <tr key={r}>
                        <td className="px-4 py-2 text-fg-tertiary bg-surface/30">{r}</td>
                        <td className="px-4 py-2 text-fg-secondary">Data {r}.1</td>
                        <td className="px-4 py-2 text-fg-secondary">Data {r}.2</td>
                        <td className="px-4 py-2 text-fg-secondary">Data {r}.3</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 rounded-lg bg-info/5 border border-info/20 flex gap-3">
                <AlertCircle size={18} className="text-info shrink-0" />
                <p className="text-xs text-fg-secondary leading-normal">
                  Make sure to map your CSV columns to the corresponding ForgeTrack fields correctly.
                </p>
              </div>
            </Card>

            <Card className="flex flex-col">
              <h4 className="text-xs font-bold text-fg-secondary uppercase tracking-widest mb-6 flex items-center gap-2">
                <Columns size={14} />
                Map Fields
              </h4>
              <div className="space-y-4">
                {['Full Name', 'USN / ID', 'Branch', 'Batch'].map(field => (
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-fg-secondary">{field}</label>
                    <select className="bg-surface-inset border border-border-default rounded-md px-4 py-2 text-sm text-fg-primary outline-none focus:border-accent">
                      <option>Select Column...</option>
                      <option>Column 1</option>
                      <option>Column 2</option>
                      <option>IGNORE</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-8 flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setCurrentStep(0)}>Back</Button>
                <Button variant="primary" onClick={() => setCurrentStep(2)}>
                  Validate Data
                  <ArrowRight size={18} />
                </Button>
              </div>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="animate-fade-in space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="flex items-center gap-4 py-4 px-6 border-success/20">
                <div className="p-2 bg-success/10 rounded-lg text-success">
                  <CheckCircle size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-fg-primary tabular-nums">22</p>
                  <p className="text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Ready</p>
                </div>
              </Card>
              <Card className="flex items-center gap-4 py-4 px-6 border-warning/20">
                <div className="p-2 bg-warning/10 rounded-lg text-warning">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-fg-primary tabular-nums">2</p>
                  <p className="text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Warnings</p>
                </div>
              </Card>
              <Card className="flex items-center gap-4 py-4 px-6 border-danger/20">
                <div className="p-2 bg-danger/10 rounded-lg text-danger">
                  <X size={20} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-fg-primary tabular-nums">1</p>
                  <p className="text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Errors</p>
                </div>
              </Card>
            </div>

            <Card className="!p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-inset">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Row</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Message</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {[
                      { row: 1, status: 'success', msg: 'Valid record' },
                      { row: 2, status: 'warning', msg: 'Batch year might be incorrect' },
                      { row: 3, status: 'danger', msg: 'USN already exists in database' },
                    ].map(item => (
                      <tr key={item.row} className="hover:bg-surface-raised/50">
                        <td className="px-6 py-4 text-sm font-mono text-fg-secondary">{item.row}</td>
                        <td className="px-6 py-4">
                          <div className={clsx(
                            "w-2 h-2 rounded-full",
                            item.status === 'success' ? "bg-success" : item.status === 'warning' ? "bg-warning" : "bg-danger"
                          )} />
                        </td>
                        <td className={clsx(
                          "px-6 py-4 text-sm",
                          item.status === 'success' ? "text-fg-secondary" : item.status === 'warning' ? "text-warning" : "text-danger"
                        )}>
                          {item.msg}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setCurrentStep(1)}>
                <ChevronLeft size={18} />
                Back to Mapping
              </Button>
              <Button variant="primary" onClick={() => {
                setCurrentStep(3);
                // Simulate import process
              }}>
                Confirm & Import
                <Database size={18} />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-fade-in flex flex-col items-center justify-center py-12">
            <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center text-success mb-6 animate-pulse border border-success/20">
              <CheckCircle size={48} strokeWidth={1.5} />
            </div>
            
            <h3 className="text-3xl font-display font-bold text-fg-primary mb-2">Import Successful!</h3>
            <p className="text-fg-secondary mb-8 text-center max-w-sm">
              We've successfully imported <span className="text-fg-primary font-bold">24 students</span> into your cohort.
            </p>

            <Card className="w-full max-w-md bg-surface-inset border-success/20">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-fg-secondary">Import Duration</span>
                  <span className="font-mono text-fg-primary">1.2s</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-fg-secondary">Records Processed</span>
                  <span className="font-mono text-fg-primary">25</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-fg-secondary">Failed Records</span>
                  <span className="font-mono text-danger">1</span>
                </div>
              </div>
            </Card>

            <div className="mt-10 flex gap-4">
              <Button variant="secondary" onClick={() => {
                setFile(null);
                setCurrentStep(0);
              }}>
                Upload Another
              </Button>
              <Button variant="primary" onClick={() => window.location.href = '/mentor/students'}>
                View Student List
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <section className="text-center">
        <h2 className="font-display text-4xl font-bold text-fg-primary">Import Cohort</h2>
        <p className="text-fg-secondary text-sm mt-2">Bulk upload student data via CSV to quickly set up your tracker.</p>
      </section>

      <StepIndicator steps={steps} currentStep={currentStep} />

      <div className="pt-8">
        {renderStep()}
      </div>
    </div>
  );
};

export default CsvUpload;
