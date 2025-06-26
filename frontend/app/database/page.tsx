"use client"

import { useState, useCallback, useRef, useEffect } from 'react'
import ReactFlow, {
    Node,
    Edge,
    addEdge,
    Connection,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MiniMap,
    NodeTypes,
    Handle,
    Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Database, Table, Settings, Save, Download, Upload, FolderOpen, Trash2, ArrowLeft, Moon, Sun } from 'lucide-react'
import { toast } from 'sonner'

// Veritabanı interface'i
interface Database {
    id: number
    name: string
    description: string
    created_at: string | null
    updated_at: string | null
    tables: any[]
    relationships: any[]
    user_id: number
}

// Özel tablo node bileşeni
const TableNode = ({ data, id }: { data: any; id: string }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [tableName, setTableName] = useState(data.name)
    const [columns, setColumns] = useState(data.columns || [])

    const handleSave = () => {
        data.onUpdate({ name: tableName, columns })
        setIsEditing(false)
        toast.success('Tablo güncellendi')
    }

    const handleDelete = () => {
        data.onDelete(id)
    }

    const addColumn = () => {
        setColumns([...columns, { name: '', type: 'VARCHAR', nullable: true, primary: false }])
    }

    const updateColumn = (index: number, field: string, value: any) => {
        const newColumns = [...columns]
        newColumns[index] = { ...newColumns[index], [field]: value }
        setColumns(newColumns)
    }

    const removeColumn = (index: number) => {
        setColumns(columns.filter((_: any, i: number) => i !== index))
    }

    return (
        <Card className="w-64 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 shadow-lg relative">
            {/* Connection handles */}
            <Handle
                type="source"
                position={Position.Left}
                className="w-3 h-3 bg-blue-500 border-2 border-white dark:border-gray-800 hover:bg-blue-600 transition-colors"
                title="İlişki başlangıç noktası"
            />

            <Handle
                type="target"
                position={Position.Right}
                className="w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 hover:bg-green-600 transition-colors"
                title="İlişki bitiş noktası"
            />

            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                    <Table className="w-4 h-4" />
                    {isEditing ? (
                        <Input
                            value={tableName}
                            onChange={(e) => setTableName(e.target.value)}
                            className="h-6 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                    ) : (
                        <span>{tableName}</span>
                    )}
                    <div className="ml-auto flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className="h-6 w-6 p-0 dark:text-gray-300 dark:hover:text-white"
                            title="Düzenle"
                        >
                            <Settings className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDelete}
                            className="h-6 w-6 p-0 text-red-500 dark:text-red-400 hover:text-red-600"
                            title="Tabloyu Sil"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                {isEditing ? (
                    <div className="space-y-2">
                        {columns.map((column: any, index: number) => (
                            <div key={index} className="flex items-center gap-1 text-xs">
                                <Input
                                    value={column.name}
                                    onChange={(e) => updateColumn(index, 'name', e.target.value)}
                                    placeholder="Kolon adı"
                                    className="h-6 text-xs dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                />
                                <select
                                    value={column.type}
                                    onChange={(e) => updateColumn(index, 'type', e.target.value)}
                                    className="h-6 text-xs border rounded px-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                >
                                    <option value="VARCHAR">VARCHAR</option>
                                    <option value="INT">INT</option>
                                    <option value="BOOLEAN">BOOLEAN</option>
                                    <option value="DATE">DATE</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="DECIMAL">DECIMAL</option>
                                </select>
                                <input
                                    type="checkbox"
                                    checked={column.primary}
                                    onChange={(e) => updateColumn(index, 'primary', e.target.checked)}
                                    className="w-3 h-3 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <input
                                    type="checkbox"
                                    checked={column.nullable}
                                    onChange={(e) => updateColumn(index, 'nullable', e.target.checked)}
                                    className="w-3 h-3 dark:bg-gray-700 dark:border-gray-600"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeColumn(index)}
                                    className="h-6 w-6 p-0 text-red-500 dark:text-red-400"
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                        <Button onClick={addColumn} size="sm" className="w-full h-6 text-xs dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                            <Plus className="w-3 h-3 mr-1" />
                            Kolon Ekle
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {columns.map((column: any, index: number) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-900 dark:text-gray-100">{column.name}</span>
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-500 dark:text-gray-400">{column.type}</span>
                                    {column.primary && <span className="text-blue-500 dark:text-blue-400">PK</span>}
                                    {!column.nullable && <span className="text-red-500 dark:text-red-400">NOT NULL</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

const nodeTypes: NodeTypes = {
    tableNode: TableNode,
}

export default function DatabasePage() {
    const [databases, setDatabases] = useState<Database[]>([])
    const [selectedDatabase, setSelectedDatabase] = useState<Database | null>(null)
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [isAddingTable, setIsAddingTable] = useState(false)
    const [isAddingDatabase, setIsAddingDatabase] = useState(false)
    const [newTableName, setNewTableName] = useState('')
    const [newDatabaseName, setNewDatabaseName] = useState('')
    const [newDatabaseDescription, setNewDatabaseDescription] = useState('')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
    const [isEdgeTypeDialogOpen, setIsEdgeTypeDialogOpen] = useState(false)
    const [selectedEdgeType, setSelectedEdgeType] = useState('1:N')
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const reactFlowWrapper = useRef<HTMLDivElement>(null)

    // API'den veritabanlarını çek
    const fetchDatabases = useCallback(async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('Giriş yapmanız gerekiyor')
                return
            }

            console.log('Fetching databases from API...')

            const response = await fetch('http://localhost:8000/api/databases', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            console.log('API Response Status:', response.status)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('API Error Response:', errorData)
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            console.log('API Success Response:', data)
            setDatabases(data)
        } catch (error) {
            console.error('Veritabanları çekme hatası:', error)
            toast.error(`Veritabanları yüklenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
        } finally {
            setIsLoading(false)
        }
    }, [])

    // Veritabanı oluştur
    const addDatabase = async () => {
        if (!newDatabaseName.trim()) {
            toast.error('Veritabanı adı boş olamaz')
            return
        }

        try {
            setIsSaving(true)
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('Giriş yapmanız gerekiyor')
                return
            }

            const requestBody = {
                name: newDatabaseName,
                description: newDatabaseDescription,
                tables: [],
                relationships: []
            }

            console.log('API Request:', {
                url: 'http://localhost:8000/api/databases',
                method: 'POST',
                body: requestBody
            })

            const response = await fetch('http://localhost:8000/api/databases', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            })

            console.log('API Response Status:', response.status)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('API Error Response:', errorData)
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            const newDatabase = await response.json()
            console.log('API Success Response:', newDatabase)

            setDatabases([...databases, newDatabase])
            setNewDatabaseName('')
            setNewDatabaseDescription('')
            setIsAddingDatabase(false)
            toast.success('Veritabanı oluşturuldu')
        } catch (error) {
            console.error('Veritabanı oluşturma hatası:', error)
            toast.error(`Veritabanı oluşturulurken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
        } finally {
            setIsSaving(false)
        }
    }

    // Veritabanı güncelle
    const updateDatabase = async (databaseId: number, updatedData: any) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('Giriş yapmanız gerekiyor')
                return
            }

            console.log('Updating database:', databaseId, 'with data:', updatedData)

            const response = await fetch(`http://localhost:8000/api/databases/${databaseId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            })

            console.log('API Response Status:', response.status)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('API Error Response:', errorData)
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            const updatedDatabase = await response.json()
            console.log('API Success Response:', updatedDatabase)

            setDatabases(databases.map(db =>
                db.id === databaseId ? updatedDatabase : db
            ))

            return updatedDatabase
        } catch (error) {
            console.error('Veritabanı güncelleme hatası:', error)
            toast.error(`Veritabanı güncellenirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
            throw error
        }
    }

    // Veritabanı sil
    const deleteDatabase = async (databaseId: number) => {
        try {
            const token = localStorage.getItem('token')
            if (!token) {
                toast.error('Giriş yapmanız gerekiyor')
                return
            }

            console.log('Deleting database:', databaseId)

            const response = await fetch(`http://localhost:8000/api/databases/${databaseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            console.log('API Response Status:', response.status)

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                console.error('API Error Response:', errorData)
                throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
            }

            setDatabases(databases.filter(db => db.id !== databaseId))
            if (selectedDatabase?.id === databaseId) {
                backToDatabaseList()
            }
            toast.success('Veritabanı silindi')
        } catch (error) {
            console.error('Veritabanı silme hatası:', error)
            toast.error(`Veritabanı silinirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`)
        }
    }

    // Veritabanlarını yükle
    useEffect(() => {
        fetchDatabases()
    }, [fetchDatabases])

    // Dark mode kontrolü
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

    const onConnect = useCallback(
        (params: Connection) => {
            // Source ve target kontrolü
            if (!params.source || !params.target) {
                toast.error('Geçersiz bağlantı')
                return
            }

            // Aynı node'a bağlantı kurulmasını engelle
            if (params.source === params.target) {
                toast.error('Tabloyu kendisine bağlayamazsınız')
                return
            }

            // Zaten var olan bağlantıyı kontrol et
            const existingConnection = edges.find(
                edge => edge.source === params.source && edge.target === params.target
            )

            if (existingConnection) {
                toast.error('Bu tablolar arasında zaten bir ilişki var')
                return
            }

            const newEdge: Edge = {
                id: `edge-${Date.now()}`,
                source: params.source,
                target: params.target,
                sourceHandle: params.sourceHandle,
                targetHandle: params.targetHandle,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#3b82f6', strokeWidth: 2 },
                label: '1:N',
                labelStyle: { fill: '#3b82f6', fontWeight: 600 },
                labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
            }

            setEdges((eds) => addEdge(newEdge, eds))
            toast.success('İlişki oluşturuldu')
        },
        [setEdges, edges]
    )

    // İlişki silme
    const onEdgesDelete = useCallback(
        (edgesToDelete: Edge[]) => {
            setEdges((eds) => eds.filter(edge => !edgesToDelete.find(e => e.id === edge.id)))
            toast.success('İlişki silindi')
        },
        [setEdges]
    )

    // İlişki türü değiştirme
    const changeEdgeType = () => {
        if (!selectedEdge) return

        setEdges((eds) =>
            eds.map((edge) =>
                edge.id === selectedEdge.id
                    ? { ...edge, label: selectedEdgeType }
                    : edge
            )
        )
        setIsEdgeTypeDialogOpen(false)
        setSelectedEdge(null)
        toast.success('İlişki türü güncellendi')
    }

    // İlişki seçme
    const onEdgeClick = useCallback(
        (event: React.MouseEvent, edge: Edge) => {
            setSelectedEdge(edge)
            setSelectedEdgeType(edge.label as string || '1:N')
            setIsEdgeTypeDialogOpen(true)
        },
        []
    )

    // Veritabanı seç
    const selectDatabase = (database: Database) => {
        console.log('Selecting database:', database)
        console.log('Database tables:', database.tables)
        console.log('Database relationships:', database.relationships)

        setSelectedDatabase(database)

        // API'den gelen tablo verilerini ReactFlow node formatına dönüştür
        const flowNodes = database.tables.map((table: any) => ({
            id: String(table.id) || `table-${Date.now()}-${Math.random()}`,
            type: 'tableNode',
            position: table.position || { x: 100, y: 100 },
            data: {
                name: table.name,
                columns: table.columns || [],
                description: table.description || '',
                onUpdate: (updatedData: any) => {
                    setNodes((nds) =>
                        nds.map((node) =>
                            node.id === String(table.id) ? { ...node, data: { ...node.data, ...updatedData } } : node
                        )
                    )
                },
                onDelete: (nodeId: string) => {
                    // Tabloyu sil
                    setNodes((nds) => nds.filter(node => node.id !== nodeId))
                    // Bu tabloya ait ilişkileri de sil
                    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
                    toast.success('Tablo silindi')
                },
            },
        }))

        console.log('Created flow nodes:', flowNodes)

        // API'den gelen ilişki verilerini ReactFlow edge formatına dönüştür
        const flowEdges = database.relationships.map((rel: any) => ({
            id: String(rel.id) || `edge-${Date.now()}-${Math.random()}`,
            source: String(rel.source_table_id),
            target: String(rel.target_table_id),
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#3b82f6', strokeWidth: 2 },
            label: rel.relationship_type || '1:N',
            labelStyle: { fill: '#3b82f6', fontWeight: 600 },
            labelBgStyle: { fill: '#ffffff', fillOpacity: 0.8 },
        }))

        console.log('Created flow edges:', flowEdges)

        setNodes(flowNodes)
        setEdges(flowEdges)
    }

    // Veritabanı listesine geri dön
    const backToDatabaseList = () => {
        console.log('Going back to database list')
        console.log('Current nodes:', nodes)
        console.log('Current edges:', edges)

        // Local state'i güncelleme - bu değişiklikler kaydedilmemiş olabilir
        // Sadece seçili veritabanını temizle ve ReactFlow state'ini sıfırla
        setSelectedDatabase(null)
        setNodes([])
        setEdges([])
        setSelectedNode(null)

        // Veritabanı listesini API'den tekrar çek (güncel veriler için)
        fetchDatabases()
    }

    const addTable = () => {
        if (!newTableName.trim()) return

        const newNode: Node = {
            id: `table-${Date.now()}`,
            type: 'tableNode',
            position: { x: 100, y: 100 },
            data: {
                name: newTableName,
                columns: [
                    { name: 'id', type: 'INT', nullable: false, primary: true },
                    { name: 'created_at', type: 'DATE', nullable: false, primary: false },
                ],
                onUpdate: (updatedData: any) => {
                    setNodes((nds) =>
                        nds.map((node) =>
                            node.id === newNode.id ? { ...node, data: { ...node.data, ...updatedData } } : node
                        )
                    )
                },
                onDelete: (nodeId: string) => {
                    // Tabloyu sil
                    setNodes((nds) => nds.filter(node => node.id !== nodeId))
                    // Bu tabloya ait ilişkileri de sil
                    setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
                    toast.success('Tablo silindi')
                },
            },
        }

        setNodes((nds) => [...nds, newNode])
        setNewTableName('')
        setIsAddingTable(false)
        toast.success('Tablo eklendi')
    }

    // Tablo silme fonksiyonu
    const deleteTable = (nodeId: string) => {
        // Tabloyu sil
        setNodes((nds) => nds.filter(node => node.id !== nodeId))
        // Bu tabloya ait ilişkileri de sil
        setEdges((eds) => eds.filter(edge => edge.source !== nodeId && edge.target !== nodeId))
        toast.success('Tablo silindi')
    }

    // Tüm değişiklikleri kaydet
    const saveAllChanges = async () => {
        if (!selectedDatabase) return

        try {
            setIsSaving(true)

            // Kaydetme başladığında toast göster
            toast.info('Değişiklikler kaydediliyor...', {
                duration: 2000
            })

            // API'ye gönderilecek veriyi hazırla - tam olarak belirtilen formatta
            const updatedData = {
                name: selectedDatabase.name,
                description: selectedDatabase.description,
                tables: nodes.map(node => ({
                    id: node.id,
                    name: node.data.name,
                    columns: node.data.columns,
                    position: node.position,
                    description: node.data.description || ''
                })),
                relationships: edges.map(edge => ({
                    id: edge.id,
                    source_table_id: edge.source,
                    target_table_id: edge.target,
                    relationship_type: edge.label || '1:N',
                    edge_data: {
                        label: edge.label,
                        animated: edge.animated,
                        style: edge.style
                    }
                }))
            }

            console.log('Saving database with data:', updatedData)

            // API'ye gönder
            await updateDatabase(selectedDatabase.id, updatedData)

            // Veritabanı listesini güncelle
            fetchDatabases()

            // Başarılı kaydetme toast'u
            toast.success(`"${selectedDatabase.name}" veritabanı başarıyla kaydedildi!`, {
                description: `${nodes.length} tablo ve ${edges.length} ilişki kaydedildi`,
                duration: 5000
            })
        } catch (error) {
            console.error('Kaydetme hatası:', error)

            // Hata toast'u
            toast.error('Değişiklikler kaydedilemedi!', {
                description: error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu',
                duration: 6000
            })
        } finally {
            setIsSaving(false)
        }
    }

    const exportSchema = () => {
        if (!selectedDatabase) return

        const schema = {
            database: {
                name: selectedDatabase.name,
                description: selectedDatabase.description,
                created_at: selectedDatabase.created_at
            },
            tables: nodes.map((node) => ({
                name: node.data.name,
                columns: node.data.columns,
                position: node.position,
            })),
            relationships: edges.map((edge) => ({
                source: edge.source,
                target: edge.target,
                type: edge.type,
            })),
        }

        const dataStr = JSON.stringify(schema, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedDatabase.name}-schema.json`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('Şema dışa aktarıldı')
    }

    const importSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const schema = JSON.parse(e.target?.result as string)

                const importedNodes = schema.tables.map((table: any) => ({
                    id: `table-${Date.now()}-${Math.random()}`,
                    type: 'tableNode',
                    position: table.position || { x: 100, y: 100 },
                    data: {
                        name: table.name,
                        columns: table.columns,
                        onUpdate: (updatedData: any) => {
                            setNodes((nds) =>
                                nds.map((node) =>
                                    node.id === table.id ? { ...node, data: { ...node.data, ...updatedData } } : node
                                )
                            )
                        },
                    },
                }))

                setNodes(importedNodes)
                setEdges(schema.relationships || [])
                toast.success('Şema içe aktarıldı')
            } catch (error) {
                toast.error('Dosya okunamadı')
            }
        }
        reader.readAsText(file)
    }

    const generateSQL = () => {
        if (!selectedDatabase) return

        let sql = `-- ${selectedDatabase.name} Veritabanı\n`
        sql += `-- Oluşturulma: ${selectedDatabase.created_at ? new Date(selectedDatabase.created_at).toLocaleDateString('tr-TR') : 'Tarih yok'}\n\n`

        nodes.forEach((node) => {
            const tableName = node.data.name
            const columns = node.data.columns

            sql += `CREATE TABLE ${tableName} (\n`
            sql += columns.map((col: any) => {
                let columnDef = `  ${col.name} ${col.type}`
                if (!col.nullable) columnDef += ' NOT NULL'
                if (col.primary) columnDef += ' PRIMARY KEY'
                return columnDef
            }).join(',\n')
            sql += '\n);\n\n'
        })

        // İlişkiler için foreign key'ler
        edges.forEach((edge) => {
            const sourceTable = nodes.find(n => n.id === edge.source)?.data.name
            const targetTable = nodes.find(n => n.id === edge.target)?.data.name
            if (sourceTable && targetTable) {
                sql += `ALTER TABLE ${sourceTable} ADD CONSTRAINT fk_${sourceTable}_${targetTable} FOREIGN KEY (id) REFERENCES ${targetTable}(id);\n`
            }
        })

        const dataBlob = new Blob([sql], { type: 'text/plain' })
        const url = URL.createObjectURL(dataBlob)
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedDatabase.name}-schema.sql`
        link.click()
        URL.revokeObjectURL(url)
        toast.success('SQL dosyası oluşturuldu')
    }

    // Veritabanı listesi görünümü
    if (!selectedDatabase) {
        return (
            <div className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? "dark" : ""}`}>
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Veritabanı Yöneticisi</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleDarkMode}
                            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>

                        <Dialog open={isAddingDatabase} onOpenChange={setIsAddingDatabase}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Veritabanı Oluştur
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                                <DialogHeader>
                                    <DialogTitle className="text-gray-900 dark:text-white">Yeni Veritabanı Oluştur</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="dbName" className="text-gray-700 dark:text-gray-300">Veritabanı Adı</Label>
                                        <Input
                                            id="dbName"
                                            value={newDatabaseName}
                                            onChange={(e) => setNewDatabaseName(e.target.value)}
                                            placeholder="my_database, ecommerce_db..."
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dbDescription" className="text-gray-700 dark:text-gray-300">Açıklama</Label>
                                        <Textarea
                                            id="dbDescription"
                                            value={newDatabaseDescription}
                                            onChange={(e) => setNewDatabaseDescription(e.target.value)}
                                            placeholder="Veritabanının amacını açıklayın..."
                                            rows={3}
                                            className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                        />
                                    </div>
                                    <Button onClick={addDatabase} className="w-full" disabled={isSaving}>
                                        {isSaving ? 'Oluşturuluyor...' : 'Veritabanı Oluştur'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Veritabanı Listesi */}
                <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-300">Veritabanları yükleniyor...</p>
                        </div>
                    ) : databases.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <Database className="h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">Henüz veritabanı yok</h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">İlk veritabanınızı oluşturarak başlayın</p>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="lg">
                                        <Plus className="w-5 h-5 mr-2" />
                                        İlk Veritabanını Oluştur
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                                    <DialogHeader>
                                        <DialogTitle className="text-gray-900 dark:text-white">Yeni Veritabanı Oluştur</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="dbName" className="text-gray-700 dark:text-gray-300">Veritabanı Adı</Label>
                                            <Input
                                                id="dbName"
                                                value={newDatabaseName}
                                                onChange={(e) => setNewDatabaseName(e.target.value)}
                                                placeholder="my_database, ecommerce_db..."
                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="dbDescription" className="text-gray-700 dark:text-gray-300">Açıklama</Label>
                                            <Textarea
                                                id="dbDescription"
                                                value={newDatabaseDescription}
                                                onChange={(e) => setNewDatabaseDescription(e.target.value)}
                                                placeholder="Veritabanının amacını açıklayın..."
                                                rows={3}
                                                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                            />
                                        </div>
                                        <Button onClick={addDatabase} className="w-full" disabled={isSaving}>
                                            {isSaving ? 'Oluşturuluyor...' : 'Veritabanı Oluştur'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {databases.map((database) => (
                                <Card key={database.id} className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                                                <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                {database.name}
                                            </CardTitle>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    deleteDatabase(database.id)
                                                }}
                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent onClick={() => selectDatabase(database)}>
                                        <p className="text-gray-600 dark:text-gray-300 mb-4">{database.description || 'Açıklama yok'}</p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                                            <span>{database.tables.length} tablo</span>
                                            <span>{database.created_at ? new Date(database.created_at).toLocaleDateString('tr-TR') : 'Tarih yok'}</span>
                                        </div>
                                        <Button className="w-full mt-4" variant="outline">
                                            <FolderOpen className="w-4 h-4 mr-2" />
                                            Aç
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    // Veritabanı tasarım görünümü
    return (
        <div className={`h-screen flex flex-col transition-colors duration-200 ${isDarkMode ? "dark" : ""}`}>
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={backToDatabaseList}
                        className="mr-2 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Geri
                    </Button>
                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedDatabase.name}</h1>
                    <span className="text-sm text-gray-500 dark:text-gray-400">({selectedDatabase.description})</span>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleDarkMode}
                        className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </Button>

                    <Button
                        variant="outline"
                        onClick={saveAllChanges}
                        disabled={isSaving}
                        className="text-green-600 dark:text-green-400 border-green-600 dark:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Kaydediliyor...' : 'Tümünü Kaydet'}
                    </Button>

                    <Dialog open={isAddingTable} onOpenChange={setIsAddingTable}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Tablo Ekle
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-white">Yeni Tablo Ekle</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="tableName" className="text-gray-700 dark:text-gray-300">Tablo Adı</Label>
                                    <Input
                                        id="tableName"
                                        value={newTableName}
                                        onChange={(e) => setNewTableName(e.target.value)}
                                        placeholder="users, products, orders..."
                                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder:text-gray-400"
                                    />
                                </div>
                                <Button onClick={addTable} className="w-full">
                                    Tablo Oluştur
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button variant="outline" onClick={generateSQL}>
                        <Download className="w-4 h-4 mr-2" />
                        SQL Oluştur
                    </Button>

                    <Button variant="outline" onClick={exportSchema}>
                        <Save className="w-4 h-4 mr-2" />
                        Dışa Aktar
                    </Button>

                    <div className="relative">
                        <input
                            type="file"
                            accept=".json"
                            onChange={importSchema}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline">
                            <Upload className="w-4 h-4 mr-2" />
                            İçe Aktar
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1" ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onEdgesDelete={onEdgesDelete}
                    nodeTypes={nodeTypes}
                    onNodeClick={(_, node) => setSelectedNode(node)}
                    onEdgeClick={onEdgeClick}
                    fitView
                    className="bg-gray-50 dark:bg-gray-900"
                >
                    <Controls className="dark:bg-gray-800 dark:border-gray-700" />
                    <Background className="dark:bg-gray-900" />
                    <MiniMap className="dark:bg-gray-800 dark:border-gray-700" />
                </ReactFlow>
            </div>

            {/* Sidebar */}
            {selectedNode && (
                <div className="absolute right-4 top-20 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4">
                    <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Tablo Detayları</h3>
                    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                        <p><strong>Tablo:</strong> {selectedNode.data.name}</p>
                        <p><strong>Kolon Sayısı:</strong> {selectedNode.data.columns?.length || 0}</p>
                        <p><strong>Pozisyon:</strong> X: {Math.round(selectedNode.position.x)}, Y: {Math.round(selectedNode.position.y)}</p>
                    </div>
                </div>
            )}

            {/* İlişki türü değiştirme dialogı */}
            <Dialog open={isEdgeTypeDialogOpen} onOpenChange={setIsEdgeTypeDialogOpen}>
                <DialogContent className="dark:bg-gray-800 dark:border-gray-700">
                    <DialogHeader>
                        <DialogTitle className="text-gray-900 dark:text-white">İlişki Yönetimi</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="edgeType" className="text-gray-700 dark:text-gray-300">İlişki Türü</Label>
                            <Select
                                value={selectedEdgeType}
                                onValueChange={(value) => setSelectedEdgeType(value)}
                            >
                                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                    <SelectValue placeholder="İlişki türü seçin..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1:N">1:N</SelectItem>
                                    <SelectItem value="N:1">N:1</SelectItem>
                                    <SelectItem value="M:N">M:N</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={changeEdgeType} className="flex-1">
                                İlişki Türünü Değiştir
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (selectedEdge) {
                                        setEdges((eds) => eds.filter(edge => edge.id !== selectedEdge.id))
                                        setIsEdgeTypeDialogOpen(false)
                                        setSelectedEdge(null)
                                        toast.success('İlişki silindi')
                                    }
                                }}
                                className="flex-1"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                İlişkiyi Sil
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
} 