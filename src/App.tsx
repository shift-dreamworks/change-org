import { useState, useCallback } from 'react'
import ReactFlow, { 
  MiniMap, 
  Controls, 
  Background, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from 'reactflow'
import 'reactflow/dist/style.css'
import './App.css'
import OrgNode from './components/org-chart/OrgNode'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from './components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './components/ui/alert-dialog'
import { Button } from './components/ui/button'
import { useOrgStorage } from './hooks/use-org-storage'

const nodeTypes = {
  orgNode: OrgNode
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'orgNode',
    position: { x: 250, y: 5 },
    data: { 
      name: '山田太郎',
      title: '代表取締役社長',
      department: '経営部'
    }
  },
  {
    id: '2',
    type: 'orgNode',
    position: { x: 100, y: 100 },
    data: { 
      name: '佐藤次郎',
      title: '取締役',
      department: '営業部'
    }
  },
  {
    id: '3',
    type: 'orgNode',
    position: { x: 400, y: 100 },
    data: { 
      name: '鈴木花子',
      title: '取締役',
      department: '技術部'
    }
  },
  {
    id: '4',
    type: 'orgNode',
    position: { x: 100, y: 200 },
    data: { 
      name: '高橋健太',
      title: '部長',
      department: '営業部'
    }
  },
  {
    id: '5',
    type: 'orgNode',
    position: { x: 400, y: 200 },
    data: { 
      name: '伊藤誠',
      title: '部長',
      department: '技術部'
    }
  }
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e1-3', source: '1', target: '3' },
  { id: 'e2-4', source: '2', target: '4' },
  { id: 'e3-5', source: '3', target: '5' }
]

function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [nodeName, setNodeName] = useState('')
  const [nodeTitle, setNodeTitle] = useState('')
  const [nodeDepartment, setNodeDepartment] = useState('')
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [editNodeName, setEditNodeName] = useState('')
  const [editNodeTitle, setEditNodeTitle] = useState('')
  const [editNodeDepartment, setEditNodeDepartment] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null)
  
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [chartName, setChartName] = useState('')
  const [overwriteDialogOpen, setOverwriteDialogOpen] = useState(false)
  const [selectedChartToLoad, setSelectedChartToLoad] = useState<string | null>(null)
  
  const { savedCharts, saveChart, loadChart, deleteChart, chartExists } = useOrgStorage()

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node)
    if (node.data) {
      setEditNodeName(node.data.name || '')
      setEditNodeTitle(node.data.title || '')
      setEditNodeDepartment(node.data.department || '')
    }
  }, [])

  const closeEditModal = useCallback(() => {
    setSelectedNode(null)
  }, [])

  const updateNode = useCallback(() => {
    if (!selectedNode) return

    const updatedNodes = nodes.map(node => {
      if (node.id === selectedNode.id) {
        return {
          ...node,
          data: {
            ...node.data,
            name: editNodeName,
            title: editNodeTitle,
            department: editNodeDepartment
          }
        }
      }
      return node
    })

    setNodes(updatedNodes)
    setSelectedNode(null)
  }, [selectedNode, nodes, setNodes, editNodeName, editNodeTitle, editNodeDepartment])

  const openDeleteConfirm = useCallback((nodeId: string) => {
    setNodeToDelete(nodeId)
    setDeleteConfirmOpen(true)
    setSelectedNode(null) // 編集モーダルを閉じる
  }, [])

  const deleteNode = useCallback(() => {
    if (!nodeToDelete) return

    const newEdges = edges.filter(
      edge => edge.source !== nodeToDelete && edge.target !== nodeToDelete
    )

    const newNodes = nodes.filter(node => node.id !== nodeToDelete)

    setEdges(newEdges)
    setNodes(newNodes)
    setDeleteConfirmOpen(false)
    setNodeToDelete(null)
  }, [nodeToDelete, edges, nodes, setEdges, setNodes])

  const openSaveDialog = useCallback(() => {
    setSaveDialogOpen(true)
    setChartName('')
  }, [])

  const handleSaveChart = useCallback(() => {
    if (!chartName.trim()) return

    if (chartExists(chartName)) {
      setOverwriteDialogOpen(true)
      return
    }

    saveChart(chartName, nodes, edges)
    setSaveDialogOpen(false)
  }, [chartName, nodes, edges, saveChart, chartExists])

  const confirmOverwrite = useCallback(() => {
    saveChart(chartName, nodes, edges)
    setOverwriteDialogOpen(false)
    setSaveDialogOpen(false)
  }, [chartName, nodes, edges, saveChart])

  const openLoadDialog = useCallback(() => {
    setLoadDialogOpen(true)
    setSelectedChartToLoad(null)
  }, [])

  const selectChartToLoad = useCallback((name: string) => {
    setSelectedChartToLoad(name)
  }, [])

  const handleLoadChart = useCallback(() => {
    if (!selectedChartToLoad) return

    const chart = loadChart(selectedChartToLoad)
    if (chart) {
      setNodes(chart.nodes)
      setEdges(chart.edges)
      setLoadDialogOpen(false)
    }
  }, [selectedChartToLoad, loadChart, setNodes, setEdges])

  const handleDeleteSavedChart = useCallback((name: string) => {
    deleteChart(name)
    if (selectedChartToLoad === name) {
      setSelectedChartToLoad(null)
    }
  }, [deleteChart, selectedChartToLoad])

  const addNode = () => {
    if (!nodeName || !nodeTitle || !nodeDepartment) return

    const newNode: Node = {
      id: (nodes.length + 1).toString(),
      type: 'orgNode',
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      data: {
        name: nodeName,
        title: nodeTitle,
        department: nodeDepartment
      }
    }

    setNodes((nds) => nds.concat(newNode))
    setNodeName('')
    setNodeTitle('')
    setNodeDepartment('')
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <header className="bg-slate-800 text-white p-4">
        <h1 className="text-2xl font-bold">組織図作成ツール</h1>
      </header>
      
      <div className="flex flex-1">
        {/* サイドバー */}
        <div className="w-64 bg-slate-100 p-4 border-r">
          <h2 className="text-lg font-semibold mb-4">新規ノード追加</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">名前</label>
              <input
                type="text"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="例: 山田太郎"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">役職</label>
              <input
                type="text"
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="例: 部長"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">部署</label>
              <input
                type="text"
                value={nodeDepartment}
                onChange={(e) => setNodeDepartment(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="例: 営業部"
              />
            </div>
            <button
              onClick={addNode}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              ノードを追加
            </button>
          </div>
          
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-2">操作方法</h2>
            <ul className="text-sm space-y-1">
              <li>• ノードをドラッグして移動</li>
              <li>• ノード間をドラッグして接続</li>
              <li>• ホイールでズーム</li>
              <li>• 背景をドラッグでパン</li>
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">データ管理</h2>
            <div className="space-y-2">
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={openSaveDialog}
              >
                現在の組織図を保存
              </Button>
              <Button 
                className="w-full" 
                variant="outline" 
                onClick={openLoadDialog}
              >
                保存した組織図を読み込む
              </Button>
            </div>
          </div>
        </div>
        
        {/* メインエリア - ReactFlow */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
      </div>

      {/* ノード編集モーダル */}
      <Dialog open={selectedNode !== null} onOpenChange={open => !open && closeEditModal()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ノードを編集</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right text-sm font-medium">
                名前
              </label>
              <input
                id="name"
                value={editNodeName}
                onChange={(e) => setEditNodeName(e.target.value)}
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="title" className="text-right text-sm font-medium">
                役職
              </label>
              <input
                id="title"
                value={editNodeTitle}
                onChange={(e) => setEditNodeTitle(e.target.value)}
                className="col-span-3 p-2 border rounded"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="department" className="text-right text-sm font-medium">
                部署
              </label>
              <input
                id="department"
                value={editNodeDepartment}
                onChange={(e) => setEditNodeDepartment(e.target.value)}
                className="col-span-3 p-2 border rounded"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={() => selectedNode && openDeleteConfirm(selectedNode.id)}>
              削除
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={closeEditModal}>
                キャンセル
              </Button>
              <Button onClick={updateNode}>
                保存
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ノードを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              このノードを削除すると、関連するすべての接続も削除されます。
              この操作は元に戻せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={deleteNode} className="bg-red-600 hover:bg-red-700">
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 保存ダイアログ */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>組織図を保存</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="chartName" className="text-right text-sm font-medium">
                組織図の名前
              </label>
              <input
                id="chartName"
                value={chartName}
                onChange={(e) => setChartName(e.target.value)}
                className="col-span-3 p-2 border rounded"
                placeholder="例: 2023年第4四半期"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleSaveChart} disabled={!chartName.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 上書き確認ダイアログ */}
      <AlertDialog open={overwriteDialogOpen} onOpenChange={setOverwriteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>上書き確認</AlertDialogTitle>
            <AlertDialogDescription>
              「{chartName}」という名前の組織図は既に存在します。上書きしますか？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOverwriteDialogOpen(false)}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmOverwrite}>
              上書きする
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 読み込みダイアログ */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>保存した組織図を読み込む</DialogTitle>
          </DialogHeader>
          {savedCharts.length === 0 ? (
            <div className="py-6 text-center text-zinc-500">
              保存された組織図がありません
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto border rounded">
              <table className="w-full border-collapse">
                <thead className="bg-slate-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left font-medium border-b">名前</th>
                    <th className="p-2 text-left font-medium border-b">更新日時</th>
                    <th className="p-2 text-center font-medium border-b">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {savedCharts.map((chart) => (
                    <tr 
                      key={chart.name} 
                      className={`border-b hover:bg-slate-50 ${
                        selectedChartToLoad === chart.name ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => selectChartToLoad(chart.name)}
                    >
                      <td className="p-2">{chart.name}</td>
                      <td className="p-2 text-sm">
                        {new Date(chart.updatedAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="p-2 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSavedChart(chart.name);
                          }}
                        >
                          削除
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoadDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={handleLoadChart} 
              disabled={!selectedChartToLoad || savedCharts.length === 0}
            >
              読み込む
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App
