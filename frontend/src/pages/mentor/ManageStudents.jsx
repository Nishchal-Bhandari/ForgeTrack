import { useState, useEffect } from 'react';
import { Plus, Search, Download, Trash2, Edit2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { AddStudentModal } from '../../components/ui/AddStudentModal';
import { useAuth } from '../../context/AuthContext';
import { showToast } from '../../utils/cursorAnimation';
import { getStudents, removeStudent } from '../../lib/api';

export function ManageStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStudents();
      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
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

  const handleDeleteClick = (student) => {
    setDeleteConfirm(student);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      await removeStudent(deleteConfirm._id);
      setStudents((prev) => prev.filter((s) => s._id !== deleteConfirm._id));
      showToast('Student removed successfully', 'success');
      setDeleteConfirm(null);
    } catch (err) {
      showToast(err.message, 'error');
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
    a.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-fg-primary tracking-tight">
          Manage Students
        </h2>
        <p className="text-fg-tertiary text-sm font-medium">
          Add, edit, and manage your students
        </p>
      </section>

      {/* Header with Actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-64">
          <Search size={20} style={{ color: 'var(--text-secondary)' }} />
          <input
            type="text"
            placeholder="Search by name, USN, or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-3 py-2 rounded-lg border bg-transparent"
            style={{
              borderColor: 'rgba(255,255,255,0.1)',
              color: 'var(--text-primary)',
            }}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download size={16} />
            Export CSV
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2"
          >
            <Plus size={16} />
            Add Student
          </Button>
        </div>
      </div>

      {/* Students Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p style={{ color: 'var(--text-secondary)' }}>Loading students...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <p style={{ color: '#F43F5E' }}>{error}</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p style={{ color: 'var(--text-secondary)' }}>No students added yet</p>
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus size={16} />
              Add Your First Student
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Name
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    USN
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Department
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Batch
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Email
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Attendance
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student, idx) => (
                  <tr
                    key={student._id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(108,99,255,0.02)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                          style={{
                            backgroundColor: 'var(--accent-primary)',
                            color: 'white',
                          }}
                        >
                          {student.fullName.charAt(0)}
                        </div>
                        <span style={{ color: 'var(--text-primary)' }}>{student.fullName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                      {student.usn}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {student.department}
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                      {student.batchYear}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                      {student.email}
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="px-2 py-1 rounded text-sm font-medium inline-block"
                        style={{
                          backgroundColor: 'rgba(0,212,170,0.1)',
                          color: '#00D4AA',
                        }}
                      >
                        {student.attendancePercentage || 0}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          className="p-1 hover:opacity-80 transition"
                          style={{ color: 'var(--accent-secondary)' }}
                          title="Edit student"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student)}
                          className="p-1 hover:opacity-80 transition"
                          style={{ color: '#F43F5E' }}
                          title="Delete student"
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

        {/* Pagination */}
        {filteredStudents.length > itemsPerPage && (
          <div className="flex items-center justify-center gap-2 pt-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded text-sm disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(108,99,255,0.1)',
                color: 'var(--accent-primary)',
              }}
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-2 py-1 rounded text-sm ${
                  currentPage === page ? 'font-medium' : ''
                }`}
                style={{
                  backgroundColor: currentPage === page ? 'var(--accent-primary)' : 'rgba(108,99,255,0.1)',
                  color: currentPage === page ? 'white' : 'var(--accent-primary)',
                }}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded text-sm disabled:opacity-50"
              style={{
                backgroundColor: 'rgba(108,99,255,0.1)',
                color: 'var(--accent-primary)',
              }}
            >
              Next
            </button>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <Card
            onClick={(e) => e.stopPropagation()}
            className="max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Remove Student?
            </h3>
            <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
              Are you sure you want to remove <strong>{deleteConfirm.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                className="flex-1"
                style={{ backgroundColor: '#F43F5E' }}
              >
                Remove
              </Button>
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
