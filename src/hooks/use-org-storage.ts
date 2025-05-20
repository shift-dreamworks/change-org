import { useState, useEffect } from 'react';
import { Node, Edge } from 'reactflow';

interface OrgChartData {
  name: string;
  nodes: Node[];
  edges: Edge[];
  createdAt: number;
  updatedAt: number;
}

interface UseOrgStorageReturn {
  savedCharts: OrgChartData[];
  saveChart: (name: string, nodes: Node[], edges: Edge[]) => void;
  loadChart: (name: string) => OrgChartData | null;
  deleteChart: (name: string) => void;
  chartExists: (name: string) => boolean;
}

const STORAGE_KEY = 'org-charts';

export function useOrgStorage(): UseOrgStorageReturn {
  const [savedCharts, setSavedCharts] = useState<OrgChartData[]>([]);

  useEffect(() => {
    const storedCharts = localStorage.getItem(STORAGE_KEY);
    if (storedCharts) {
      try {
        const parsedCharts = JSON.parse(storedCharts);
        setSavedCharts(parsedCharts);
      } catch (error) {
        console.error('Failed to parse stored charts:', error);
        setSavedCharts([]);
      }
    }
  }, []);

  const saveChart = (name: string, nodes: Node[], edges: Edge[]) => {
    const now = Date.now();
    const newChart: OrgChartData = {
      name,
      nodes,
      edges,
      createdAt: now,
      updatedAt: now,
    };

    const chartIndex = savedCharts.findIndex(chart => chart.name === name);
    let updatedCharts: OrgChartData[];

    if (chartIndex >= 0) {
      updatedCharts = [...savedCharts];
      updatedCharts[chartIndex] = {
        ...newChart,
        createdAt: savedCharts[chartIndex].createdAt, // 作成日は保持
      };
    } else {
      updatedCharts = [...savedCharts, newChart];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharts));
    setSavedCharts(updatedCharts);
  };

  const loadChart = (name: string): OrgChartData | null => {
    const chart = savedCharts.find(chart => chart.name === name);
    return chart || null;
  };

  const deleteChart = (name: string) => {
    const updatedCharts = savedCharts.filter(chart => chart.name !== name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCharts));
    setSavedCharts(updatedCharts);
  };

  const chartExists = (name: string): boolean => {
    return savedCharts.some(chart => chart.name === name);
  };

  return { savedCharts, saveChart, loadChart, deleteChart, chartExists };
}
