import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { createAlert, errorAlert } from "@/src/lib/alert";
import axiosInstance from "@/src/services/axiosInstance";
import { LogOut, Building2, Mail, Phone, Globe, ShieldCheck, KeyRound, Timer, MapPin, User, Bell, Settings } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    
    // State for Profile Update Flow
    const [step, setStep] = useState(1); // 1: Locked, 2: OTP Sent, 3: Unlocked (Edit)
    const [otp, setOtp] = useState("");
    const [timer, setTimer] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");

    // Logout Handler
    const handleLogout = async () => {
        try {
            await axiosInstance.post('/api/auth/logout');
            localStorage.removeItem('userInfo');
            navigate('/login');
        } catch (error) {
            console.error(error);
        }
    };

    // Step 1 -> 2: Send OTP
    const handleRequestOtp = async () => {
        setLoading(true);
        try {
            await axiosInstance.post('/api/auth/send-otp');
            setStep(2);
            setTimer(180); // 3 minutes
            createAlert("OTP Sent to Admin Email");
        } catch (err) {
            errorAlert("Failed to send OTP", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!otp) return errorAlert("Please enter the OTP");
        if (!newUsername && !newPassword) return errorAlert("Enter new details to update");

        setLoading(true);
        try {
            await axiosInstance.put('/api/auth/profile', {
                otp,
                newUsername: newUsername || undefined,
                newPassword: newPassword || undefined
            });
            createAlert("Credentials Updated Successfully!");
            // Reset state
            setStep(1);
            setOtp("");
            setNewUsername("");
            setNewPassword("");
        } catch (err) {
            errorAlert("Update Failed", err);
        } finally {
            setLoading(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Header Section - Fixed at top */}
            <div className="border-b px-6 py-4 flex justify-between items-center shadow-sm shrink-0">
                 <div>
                    <h1 className="text-2x2 font-bold text-gray-900">Company Profile</h1>
                    <p className="text-sm text-gray-500">System configuration and admin settings</p>
                </div>
                <Button variant="destructive" onClick={handleLogout} className="gap-2">
                    <LogOut className="h-4 w-4" /> Logout
                </Button>
            </div>

            {/* Scrollable Main Content Area */}
            <div className="flex-1 overflow-auto p-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    
                    {/* Welcome Banner */}
                    <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="h-6 w-6" /> Admin Dashboard
                            </h2>
                            <p className="text-blue-100 mt-1">
                                You are currently logged in as the System Administrator.
                            </p>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-lg text-sm backdrop-blur-sm border border-white/20 whitespace-nowrap">
                            Active Session
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* LEFT COLUMN: COMPANY INFO (Takes 2/3 width on large screens) */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="h-full shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" /> Go Packaging
                                    </CardTitle>
                                    <CardDescription>LCS Enterprises</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-2 bg-white rounded-md border shadow-sm"><MapPin className="h-4 w-4 text-blue-600"/></div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">Head Office</p>
                                                <p className="text-gray-500 mt-1">1522, Ketakellagaha Watta Road, Kottawa, Pannipitiya, Sri Lanka.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-2 bg-white rounded-md border shadow-sm"><Phone className="h-4 w-4 text-green-600"/></div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">Hotline</p>
                                                <p className="text-gray-500 mt-1">+94 (0)11 218-9691</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-2 bg-white rounded-md border shadow-sm"><Mail className="h-4 w-4 text-orange-600"/></div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">Email</p>
                                                <p className="text-gray-500 mt-1">hello@lcs-enterprises.com</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-2 bg-white rounded-md border shadow-sm"><Globe className="h-4 w-4 text-purple-600"/></div>
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">Website</p>
                                                <p className="text-gray-500 mt-1">www.lcs-enterprises.com.lk</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-gray-50/50 border-t p-4">
                                    <p className="text-xs text-gray-400 w-full text-center">
                                        To update organization details, please contact the developer team.
                                    </p>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* RIGHT COLUMN: SECURITY (Takes 1/3 width on large screens) */}
                        <div className="space-y-6">
                            <Card className="border-orange-200 bg-orange-50/30 h-full shadow-sm">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-800">
                                        <ShieldCheck className="h-5 w-5" /> Security Settings
                                    </CardTitle>
                                    <CardDescription>Update admin credentials securely.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {step === 1 ? (
                                        <div className="flex flex-col items-center justify-center min-h-[250px] text-center space-y-4">
                                            <div className="p-4 bg-white rounded-full shadow-md">
                                                <KeyRound className="h-8 w-8 text-orange-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-gray-900">Protected Area</h3>
                                                <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">
                                                    To change your username or password, we need to verify your identity via OTP.
                                                </p>
                                            </div>
                                            <Button onClick={handleRequestOtp} disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700 text-white mt-4">
                                                {loading ? "Sending..." : "Request OTP to Unlock"}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                            <div className="bg-blue-50 p-3 rounded-md text-blue-700 text-sm flex items-center gap-2 border border-blue-100">
                                                <Mail className="h-4 w-4" /> OTP sent to admin email.<br/>Expires in {formatTime(timer)}.
                                            </div>

                                            <div className="space-y-3">
                                                <div className="space-y-1">
                                                    <Label>New Username</Label>
                                                    <Input 
                                                        value={newUsername} 
                                                        onChange={(e) => setNewUsername(e.target.value)} 
                                                        placeholder="Leave empty to keep current"
                                                        className="bg-white"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label>New Password</Label>
                                                    <Input 
                                                        type="password"
                                                        value={newPassword} 
                                                        onChange={(e) => setNewPassword(e.target.value)} 
                                                        placeholder="Leave empty to keep current"
                                                        className="bg-white"
                                                    />
                                                </div>
                                                
                                                <div className="pt-2">
                                                    <Label className="text-orange-700 font-medium">Enter OTP Code</Label>
                                                    <Input 
                                                        value={otp} 
                                                        onChange={(e) => setOtp(e.target.value)} 
                                                        placeholder="000000"
                                                        className="bg-white text-center tracking-widest font-mono font-bold text-lg mt-1 h-12"
                                                        maxLength={6}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Cancel</Button>
                                                <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleUpdateProfile} disabled={loading}>
                                                    {loading ? "Updating..." : "Update"}
                                                </Button>
                                            </div>
                                            
                                            {timer === 0 && (
                                                <Button variant="link" onClick={handleRequestOtp} className="w-full text-xs text-gray-500 h-auto p-0">
                                                    Resend OTP
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    
                    {/* Footer / Extra Settings Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gray-50 border-dashed">
                             <CardContent className="p-6 flex items-center gap-4 text-gray-500">
                                <div className="p-3 bg-white rounded-full border shadow-sm">
                                    <Bell className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700">Notifications</h4>
                                    <p className="text-sm">Manage email alerts and system notifications.</p>
                                </div>
                                <Button variant="ghost" size="sm" className="ml-auto" disabled>Coming Soon</Button>
                             </CardContent>
                        </Card>
                         <Card className="bg-gray-50 border-dashed">
                             <CardContent className="p-6 flex items-center gap-4 text-gray-500">
                                <div className="p-3 bg-white rounded-full border shadow-sm">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700">Preferences</h4>
                                    <p className="text-sm">System-wide display and region settings.</p>
                                </div>
                                <Button variant="ghost" size="sm" className="ml-auto" disabled>Coming Soon</Button>
                             </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;