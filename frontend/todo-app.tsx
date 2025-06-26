"use client"

import { useState, useEffect } from "react"
import { PlusCircle, Trash2, CheckCircle, XCircle, Clock, Moon, Sun, Flag, FolderPlus, Filter, X, User, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

type TaskStatus = "bekliyor" | "yapiliyor" | "tamamlandi" | "iptal"
type PriorityLevel = "yuksek" | "orta" | "dusuk"

interface Task {
  id: string
  text: string
  status: TaskStatus
  priority: PriorityLevel
  project: string
}

interface Project {
  id: string
  name: string
  created_at?: string
  updated_at?: string
  user_id?: number
}

export default function TodoApp() {
  // Start with an empty projects array
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [newTask, setNewTask] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<PriorityLevel>("orta")
  const [newTaskProject, setNewTaskProject] = useState<string>("")
  const [newProjectName, setNewProjectName] = useState("")
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [activeFilters, setActiveFilters] = useState<{
    priorities: PriorityLevel[]
  }>({
    priorities: [],
  })

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isProjectsLoading, setIsProjectsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [token, setToken] = useState<string | null>(null)

  // Dialog kontrolü için state
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [profileStats, setProfileStats] = useState({
    totalProjects: 0,
    totalTodos: 0,
    bekliyor: 0,
    yapiliyor: 0,
    tamamlandi: 0,
    iptal: 0,
  })
  const [isStatsLoading, setIsStatsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  // Proje düzenleme state'i
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editProjectName, setEditProjectName] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      setIsAuthenticated(true)
    }
    setIsLoading(false) // Token kontrolü tamamlandı, yükleme durumunu güncelle
  }, [])

  // Initialize dark mode based on user preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

      if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        setIsDarkMode(true)
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  // Initialize active filters
  useEffect(() => {
    setActiveFilters({ priorities: [] })
  }, [])

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    } else {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    }
    setIsDarkMode(!isDarkMode)
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Form validasyonu
    if (!email || !password) {
      toast.error("Giriş başarısız", {
        description: "E-posta ve şifre alanlarını doldurunuz.",
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      })
      return
    }

    try {
      // API'ye istek gönderme
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Giriş işlemi başarısız')
      }

      const data = await response.json()

      // Token'ı sakla
      setToken(data.token)
      setIsAuthenticated(true)

      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', data.token)

      toast.success("Giriş başarılı", {
        description: "Todo uygulamasına hoş geldiniz!",
        duration: 3000,
        style: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
      })
    } catch (error) {
      console.error('Login error:', error)
      toast.error("Giriş başarısız", {
        description: error instanceof Error ? error.message : "E-posta veya şifre hatalı.",
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      })
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      // API'ye çıkış isteği gönderme
      await fetch('http://localhost:8000/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      // State'i temizle
      setIsAuthenticated(false)
      setEmail("")
      setPassword("")
      setToken(null)

      // Token'ı localStorage'dan sil
      localStorage.removeItem('token')

      toast.info("Çıkış yapıldı", {
        description: "Başarıyla çıkış yaptınız.",
        duration: 3000
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Hata olsa bile çıkış yap
      setIsAuthenticated(false)
      setToken(null)
      localStorage.removeItem('token')
    }
  }

  const generateProfileStats = async () => {
    if (!token) return;
    setIsStatsLoading(true);

    try {
      const fetchTasksForProject = async (projectId: string): Promise<Task[]> => {
        try {
          const response = await fetch(`http://localhost:8000/api/todos/${projectId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          if (!response.ok) {
            console.error(`Error fetching tasks for project ${projectId}: ${response.statusText}`);
            return [];
          }
          const responseText = await response.text();
          if (!responseText) return [];
          const data = JSON.parse(responseText);

          return Array.isArray(data) ? data.map((todo: any) => ({
            id: todo?.id?.toString() ?? '',
            text: todo?.title ?? 'İsimsiz görev',
            status: todo?.status as TaskStatus ?? 'bekliyor',
            priority: todo?.priority as PriorityLevel ?? 'orta',
            project: todo?.project_id?.toString() ?? projectId,
          })) : [];
        } catch (error) {
          console.error(`Failed to fetch or parse tasks for project ${projectId}`, error);
          return [];
        }
      };

      const allTasksPromises = projects.map(p => fetchTasksForProject(p.id));
      const allTasksArrays = await Promise.all(allTasksPromises);
      const allTasks = allTasksArrays.flat();

      const statusCounts = {
        bekliyor: 0,
        yapiliyor: 0,
        tamamlandi: 0,
        iptal: 0,
      };

      allTasks.forEach(task => {
        if (task.status && statusCounts.hasOwnProperty(task.status)) {
          statusCounts[task.status]++;
        }
      });

      setProfileStats({
        totalProjects: projects.length,
        totalTodos: allTasks.length,
        ...statusCounts,
      });

    } catch (error) {
      console.error("Error generating profile stats:", error);
      toast.error("İstatistikler yüklenirken bir hata oluştu.");
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
      // NOT: Bu özelliğin çalışması için backend'de '/api/change-password' endpoint'inin olması gerekmektedir.
      const response = await fetch('http://localhost:8000/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmNewPassword
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Şifre değiştirilemedi.");
      }

      toast.success("Şifre başarıyla değiştirildi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsProfileDialogOpen(false);
    } catch (error) {
      console.error('Password change error:', error);
      toast.error("Şifre değiştirme başarısız", {
        description: error instanceof Error ? error.message : "Bir hata oluştu.",
      });
    }
  };

  // Projeye göre todoları çekme fonksiyonu
  const fetchTodosByProject = async (projectId: string) => {
    if (!token) {
      console.error("Token yok, todo listesi çekilemiyor");
      return;
    }

    console.log(`Projeden todoları çekiyor: ID ${projectId}`);

    try {
      const response = await fetch(`http://localhost:8000/api/todos/${projectId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Todo listeleme yanıt durumu:", response.status, response.statusText);

      // Başarısız yanıt durumunda
      if (!response.ok) {
        let errorMessage = `Görevler yüklenirken bir hata oluştu (${response.status})`;

        try {
          const responseText = await response.text();
          console.error('Todo listeleme hata yanıtı:', responseText);

          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            errorMessage = responseText || errorMessage;
          }
        } catch (e) {
          console.error("Yanıt metni okunamadı", e);
        }

        // Toast mesajını kaldırdık - sadece console'da log göster
        console.error('Todo fetch error:', errorMessage);

        return;
      }

      // Başarılı yanıt işleme
      let responseText;
      try {
        responseText = await response.text();
      } catch (e) {
        console.error("Yanıt metni okunamadı", e);
        return;
      }

      if (!responseText) {
        console.log("Boş yanıt, todo listesi boş");
        setTasks([]);
        return;
      }

      console.log('Todo listeleme başarılı ham yanıt:', responseText);

      let todosData;
      try {
        todosData = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Başarılı yanıt JSON parse edilemedi', parseError);
        toast.error("Veri formatı hatası", {
          description: "Sunucudan gelen veri anlaşılamadı",
          duration: 3000
        });
        return;
      }

      console.log("Parsed todosData:", todosData);

      // API'den gelen görevleri state'e kaydet (null/undefined kontrolleriyle)
      const formattedTodos: Task[] = Array.isArray(todosData) ? todosData.map((todo: any) => {
        console.log("Processing todo item:", todo);
        return {
          id: todo && todo.id ? todo.id.toString() : Date.now().toString(),
          text: todo && todo.title ? todo.title : "İsimsiz görev",
          status: todo && todo.status ? todo.status as TaskStatus : "bekliyor" as TaskStatus,
          priority: todo && todo.priority ? todo.priority as PriorityLevel : "orta" as PriorityLevel,
          project: todo && todo.project_id ? todo.project_id.toString() : projectId
        };
      }) : [];

      console.log("Formatted todos:", formattedTodos);

      // State'i güncelle
      setTasks(formattedTodos);

    } catch (error) {
      console.error('Görevleri çekme hatası:', error);
      // Toast mesajını kaldırdık - sadece console'da log göster
    }
  };

  const addTask = async () => {
    if (newTask.trim() === "") {
      return
    }

    if (!newTaskProject) {
      return // Prevent adding task without a project
    }

    try {
      // API'ye todo ekleme isteği gönder
      const response = await fetch('http://localhost:8000/api/todos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTask,
          priority: newTaskPriority,
          project_id: newTaskProject
        })
      });

      if (!response.ok) {
        // Ham yanıt metnini al
        const responseText = await response.text();
        console.error('Todo ekleme hatası ham yanıt:', responseText);

        // Yanıt metnini JSON olarak parse etmeyi dene
        let errorMessage = 'Görev eklenirken bir hata oluştu';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // JSON parse edilemezse ham yanıt metnini kullan
          errorMessage = responseText || errorMessage;
        }

        throw new Error(errorMessage);
      }

      // Başarılı yanıt için ham metni al
      const responseText = await response.text();
      let todoData = null;

      if (responseText) {
        console.log('Todo ekleme başarılı ham yanıt:', responseText);
        try {
          todoData = JSON.parse(responseText);
        } catch (parseError) {
          console.log('Başarılı yanıt JSON parse edilemedi, varsayılan değerler kullanılacak');
        }
      }

      // Yeni görevi tasks state'ine ekle (null/undefined kontrolleriyle)
      const newTaskObj: Task = {
        id: todoData && todoData.id ? todoData.id.toString() : Date.now().toString(),
        text: todoData && todoData.title ? todoData.title : newTask,
        status: (todoData && todoData.status ? todoData.status : "bekliyor") as TaskStatus,
        priority: (todoData && todoData.priority ? todoData.priority : newTaskPriority) as PriorityLevel,
        project: todoData && todoData.project_id ? todoData.project_id.toString() : newTaskProject
      };

      setTasks([
        ...tasks,
        newTaskObj
      ]);

      // Todo ekleme formunu temizle
      setNewTask("");

      // Show green notification
      toast.success("Görev eklendi", {
        description: `"${newTaskObj.text}" görevi başarıyla eklendi.`,
        duration: 3000,
        style: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
      });

      // Seçili projeye ait todoları yenile
      if (selectedProjects.length > 0) {
        fetchTodosByProject(selectedProjects[0]);
      }
    } catch (error) {
      console.error('Görev ekleme hatası:', error);
      toast.error("Görev eklenemedi", {
        description: error instanceof Error ? error.message : "Görev eklenirken bir hata oluştu.",
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      });
    }
  }

  const addProject = async () => {
    if (newProjectName.trim() !== "") {
      try {
        // API'ye proje ekleme isteği gönder
        const response = await fetch('http://localhost:8000/api/projects', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: newProjectName })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Proje eklenirken bir hata oluştu')
        }

        // API'den dönen proje verisini al
        const projectData = await response.json()

        // API'den dönen id ve name değerlerini kullan
        const newProject: Project = {
          id: projectData.id || Date.now().toString(),
          name: projectData.name
        }

        const updatedProjects = [...projects, newProject]
        setProjects(updatedProjects)

        // Show green notification
        toast.success("Proje eklendi", {
          description: `"${newProject.name}" projesi başarıyla oluşturuldu. Kullanmak için projeyi seçiniz.`,
          duration: 3000,
          style: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
        })

        setNewProjectName("")

        // Dialog'u kapat
        setIsProjectDialogOpen(false)

        // Projeleri yeniden çek
        fetchProjects();
      } catch (error) {
        console.error('Proje ekleme hatası:', error)
        toast.error("Proje eklenemedi", {
          description: error instanceof Error ? error.message : "Proje eklenirken bir hata oluştu.",
          duration: 3000,
          style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
        })
      }
    }
  }

  const deleteTask = async (id: string) => {
    // Get task info for the notification
    const task = tasks.find(t => t.id === id);

    if (!task) {
      console.error("Silinecek task bulunamadı, ID:", id);

      // Görev bulunamadıysa kırmızı hata yerine sarı uyarı göster
      toast.warning("Görev mevcut değil", {
        description: `ID: ${id}`,
        duration: 3000,
        style: { backgroundColor: '#FFF7CD', color: '#7A4F01', border: '1px solid #F0CF65' }
      });

      return;
    }

    console.log("Silme işlemi başladı, Task ID:", id, "Task:", task);

    // Önce UI'dan kaldır (optimistik güncelleme)
    setTasks(prevTasks => prevTasks.filter(t => t.id !== id));

    try {
      // API'ye silme isteği gönder
      const response = await fetch(`http://localhost:8000/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Yanıt durumunu logla
      console.log("Silme API yanıt durumu:", response.status, response.statusText);

      // API yanıtını oku (boş olabilir)
      let responseText = "";
      try {
        responseText = await response.text();
        console.log("Silme API yanıt metni:", responseText);
      } catch (e) {
        console.log("Silme API yanıtı boş olabilir");
      }

      // Başarısız yanıt durumunda
      if (!response.ok) {
        console.error(`Silme başarısız oldu: ${response.status} ${response.statusText}`);

        // Silinen task'ı geri ekle
        setTasks(prevTasks => [...prevTasks, task]);

        // Boş yanıt veya görev bulunamadı hataları için uyarı, diğer hatalar için kırmızı hata
        if ((response.status === 404) ||
          (responseText && responseText.includes("not found")) ||
          (responseText && responseText.includes("bulunamadı"))) {

          // 404 veya "bulunamadı" hatası için sarı uyarı göster
          toast.warning("Görev mevcut değil", {
            description: `ID: ${id}`,
            duration: 3000,
            style: { backgroundColor: '#FFF7CD', color: '#7A4F01', border: '1px solid #F0CF65' }
          });
        } else {
          // Diğer hatalar için kırmızı hata göster
          toast.error("Görev silinemedi", {
            description: `ID: ${id}`,
            duration: 3000,
            style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
          });
        }

        return;
      }

      // Başarılı silme bildirimi
      toast.success("Görev silindi", {
        description: `"${task.text}" (ID: ${task.id}) görevi başarıyla silindi.`,
        duration: 3000,
        style: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
      });

      console.log(`Task silindi, ID: ${id}`);

      // Görevleri API'den yeniden yükle - API'den görevleri yeniden yüklemek yerine
      // Zaten UI'dan sildiğimiz görevi koruyoruz, fetchTodosByProject fonksiyonu sorunluysa
      // bu daha güvenli olacaktır
      if (selectedProjects.length > 0) {
        console.log("Görevleri yeniden çekiyor: Proje ID", selectedProjects[0]);
        // Tek bir proje seçiliyse, bu projeye ait görevleri yeniden getir
        await fetchTodosByProject(selectedProjects[0]);
      }

    } catch (error) {
      console.error('Görev silme hatası:', error);

      // Hata durumunda task'ı geri ekle
      setTasks(prevTasks => [...prevTasks, task]);

      // Genel bir hata oluştuğunda kırmızı hata bildirimi göster
      toast.error("Görev silinemedi", {
        description: `ID: ${id}`,
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      });
    }
  }

  const deleteProject = async (projectId: string) => {
    // Get project info for the notification
    const project = projects.find(p => p.id === projectId)

    if (!project) return;

    try {
      // API'ye silme isteği gönder
      const response = await fetch(`http://localhost:8000/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proje silinirken bir hata oluştu');
      }

      // Frontend state'i güncelle
      // Remove tasks associated with this project
      setTasks(tasks.filter((task) => task.project !== projectId))

      // Remove project from selected projects
      setSelectedProjects(selectedProjects.filter((p) => p !== projectId))

      // Remove project
      setProjects(projects.filter((p) => p.id !== projectId))

      // If current new task project is being deleted, reset it
      if (newTaskProject === projectId) {
        setNewTaskProject("")
      }

      // Show notification
      toast.success("Proje silindi", {
        description: `"${project.name}" projesi başarıyla silindi.`,
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      })
    } catch (error) {
      console.error('Proje silme hatası:', error);
      toast.error("Proje silinemedi", {
        description: error instanceof Error ? error.message : "Proje silinirken bir hata oluştu.",
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      });
    }
  }

  // Toggle project selection
  const toggleProjectSelection = (projectId: string) => {
    setSelectedProjects((prev) => {
      if (prev.includes(projectId)) {
        // If we're unselecting the current project for new tasks, reset it
        if (newTaskProject === projectId) {
          setNewTaskProject("")
        }
        return prev.filter((p) => p !== projectId)
      } else {
        // If this is the first project being selected, set it as the current project for new tasks
        if (prev.length === 0) {
          setNewTaskProject(projectId)
        }
        return [...prev, projectId]
      }
    })
  }

  // Apply filters to tasks
  const filteredTasks = tasks.filter((task) => {
    // Only show tasks from selected projects
    const projectMatch = selectedProjects.includes(task.project)

    // If no priority filters are active, show all priorities
    const priorityMatch = activeFilters.priorities.length === 0 || activeFilters.priorities.includes(task.priority)

    return projectMatch && priorityMatch
  })

  // Filter tasks by status
  const bekliyorTasks = filteredTasks.filter((task) => task.status === "bekliyor")
  const yapiliyorTasks = filteredTasks.filter((task) => task.status === "yapiliyor")
  const tamamlandiTasks = filteredTasks.filter((task) => task.status === "tamamlandi")
  const iptalTasks = filteredTasks.filter((task) => task.status === "iptal")

  // Toggle priority filter
  const togglePriorityFilter = (priority: PriorityLevel) => {
    setActiveFilters((prev) => {
      if (prev.priorities.includes(priority)) {
        return {
          ...prev,
          priorities: prev.priorities.filter((p) => p !== priority),
        }
      } else {
        return {
          ...prev,
          priorities: [...prev.priorities, priority],
        }
      }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters({
      priorities: [],
    })
  }

  // Handle drag end
  const onDragEnd = async (result: any) => {
    const { source, destination } = result

    // Dropped outside the list
    if (!destination) {
      return
    }

    // Find the task that was dragged
    const taskId = result.draggableId
    const task = tasks.find((t) => t.id === taskId)

    if (!task) return

    // Determine the new status based on the destination droppable id
    const newStatus = destination.droppableId as TaskStatus

    // Status aynıysa işlem yapma
    if (task.status === newStatus) return;

    try {
      // Yeni endpoint'i kullan - /todos/{id}/status
      const response = await fetch(`http://localhost:8000/api/todos/${taskId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      });

      let successData;

      if (!response.ok) {
        // Ham yanıt metnini al
        const responseText = await response.text();
        console.error('Taşıma hatası ham yanıt:', responseText);

        // Yanıt metnini JSON olarak parse etmeyi dene
        let errorMessage = 'Görev durumu güncellenirken bir hata oluştu';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (parseError) {
          // JSON parse edilemezse ham yanıt metnini kullan
          errorMessage = responseText || errorMessage;
        }

        throw new Error(errorMessage);
      } else {
        // Başarılı yanıt için de ham metni al
        try {
          const responseText = await response.text();
          if (responseText) {
            console.log('Taşıma başarılı ham yanıt:', responseText);
            try {
              successData = JSON.parse(responseText);
            } catch (parseError) {
              console.log('Başarılı yanıt JSON parse edilemedi, ham metin:', responseText);
            }
          }
        } catch (textError) {
          console.log('Yanıt metni alınamadı, bu normal olabilir');
        }
      }

      // Frontend state'i güncelle
      setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))

      // Get status text for notification
      let statusText = ""
      switch (newStatus) {
        case "bekliyor":
          statusText = "Bekliyor"
          break
        case "yapiliyor":
          statusText = "Yapılıyor"
          break
        case "tamamlandi":
          statusText = "Tamamlandı"
          break
        case "iptal":
          statusText = "İptal Edildi"
          break
      }

      // Show notification
      toast.success("Görev taşındı", {
        description: `"${task.text}" görevi "${statusText}" durumuna taşındı.`,
        duration: 3000,
        style: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
      })

      // Opsiyonel: Durumu yeniden çek
      if (selectedProjects.length > 0) {
        fetchTodosByProject(selectedProjects[0]);
      }
    } catch (error) {
      console.error('Görev durumu güncelleme hatası:', error);

      // Hata durumunda orijinal state'e geri dön
      setTasks(tasks.map((t) => t.id === taskId ? { ...t, status: task.status } : t));

      toast.error("Görev taşınamadı", {
        description: error instanceof Error ? error.message : "Görev durumu güncellenirken bir hata oluştu.",
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      });
    }
  }

  // Get priority badge
  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case "yuksek":
        return <Badge className="bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700">Yüksek</Badge>
      case "orta":
        return (
          <Badge className="bg-yellow-500 dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700">Orta</Badge>
        )
      case "dusuk":
        return (
          <Badge className="bg-green-500 dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700">Düşük</Badge>
        )
    }
  }

  // Get priority icon
  const getPriorityIcon = (priority: PriorityLevel) => {
    switch (priority) {
      case "yuksek":
        return <Flag className="h-4 w-4 text-red-500 dark:text-red-400" />
      case "orta":
        return <Flag className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
      case "dusuk":
        return <Flag className="h-4 w-4 text-green-500 dark:text-green-400" />
    }
  }

  // Get project name by id
  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    return project ? project.name : "Bilinmeyen Proje"
  }

  // Tarih formatlar
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Count active filters
  const activeFilterCount = activeFilters.priorities.length

  // Fetch user projects from API
  const fetchProjects = async () => {
    if (!token) return;

    setIsProjectsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Projeler yüklenirken bir hata oluştu');
      }

      const projectsData = await response.json();

      // API'den gelen projeleri state'e kaydet
      setProjects(projectsData.map((project: any) => ({
        id: project.id.toString(),
        name: project.name,
        created_at: project.created_at,
        updated_at: project.updated_at,
        user_id: project.user_id
      })));

    } catch (error) {
      console.error('Projects fetch error:', error);
      // Toast mesajını kaldırdık - sadece console'da log göster
    } finally {
      setIsProjectsLoading(false);
    }
  };

  // Kullanıcı giriş yaptığında projeleri çek
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchProjects();
    }
  }, [isAuthenticated, token]);

  // Düzenleme dialogunu açma fonksiyonu
  const openEditDialog = (project: Project) => {
    setEditingProject(project);
    setEditProjectName(project.name);
    setIsEditDialogOpen(true);
  };

  // Proje güncelleme fonksiyonu
  const updateProject = async () => {
    if (!editingProject || editProjectName.trim() === "") return;

    try {
      // API'ye güncelleme isteği gönder
      const response = await fetch(`http://localhost:8000/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editProjectName
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Proje güncellenirken bir hata oluştu');
      }

      // API'den dönen güncellenmiş veriyi al
      const updatedProject = await response.json();

      // Projeyi güncelle
      setProjects(projects.map(p =>
        p.id === editingProject.id
          ? {
            ...p,
            name: updatedProject.name || editProjectName,
            updated_at: updatedProject.updated_at
          }
          : p
      ));

      // Dialog'u kapat ve state'i temizle
      setIsEditDialogOpen(false);
      setEditingProject(null);
      setEditProjectName("");

      // Bildirimi göster
      toast.success("Proje güncellendi", {
        description: `"${editProjectName}" projesi başarıyla güncellendi.`,
        duration: 3000,
        style: { backgroundColor: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
      });

      // Projeleri yeniden çek
      fetchProjects();

    } catch (error) {
      console.error('Proje güncelleme hatası:', error);
      toast.error("Proje güncellenemedi", {
        description: error instanceof Error ? error.message : "Proje güncellenirken bir hata oluştu.",
        duration: 3000,
        style: { backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171' }
      });
    }
  };

  // Seçili projelere göre todo'ları çek
  useEffect(() => {
    if (selectedProjects.length > 0 && token) {
      // İlk seçili projenin taskları yükle
      fetchTodosByProject(selectedProjects[0]);
    } else {
      // Hiç proje seçili değilse tasks listesini temizle
      setTasks([]);
    }
  }, [selectedProjects, token]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-0">

        {isLoading ? (
          // Yükleme ekranı
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !isAuthenticated ? (
          // Giriş ekranı
          <div className="flex items-center justify-center h-screen">
            <Card className="w-[350px] shadow-xl dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-center">Giriş Yap</CardTitle>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="E-posta adresinizi girin"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Şifre</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Şifrenizi girin"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700">
                    Giriş Yap
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        ) : (
          // Todo app ekranı
          <div className="w-full h-screen">
            <Card className="shadow-xl dark:bg-gray-800 dark:border-gray-700 h-full rounded-none">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 text-white flex flex-row items-center justify-between rounded-none">
                <CardTitle className="text-2xl font-bold">Görev Yöneticisi</CardTitle>
                <div className="flex items-center space-x-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20 relative"
                        disabled={selectedProjects.length === 0}
                      >
                        <Filter className="h-5 w-5" />
                        {activeFilterCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                            {activeFilterCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Filtreler</h4>
                          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs">
                            Temizle
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Öncelik</h5>
                          <div className="grid grid-cols-1 gap-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="priority-yuksek"
                                checked={activeFilters.priorities.includes("yuksek")}
                                onCheckedChange={() => togglePriorityFilter("yuksek")}
                              />
                              <Label htmlFor="priority-yuksek" className="flex items-center">
                                <Flag className="h-4 w-4 text-red-500 mr-1" />
                                Yüksek
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="priority-orta"
                                checked={activeFilters.priorities.includes("orta")}
                                onCheckedChange={() => togglePriorityFilter("orta")}
                              />
                              <Label htmlFor="priority-orta" className="flex items-center">
                                <Flag className="h-4 w-4 text-yellow-500 mr-1" />
                                Orta
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="priority-dusuk"
                                checked={activeFilters.priorities.includes("dusuk")}
                                onCheckedChange={() => togglePriorityFilter("dusuk")}
                              />
                              <Label htmlFor="priority-dusuk" className="flex items-center">
                                <Flag className="h-4 w-4 text-green-500 mr-1" />
                                Düşük
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="text-white hover:bg-white/20">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/database")}
                    className="text-white hover:bg-white/20"
                    title="Veritabanı Tasarımcısı"
                  >
                    <Database className="h-5 w-5" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => router.push("/profile")}
                    className="text-white hover:bg-white/20"
                    title="Profilim"
                  >
                    <User className="h-5 w-5" />
                  </Button>

                  <Button variant="ghost" size="icon" onClick={handleLogout} className="text-white hover:bg-white/20" title="Çıkış Yap">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 dark:bg-gray-800 overflow-auto h-[calc(100vh-64px)]">
                {/* Project Selection Section */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium dark:text-gray-200">Projeler</h3>
                    <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          <FolderPlus className="h-4 w-4 mr-2" />
                          Yeni Proje
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-gray-800 dark:text-gray-100">Yeni Proje Ekle</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center space-x-2 py-4">
                          <Input
                            placeholder="Proje adı"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                          />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button
                              type="button"
                              variant="secondary"
                              className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                            >
                              İptal
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button type="button" onClick={addProject}>
                              Ekle
                            </Button>
                          </DialogClose>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {isProjectsLoading ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg border-gray-300 dark:border-gray-600">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                      <p className="text-gray-500 dark:text-gray-400">Projeler yükleniyor...</p>
                    </div>
                  ) : projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {projects.map((project) => (
                        <div
                          key={project.id}
                          className={`flex flex-col p-3 rounded-lg border ${selectedProjects.includes(project.id)
                            ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                            : "bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                            }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={`project-select-${project.id}`}
                                className="mr-2"
                                checked={selectedProjects.includes(project.id)}
                                onCheckedChange={() => toggleProjectSelection(project.id)}
                              />
                              <label
                                htmlFor={`project-select-${project.id}`}
                                className="text-sm font-medium dark:text-gray-200 cursor-pointer"
                              >
                                {project.name}
                              </label>
                            </div>
                            <div className="flex items-center">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(project)}
                                className="h-6 w-6 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 mr-1"
                                title="Düzenle"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteProject(project.id)}
                                className="h-6 w-6 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                                title="Sil"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>

                          {project.created_at && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Oluşturulma: {formatDate(project.created_at)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg border-gray-300 dark:border-gray-600">
                      <FolderPlus className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-3" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-1">Henüz hiç proje yok</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-center mb-4">
                        Görev eklemek için önce bir proje oluşturun
                      </p>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>
                            <FolderPlus className="h-4 w-4 mr-2" />
                            İlk Projeni Oluştur
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-gray-800 dark:text-gray-100">Yeni Proje Ekle</DialogTitle>
                          </DialogHeader>
                          <div className="flex items-center space-x-2 py-4">
                            <Input
                              placeholder="Proje adı"
                              value={newProjectName}
                              onChange={(e) => setNewProjectName(e.target.value)}
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                            />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button
                                type="button"
                                variant="secondary"
                                className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                              >
                                İptal
                              </Button>
                            </DialogClose>
                            <DialogClose asChild>
                              <Button type="button" onClick={addProject}>
                                Ekle
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {!isProjectsLoading && projects.length > 0 && selectedProjects.length === 0 && (
                    <Alert className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>Görevleri görüntülemek için en az bir proje seçin.</AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Task Input Section */}
                <div className="flex flex-col space-y-4 mb-6">
                  <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                    <Input
                      type="text"
                      placeholder="Yeni görev ekle..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newTaskProject) {
                          addTask()
                        }
                      }}
                      className="border-2 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      disabled={selectedProjects.length === 0}
                    />

                    <div className="flex space-x-2">
                      <Select
                        value={newTaskPriority}
                        onValueChange={(value) => setNewTaskPriority(value as PriorityLevel)}
                        disabled={selectedProjects.length === 0}
                      >
                        <SelectTrigger className="w-[110px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Öncelik" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yuksek" className="flex items-center">
                            <div className="flex items-center">
                              <Flag className="h-4 w-4 text-red-500 mr-2" />
                              Yüksek
                            </div>
                          </SelectItem>
                          <SelectItem value="orta">
                            <div className="flex items-center">
                              <Flag className="h-4 w-4 text-yellow-500 mr-2" />
                              Orta
                            </div>
                          </SelectItem>
                          <SelectItem value="dusuk">
                            <div className="flex items-center">
                              <Flag className="h-4 w-4 text-green-500 mr-2" />
                              Düşük
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      <Select
                        value={newTaskProject}
                        onValueChange={setNewTaskProject}
                        disabled={selectedProjects.length === 0}
                      >
                        <SelectTrigger className="w-[140px] dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Proje seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProjects.map((projectId) => {
                            const project = projects.find((p) => p.id === projectId)
                            if (!project) return null
                            return (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>

                      <Button
                        onClick={addTask}
                        className="bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                        disabled={!newTaskProject || newTask.trim() === "" || selectedProjects.length === 0}
                      >
                        <PlusCircle className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  {activeFilterCount > 0 && (
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>Aktif filtreler:</span>
                      <div className="flex flex-wrap gap-1">
                        {activeFilters.priorities.map((priority) => (
                          <Badge
                            key={priority}
                            variant="outline"
                            className="flex items-center gap-1 px-2 py-1"
                            onClick={() => togglePriorityFilter(priority)}
                          >
                            {priority === "yuksek" && "Yüksek"}
                            {priority === "orta" && "Orta"}
                            {priority === "dusuk" && "Düşük"}
                            <X className="h-3 w-3" />
                          </Badge>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" onClick={clearFilters} className="h-6 text-xs">
                        Temizle
                      </Button>
                    </div>
                  )}
                </div>

                {/* Task Lists */}
                {selectedProjects.length > 0 && (
                  <DragDropContext onDragEnd={onDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[calc(100vh-300px)]">
                      {/* Bekliyor Kutusu */}
                      <div className="flex flex-col h-full">
                        <div className="bg-purple-100 dark:bg-purple-900/30 py-3 px-4 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-purple-700 dark:text-purple-300 flex items-center">
                              <Clock className="h-5 w-5 mr-2" />
                              Bekliyor
                              <span className="ml-2 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {bekliyorTasks.length}
                              </span>
                            </h3>
                          </div>
                        </div>
                        <Droppable droppableId="bekliyor">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-purple-50 dark:bg-gray-700/50 p-3 rounded-b-lg flex-grow min-h-[200px] h-full overflow-y-auto"
                            >
                              {bekliyorTasks.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                                  Bekleyen görev yok
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {bekliyorTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-shadow cursor-move"
                                        >
                                          <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <Clock className="h-5 w-5 text-purple-500 dark:text-purple-400 flex-shrink-0" />
                                                <span className="text-gray-800 dark:text-gray-200 font-medium">
                                                  {task.text}
                                                </span>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteTask(task.id)}
                                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                                                {getProjectName(task.project)}
                                              </Badge>
                                              <div className="flex items-center space-x-1">
                                                {getPriorityIcon(task.priority)}
                                                {getPriorityBadge(task.priority)}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              ID: {task.id}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>

                      {/* Yapılıyor Kutusu */}
                      <div className="flex flex-col h-full">
                        <div className="bg-blue-100 dark:bg-blue-900/30 py-3 px-4 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 flex items-center">
                              <Clock className="h-5 w-5 mr-2" />
                              Yapılıyor
                              <span className="ml-2 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {yapiliyorTasks.length}
                              </span>
                            </h3>
                          </div>
                        </div>
                        <Droppable droppableId="yapiliyor">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-blue-50 dark:bg-gray-700/50 p-3 rounded-b-lg flex-grow min-h-[200px] h-full overflow-y-auto"
                            >
                              {yapiliyorTasks.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                                  Yapılacak görev yok
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {yapiliyorTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-blue-200 dark:border-blue-800 shadow-sm hover:shadow-md transition-shadow cursor-move"
                                        >
                                          <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                                                <span className="text-gray-800 dark:text-gray-200 font-medium">
                                                  {task.text}
                                                </span>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteTask(task.id)}
                                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                                                {getProjectName(task.project)}
                                              </Badge>
                                              <div className="flex items-center space-x-1">
                                                {getPriorityIcon(task.priority)}
                                                {getPriorityBadge(task.priority)}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              ID: {task.id}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>

                      {/* Tamamlandı Kutusu */}
                      <div className="flex flex-col h-full">
                        <div className="bg-green-100 dark:bg-green-900/30 py-3 px-4 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-green-700 dark:text-green-300 flex items-center">
                              <CheckCircle className="h-5 w-5 mr-2" />
                              Tamamlandı
                              <span className="ml-2 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {tamamlandiTasks.length}
                              </span>
                            </h3>
                          </div>
                        </div>
                        <Droppable droppableId="tamamlandi">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-green-50 dark:bg-gray-700/50 p-3 rounded-b-lg flex-grow min-h-[200px] h-full overflow-y-auto"
                            >
                              {tamamlandiTasks.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                                  Tamamlanmış görev yok
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {tamamlandiTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-green-200 dark:border-green-800 shadow-sm hover:shadow-md transition-shadow cursor-move"
                                        >
                                          <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 line-through">
                                                  {task.text}
                                                </span>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteTask(task.id)}
                                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                                                {getProjectName(task.project)}
                                              </Badge>
                                              <div className="flex items-center space-x-1">
                                                {getPriorityIcon(task.priority)}
                                                {getPriorityBadge(task.priority)}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              ID: {task.id}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>

                      {/* İptal Kutusu */}
                      <div className="flex flex-col h-full">
                        <div className="bg-red-100 dark:bg-red-900/30 py-3 px-4 rounded-t-lg">
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-red-700 dark:text-red-300 flex items-center">
                              <XCircle className="h-5 w-5 mr-2" />
                              İptal
                              <span className="ml-2 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 text-xs font-semibold px-2.5 py-0.5 rounded">
                                {iptalTasks.length}
                              </span>
                            </h3>
                          </div>
                        </div>
                        <Droppable droppableId="iptal">
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.droppableProps}
                              className="bg-red-50 dark:bg-gray-700/50 p-3 rounded-b-lg flex-grow min-h-[200px] h-full overflow-y-auto"
                            >
                              {iptalTasks.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400 italic">
                                  İptal edilen görev yok
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {iptalTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                      {(provided) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className="p-3 rounded-lg bg-white dark:bg-gray-700 border border-red-200 dark:border-red-800 shadow-sm hover:shadow-md transition-shadow cursor-move"
                                        >
                                          <div className="flex flex-col space-y-2">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center space-x-2">
                                                <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0" />
                                                <span className="text-gray-800 dark:text-gray-200 font-medium">
                                                  {task.text}
                                                </span>
                                              </div>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteTask(task.id)}
                                                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 h-8 w-8"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <Badge variant="outline" className="text-gray-600 dark:text-gray-300">
                                                {getProjectName(task.project)}
                                              </Badge>
                                              <div className="flex items-center space-x-1">
                                                {getPriorityIcon(task.priority)}
                                                {getPriorityBadge(task.priority)}
                                              </div>
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                              ID: {task.id}
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                </div>
                              )}
                              {provided.placeholder}
                            </div>
                          )}
                        </Droppable>
                      </div>
                    </div>
                  </DragDropContext>
                )}

                <div className="text-sm text-gray-500 dark:text-gray-400 mt-6 text-center">
                  İpucu: Görevleri sürükleyip farklı durumlara bırakabilirsiniz
                </div>

                {/* Proje Düzenleme Dialog */}
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-800 dark:text-gray-100">Proje Düzenle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-project-name">Proje Adı</Label>
                        <Input
                          id="edit-project-name"
                          placeholder="Proje adı"
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                        />
                      </div>
                      {editingProject?.created_at && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Oluşturulma Tarihi: {formatDate(editingProject.created_at)}
                        </div>
                      )}
                      {editingProject?.updated_at && editingProject.updated_at !== editingProject.created_at && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Son Güncelleme: {formatDate(editingProject.updated_at)}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditDialogOpen(false)}
                        className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                      >
                        İptal
                      </Button>
                      <Button
                        type="button"
                        onClick={updateProject}
                        disabled={!editProjectName.trim()}
                      >
                        Güncelle
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Profilim Dialog */}
                <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
                  <DialogContent className="sm:max-w-md dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-gray-800 dark:text-gray-100">Profilim</DialogTitle>
                    </DialogHeader>
                    {isStatsLoading ? (
                      <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <div>
                        <div className="space-y-4 py-4">
                          <h4 className="font-medium text-lg dark:text-gray-200">İstatistikler</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm dark:text-gray-300">
                            <p>Toplam Proje:</p><p className="font-semibold">{profileStats.totalProjects}</p>
                            <p>Toplam Görev:</p><p className="font-semibold">{profileStats.totalTodos}</p>
                            <p>Bekleyen Görev:</p><p className="font-semibold">{profileStats.bekliyor}</p>
                            <p>Yapılan Görev:</p><p className="font-semibold">{profileStats.yapiliyor}</p>
                            <p>Tamamlanan Görev:</p><p className="font-semibold">{profileStats.tamamlandi}</p>
                            <p>İptal Edilen Görev:</p><p className="font-semibold">{profileStats.iptal}</p>
                          </div>
                        </div>
                        <hr className="my-4 dark:border-gray-700" />
                        <div className="space-y-4">
                          <h4 className="font-medium text-lg dark:text-gray-200">Şifre Değiştir</h4>
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
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
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
                              className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder:text-gray-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsProfileDialogOpen(false)}
                        className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
                      >
                        Kapat
                      </Button>
                      <Button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isStatsLoading}
                      >
                        Şifreyi Değiştir
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

