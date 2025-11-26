import Attendance from "./attendance/attendance.jsx";
import ProtectedRoute from "../../components/ProtectedRoute.jsx";
import Employee from "./employee/employee.jsx";
import Payroll from "./payroll/payroll.jsx";
import CreateEmployee from "./employee/createEmployee.jsx";
import EditEmployee from "./employee/editEmployee.jsx";
import ViewEmployee from "./employee/viewEmployee.jsx";
import CreateDailyAttendance from "./attendance/createAttendance.jsx";
import PayrollEmployeeView from "./payroll/payrollEmployeeView.jsx";
import AttendanceEmployeeView from "./attendance/attendanceEmployeeView.jsx";
import HolidayPage from "./holiday/holidayPage.jsx";
import MonthlyAdjustments from "./monthly-adjustment/monthlyAdjustment.jsx";


export const workforceRoutes = [
    {
        path: "/workforce/employee",
        element: (
            <ProtectedRoute>
                <Employee />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/employee/create",
        element: (
            <ProtectedRoute>
                <CreateEmployee />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/employee/:id/edit",
        element: (
            <ProtectedRoute>
                <EditEmployee />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/employee/:id/view",
        element: ( 
            <ProtectedRoute>
                <ViewEmployee />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/attendance",
        element: (
            <ProtectedRoute>
                <Attendance />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/attendance/create",
        element: (
            <ProtectedRoute>
                <CreateDailyAttendance />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/attendance/employee/:id",
        element: (
            <ProtectedRoute>
                <AttendanceEmployeeView />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/monthly-adjustment",
        element: (
            <ProtectedRoute>
                <MonthlyAdjustments />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/payroll",
        element: (
            <ProtectedRoute>
                <Payroll />
            </ProtectedRoute>
        )
    },
    {
        path: "/workforce/payroll/employee/:id",
        element: (
            <ProtectedRoute>
                <PayrollEmployeeView />
            </ProtectedRoute>
        )
    },
    {
        path: "/calendar",
        element: (
            <ProtectedRoute>
                <HolidayPage />
            </ProtectedRoute>
        )
    }
]