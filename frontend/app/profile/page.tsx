"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Folder, ListChecks, Clock, Loader2, CheckCircle, XCircle, PlayCircle, ArrowLeft } from "lucide-react";
import { Toaster } from "sonner";

const statCards = [
    {
        key: "totalProjects",
        label: "Toplam Proje",
        icon: <Folder className="h-6 w-6 text-blue-500" />, bg: "bg-blue-50 dark:bg-blue-900/40"
    },
    {
        key: "totalTodos",
        label: "Toplam Görev",
        icon: <ListChecks className="h-6 w-6 text-indigo-500" />, bg: "bg-indigo-50 dark:bg-indigo-900/40"
    },
    {
        key: "bekliyor",
        label: "Bekliyor",
        icon: <Clock className="h-6 w-6 text-gray-500" />, bg: "bg-gray-50 dark:bg-gray-800/60"
    },
    {
        key: "yapiliyor",
        label: "Yapılıyor",
        icon: <PlayCircle className="h-6 w-6 text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/40"
    },
    {
        key: "tamamlandi",
        label: "Tamamlandı",
        icon: <CheckCircle className="h-6 w-6 text-green-500" />, bg: "bg-green-50 dark:bg-green-900/40"
    },
    {
        key: "iptal",
        label: "İptal",
        icon: <XCircle className="h-6 w-6 text-red-500" />, bg: "bg-red-50 dark:bg-red-900/40"
    },
];

export default function ProfilePage() {
    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [profileStats, setProfileStats] = useState({
        totalProjects: 0,
        totalTodos: 0,
        bekliyor: 0,
        yapiliyor: 0,
        tamamlandi: 0,
        iptal: 0,
    });
    const [isStatsLoading, setIsStatsLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (!savedToken) {
            router.replace("/");
            return;
        }
        setToken(savedToken);
    }, [router]);

    useEffect(() => {
        if (token) {
            fetchProjects();
        }
        // eslint-disable-next-line
    }, [token]);

    const fetchProjects = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/projects", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Projeler yüklenemedi");
            const data = await response.json();
            setProjects(data);
            generateProfileStats(data);
        } catch (error) {
            toast.error("Projeler yüklenemedi");
        }
    };

    const generateProfileStats = async (projectsList: any[]) => {
        if (!token) return;
        setIsStatsLoading(true);
        try {
            const fetchTasksForProject = async (projectId: string) => {
                try {
                    const response = await fetch(`http://localhost:8000/api/todos/${projectId}`, {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type": "application/json",
                        },
                    });
                    if (!response.ok) return [];
                    const responseText = await response.text();
                    if (!responseText) return [];
                    const data = JSON.parse(responseText);
                    return Array.isArray(data)
                        ? data.map((todo: any) => ({
                            status: todo?.status ?? "bekliyor",
                        }))
                        : [];
                } catch {
                    return [];
                }
            };
            const allTasksArrays = await Promise.all(
                projectsList.map((p: any) => fetchTasksForProject(p.id))
            );
            const allTasks = allTasksArrays.flat();
            const statusCounts = {
                bekliyor: 0,
                yapiliyor: 0,
                tamamlandi: 0,
                iptal: 0,
            };
            allTasks.forEach((task) => {
                if (task.status && statusCounts.hasOwnProperty(task.status)) {
                    statusCounts[task.status as keyof typeof statusCounts]++;
                }
            });
            setProfileStats({
                totalProjects: projectsList.length,
                totalTodos: allTasks.length,
                ...statusCounts,
            });
        } catch {
            toast.error("İstatistikler yüklenemedi");
        } finally {
            setIsStatsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmNewPassword) {
            toast.error("Yeni şifreler uyuşmuyor.");
            return;
        }
        if (!currentPassword || !newPassword) {
            toast.error("Lütfen tüm alanları doldurun.");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Yeni şifre en az 6 karakter olmalıdır.");
            return;
        }
        try {
            const response = await fetch("http://localhost:8000/api/password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: currentPassword,
                    new_password: newPassword,
                    new_password_confirmation: confirmNewPassword,
                }),
            });
            let data = null;
            try {
                data = await response.json();
            } catch (jsonErr) {
                toast.error("Sunucudan beklenmeyen yanıt alındı.");
                return;
            }
            if (!response.ok) {
                // Hatalı JSON örneği: { message, errors }
                const errorMsg = data?.errors?.old_password?.[0] || data?.message || "Şifre değiştirilemedi.";
                toast.error("Şifre değiştirme başarısız", { description: errorMsg });
                return;
            }
            // Başarılı JSON örneği: { status, message }
            toast.success((data?.message || "Şifre başarıyla değiştirildi.") + " Lütfen tekrar giriş yapın.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
            // Otomatik logout
            localStorage.removeItem("token");
            setTimeout(() => {
                router.replace("/");
            }, 1200);
        } catch (error) {
            toast.error("Şifre değiştirme başarısız", {
                description: error instanceof Error ? error.message : "Bir hata oluştu.",
            });
        }
    };

    // Şifre alanı validasyonları
    const passwordsMatch = newPassword === confirmNewPassword && newPassword.length > 0;
    const passwordLongEnough = newPassword.length >= 6 && confirmNewPassword.length >= 6;
    const canChangePassword = passwordsMatch && passwordLongEnough && currentPassword.length > 0;
    const showError = (newPassword.length > 0 || confirmNewPassword.length > 0) && !passwordsMatch;
    const showSuccess = passwordsMatch && passwordLongEnough;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-2">
            <Toaster />
            <div className="w-full max-w-2xl">
                {/* Geri tuşu */}
                <div className="mb-2 flex w-full">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/60"
                        onClick={() => router.push("/")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Geri</span>
                    </Button>
                </div>
                {/* Profil başlığı ve avatar */}
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full p-2 shadow-lg mb-2">
                        <User className="h-16 w-16 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-1">Profilim</h1>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">Kişisel istatistikler ve şifre değişikliği</p>
                </div>

                {/* İstatistikler */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    {statCards.map((card) => (
                        <div key={card.key} className={`flex items-center gap-4 rounded-xl p-4 shadow-sm ${card.bg}`}>
                            <div>{card.icon}</div>
                            <div>
                                <div className="text-lg font-semibold text-gray-800 dark:text-white">
                                    {isStatsLoading ? <Loader2 className="animate-spin h-5 w-5" /> : profileStats[card.key as keyof typeof profileStats]}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-300 font-medium">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Şifre Değiştir */}
                <Card className="shadow-lg dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold text-gray-800 dark:text-white">Şifre Değiştir</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-password">Mevcut Şifre</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    placeholder="Mevcut şifreniz"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Yeni Şifre</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="Yeni şifreniz"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100 dark:border-gray-600 border-2 focus:outline-none ${newPassword.length === 0 ? '' : passwordsMatch ? (passwordLongEnough ? 'border-green-500 focus:border-green-600' : 'border-yellow-500 focus:border-yellow-600') : 'border-red-500 focus:border-red-600'}`}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-password">Yeni Şifre (Tekrar)</Label>
                                <Input
                                    id="confirm-new-password"
                                    type="password"
                                    placeholder="Yeni şifrenizi doğrulayın"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className={`dark:bg-gray-700 dark:placeholder:text-gray-400 dark:text-gray-100 dark:border-gray-600 border-2 focus:outline-none ${confirmNewPassword.length === 0 ? '' : passwordsMatch ? (passwordLongEnough ? 'border-green-500 focus:border-green-600' : 'border-yellow-500 focus:border-yellow-600') : 'border-red-500 focus:border-red-600'}`}
                                />
                            </div>
                            {/* Uyarı/Onay mesajı */}
                            {showError && (
                                <div className="text-sm text-red-600 dark:text-red-400 font-medium">Yeni şifreler aynı olmalı.</div>
                            )}
                            {!showError && newPassword.length > 0 && confirmNewPassword.length > 0 && !passwordLongEnough && (
                                <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Şifre en az 6 karakter olmalı.</div>
                            )}
                            {showSuccess && (
                                <div className="text-sm text-green-600 dark:text-green-400 font-medium">Şifreler eşleşiyor ve yeterince uzun.</div>
                            )}
                            <Button className="w-full mt-2" onClick={handleChangePassword} disabled={!canChangePassword}>
                                Şifreyi Değiştir
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 