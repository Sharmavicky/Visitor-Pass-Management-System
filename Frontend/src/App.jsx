import { Routes, Route, Navigate } from 'react-router-dom';

// Importing page components
import Login from './Components/pages/Login';
import Unauthorized from "./Components/pages/Unauthorized";
import Register from './Components/pages/Register';
import ProtectedRoute from './Components/ProtectedRoute';
import NotFound from './Components/pages/NotFound';

// Placeholder dashboards (we'll build these properly in Phase 4)
const Dashboard = ({ role }) => (
    <div className="p-8 text-xl font-bold text-slate-700">
        {role} Dashboard — Phase 4 coming soon!
    </div>
);

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/employee/dashboard" element={
                <ProtectedRoute roles={['employee']}>
                    <Dashboard role="Employee" />
                </ProtectedRoute>
            } />

            <Route path="/security/dashboard" element={
                <ProtectedRoute roles={['security', 'admin']}>
                    <Dashboard role="Security" />
                </ProtectedRoute>
            } />

            <Route path="/admin/dashboard" element={
                <ProtectedRoute roles={['admin']}>
                    <Dashboard role="Admin" />
                </ProtectedRoute>
            } />

            <Route path="/visitor/dashboard" element={
                <ProtectedRoute roles={['visitor']}>
                    <Dashboard role="Visitor" />
                </ProtectedRoute>
            } />

            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}