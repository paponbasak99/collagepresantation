import { Router } from 'express';
import {
  getDashboardStats,
  getChartData,
  getPendingDoctors,
  verifyDoctorBmdc,
  approveDoctor,
  suspendDoctor,
  exportCSV,
  getAuditLogs,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  createHospital,
  updateHospital,
  deleteHospital,
  getUsersList,
  toggleUserStatus
} from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('admin'));

// Analytics & Dashboard
router.get('/dashboard', getDashboardStats);
router.get('/charts', getChartData);
router.get('/export/:entity', exportCSV);
router.get('/audit-logs', getAuditLogs);

// Doctor verification
router.get('/doctors/pending', getPendingDoctors);
router.get('/doctors/:id/bmdc-verify', verifyDoctorBmdc);
router.put('/doctors/:id/approve', approveDoctor);
router.put('/doctors/:id/suspend', suspendDoctor);

// Specialty CRUD
router.post('/specialties', createSpecialty);
router.put('/specialties/:id', updateSpecialty);
router.delete('/specialties/:id', deleteSpecialty);

// Hospital CRUD
router.post('/hospitals', createHospital);
router.put('/hospitals/:id', updateHospital);
router.delete('/hospitals/:id', deleteHospital);

// User Management
router.get('/users', getUsersList);
router.put('/users/:id/toggle-status', toggleUserStatus);

export default router;
