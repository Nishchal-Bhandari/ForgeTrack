import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { Modal } from './Modal';
import { addStudent } from '../../lib/api';
import { showToast } from '../../utils/cursorAnimation';

export function AddStudentModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '',
    usn: '',
    email: '',
    department: 'CS',
    phone: '',
    batchYear: new Date().getFullYear(),
    username: '',
    password: '',
    confirmPassword: '',
  });

  const departments = ['CS', 'AI', 'IS', 'ECE', 'ME', 'CE'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  const validate = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.usn.trim()) errors.usn = 'USN is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.department) errors.department = 'Department is required';
    if (!formData.batchYear) errors.batchYear = 'Batch year is required';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      await addStudent({
        fullName: formData.fullName,
        usn: formData.usn,
        email: formData.email,
        department: formData.department,
        phone: formData.phone || null,
        batchYear: parseInt(formData.batchYear),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      showToast('Student added successfully', 'success');

      // Reset form
      setFormData({
        fullName: '',
        usn: '',
        email: '',
        department: 'CS',
        phone: '',
        batchYear: new Date().getFullYear(),
        password: '',
        confirmPassword: '',
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      if (err.message.includes('field')) {
        const match = err.message.match(/field: (\w+)/);
        if (match) {
          setFieldErrors((prev) => ({
            ...prev,
            [match[1]]: err.message,
          }));
        }
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Add New Student
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-opacity-10 rounded"
            style={{ color: 'var(--text-secondary)' }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg flex gap-2 items-start" style={{
            backgroundColor: 'rgba(244, 63, 94, 0.1)',
            borderColor: 'rgba(244, 63, 94, 0.3)',
            border: '1px solid',
          }}>
            <AlertCircle size={18} style={{ color: '#F43F5E', marginTop: '2px', flexShrink: 0 }} />
            <p className="text-sm" style={{ color: '#F43F5E' }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            error={fieldErrors.fullName}
            placeholder="e.g., John Doe"
          />

          <Input
            label="USN"
            name="usn"
            value={formData.usn}
            onChange={handleChange}
            error={fieldErrors.usn}
            placeholder="e.g., 4SH24CS001"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={fieldErrors.email}
            placeholder="e.g., student@forge.local"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg border"
                style={{
                  backgroundColor: '#1A1A25',
                  borderColor: 'rgba(255,255,255,0.08)',
                  color: 'var(--text-primary)',
                }}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Batch Year"
              name="batchYear"
              type="number"
              value={formData.batchYear}
              onChange={handleChange}
              error={fieldErrors.batchYear}
            />
          </div>

          <Input
            label="Phone (Optional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g., 9876543210"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={fieldErrors.password}
            placeholder="Min 6 characters"
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={fieldErrors.confirmPassword}
            placeholder="Re-enter password"
          />

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={loading}
            >
              Add Student
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
