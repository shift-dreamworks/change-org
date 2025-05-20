import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

interface OrgNodeProps {
  data: {
    name: string;
    title: string;
    department: string;
  };
  isConnectable?: boolean;
}

const OrgNode = ({ data, isConnectable = true }: OrgNodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-gray-200 min-w-[180px]">
      {/* 上部の接続ハンドル */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
      
      {/* ノードの内容 */}
      <div className="flex flex-col items-center">
        <div className="text-xs font-light text-gray-500 mb-1">{data.department}</div>
        <div className="text-lg font-bold">{data.name}</div>
        <div className="text-sm text-gray-600">{data.title}</div>
      </div>
      
      {/* 下部の接続ハンドル */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-2 h-2 bg-blue-500"
      />
    </div>
  );
};

export default memo(OrgNode);
