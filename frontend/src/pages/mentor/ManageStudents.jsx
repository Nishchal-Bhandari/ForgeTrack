import { useState, useEffect } from 'react';
import { Plus, Search, Download, Trash2, Edit2, Users, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { AddStudentModal } from '../../components/ui/AddStudentModal';
import { useAuth } from '../../context/AuthContext';
import { getStudents, removeStudent } from '../../lib/api';
import toast from 'react-hot-toast';

export function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 15;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data.students || []);
    } catch (err) {
      toast.error('Failed to load students: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (student) =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const toastId = toast.loading('Removing student...');
    try {
      await removeStudent(deleteConfirm._id);
      setStudents((prev) => prev.filter((s) => s._id !== deleteConfirm._id));
      toast.success('Student removed successfully', { id: toastId });
      setDeleteConfirm(null);
    } catch (err) {
      toast.error(err.message, { id: toastId });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Full Name', 'USN', 'Email', 'Department', 'Phone', 'Batch Year', 'Attendance %'];
    const rows = students.map((s) => [
      s.fullName,
      s.usn,
      s.email,
      s.department,
      s.phone || '-',
      s.batchYear,
      s.attendancePercentage || 0,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `students-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Exported student list');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <section>
          <div className="flex items-center gap-3 text-accent mb-2">
            <Users size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Student Administration</span>
          </div>
          <h2 className="font-display text-4xl font-bold text-fg-primary tracking-tight">
            Registry <span className="text-fg-tertiary font-mono text-2xl font-normal ml-2">[{students.length}]</span>
          </h2>
        </section>

        <div className="flex gap-3 w-full lg:w-auto">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            className="flex-1 lg:flex-none"
          >
            <Download size={18} />
            Export Data
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 lg:flex-none shadow-lg shadow-accent/20"
          >
            <Plus size={20} />
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="!p-0 overflow-hidden border-border-subtle">
        {/* Toolbar */}
        <div className="p-6 border-b border-border-subtle bg-surface/30 backdrop-blur-md flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-tertiary" />
            <input
              type="text"
              placeholder="Search USN, Name, or Email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-surface-inset border border-border-default rounded-xl pl-12 pr-4 py-2.5 text-sm text-fg-primary focus:border-accent outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-fg-tertiary">
            <span>SHOWING {paginatedStudents.length} OF {filteredStudents.length} ENTRIES</span>
          </div>
        </div>

        {/* Table/Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <Loader2 className="animate-spin text-accent" size={40} />
              <p className="text-sm font-medium text-fg-tertiary animate-pulse">Synchronizing database...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-center p-8">
              <div className="w-16 h-16 rounded-full bg-surface-raised flex items-center justify-center mb-6 text-fg-tertiary opacity-40">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold text-fg-primary mb-2">No Students Registered</h3>
              <p className="text-sm text-fg-tertiary max-w-sm mb-8">
                Your registry is currently empty. Start by enrolling a student manually or use the CSV import tool.
              </p>
              <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
                Enroll Your First Student
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-raised/50 border-b border-border-subtle">
                    <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Student Identity</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Department</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Batch</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Attendance</th>
                    <th className="px-8 py-4 text-right text-[10px] font-bold text-fg-tertiary uppercase tracking-widest">Operations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {paginatedStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-surface-raised/50 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-sm">
                            {student.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-fg-primary">{student.fullName}</span>
                            <span className="text-[11px] font-mono text-fg-tertiary uppercase tracking-wider">{student.usn}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-fg-secondary bg-surface-raised px-2 py-1 rounded border border-border-subtle">
                          {student.department}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-sm text-fg-secondary font-mono">
                        {student.batchYear}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col gap-1.5 w-32">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold text-fg-tertiary">{student.attendancePercentage || 0}%</span>
                          </div>
                          <div className="h-1 w-full bg-surface-inset rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent transition-all duration-1000" 
                              style={{ width: `${student.attendancePercentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex gap-2 justify-end">
                          <button className="p-2 hover:bg-accent/10 text-fg-tertiary hover:text-accent rounded-lg transition-all" title="Edit Profile">
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => setDeleteConfirm(student)}
                            className="p-2 hover:bg-danger/10 text-fg-tertiary hover:text-danger rounded-lg transition-all" 
                            title="Remove Student"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer with Pagination */}
        {totalPages > 1 && (
          <div className="p-6 border-t border-border-subtle bg-surface/30 flex items-center justify-between">
            <p className="text-xs text-fg-tertiary font-medium">
              PAGE {currentPage} OF {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setDeleteConfirm(null)} />
          <Card className="relative w-full max-w-sm border-danger/30 shadow-2xl shadow-danger/10 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 rounded-full bg-danger/10 flex items-center justify-center mb-6 text-danger">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-fg-primary mb-2">Remove Student?</h3>
              <p className="text-sm text-fg-tertiary leading-relaxed mb-8">
                Are you sure you want to remove <span className="text-fg-primary font-semibold">{deleteConfirm.fullName}</span>? This will permanently delete their attendance history.
              </p>
              <div className="flex gap-3 w-full">
                <Button variant="secondary" className="flex-1" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button variant="primary" className="flex-1 bg-danger hover:bg-danger/90 border-danger" onClick={handleDelete}>Delete</Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchStudents}
      />
    </div>
  );
}
