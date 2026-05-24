import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/PublicLayout';
import { RoleLayout } from './components/RoleLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './admin/Dashboard';
import { UserManagement } from './admin/UserManagement';
import { EditUser } from './admin/EditUser';
import { AppointmentManagement } from './admin/AppointmentManagement';
import { PaymentVerification } from './admin/PaymentVerification';
import { FinancialReports } from './admin/FinancialReports';
import { Analytics } from './admin/Analytics';
import { DoctorDashboard } from './doctor/Dashboard';
import { DoctorAppointments } from './doctor/Appointments';
import { PatientRecords } from './doctor/PatientRecords';
import { TreatmentPlans } from './doctor/TreatmentPlans';
import { Prescriptions } from './doctor/Prescriptions';
import { DoctorSchedule } from './doctor/Schedule';
import { PatientDashboard } from './patient/Dashboard';
import { PatientAppointments } from './patient/Appointments';
import { MedicalHistory } from './patient/MedicalHistory';
import { Treatments } from './patient/Treatments';
import { Payments } from './patient/Payments';
import { Profile } from './patient/Profile';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      <Route element={<RoleLayout />}>
        <Route path="admin" element={<ProtectedRoute role="admin"><Navigate to="/admin/dashboard" replace /></ProtectedRoute>} />
        <Route path="admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="admin/users" element={<ProtectedRoute role="admin"><UserManagement /></ProtectedRoute>} />
        <Route path="admin/users/:id/edit" element={<ProtectedRoute role="admin"><EditUser /></ProtectedRoute>} />
        <Route path="admin/appointments" element={<ProtectedRoute role="admin"><AppointmentManagement /></ProtectedRoute>} />
        <Route path="admin/payments" element={<ProtectedRoute role="admin"><PaymentVerification /></ProtectedRoute>} />
        <Route path="admin/reports" element={<ProtectedRoute role="admin"><FinancialReports /></ProtectedRoute>} />
        <Route path="admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />

        <Route path="doctor" element={<ProtectedRoute role="doctor"><Navigate to="/doctor/dashboard" replace /></ProtectedRoute>} />
        <Route path="doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
        <Route path="doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
        <Route path="doctor/patient-records" element={<ProtectedRoute role="doctor"><PatientRecords /></ProtectedRoute>} />
        <Route path="doctor/treatment-plans" element={<ProtectedRoute role="doctor"><TreatmentPlans /></ProtectedRoute>} />
        <Route path="doctor/prescriptions" element={<ProtectedRoute role="doctor"><Prescriptions /></ProtectedRoute>} />
        <Route path="doctor/schedule" element={<ProtectedRoute role="doctor"><DoctorSchedule /></ProtectedRoute>} />

        <Route path="patient" element={<ProtectedRoute role="patient"><Navigate to="/patient/dashboard" replace /></ProtectedRoute>} />
        <Route path="patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
        <Route path="patient/appointments" element={<ProtectedRoute role="patient"><PatientAppointments /></ProtectedRoute>} />
        <Route path="patient/medical-history" element={<ProtectedRoute role="patient"><MedicalHistory /></ProtectedRoute>} />
        <Route path="patient/treatments" element={<ProtectedRoute role="patient"><Treatments /></ProtectedRoute>} />
        <Route path="patient/payments" element={<ProtectedRoute role="patient"><Payments /></ProtectedRoute>} />
        <Route path="patient/profile" element={<ProtectedRoute role="patient"><Profile /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
