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

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [setEdges])

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
        </div>
        
        {/* メインエリア - ReactFlow */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export default App
