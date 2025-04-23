import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { useState } from 'react'
import { useGetJobDistributionList } from '@/app/(auth)/dashboard/hooks/use-get-job-distribution-list'
import { jobCategoryMap } from '@/shared/constants/game'
import { cn } from '@/lib/utils'

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

export function JobClassChart({theme}:{theme: "light" | "dark"}) {
  const { data } = useGetJobDistributionList();
  const [hoveredItem, setHoveredItem] = useState<ChartDataItem | null>(null);

  // 대표 + 서브 합쳐서 카테고리별 정리
  const chartData: ChartDataItem[] = data?.map((item) => {
    const mapping = jobCategoryMap[item.job];
    if (!mapping) return null;
    return {
      name: item.job,
      value: item.representCount,
      color: mapping.color,
    };
  }).filter((d): d is ChartDataItem => d !== null) ?? [];

  const chartConfig = chartData.reduce<Record<string, { color: string; label: string }>>((config, item) => {
    config[item.name] = { color: item.color, label: item.name };
    return config;
  }, {});

  const onRadarEnter = (e: { activePayload: { index: number; }[]; })  => {
    const index = e.activePayload?.[0]?.index;  // e.activePayload에서 index 값을 추출
    if (index !== undefined) {
      setHoveredItem(chartData[index]);
    }
  };

  const onRadarLeave = () => {
    setHoveredItem(null);
  };

  return (
    <ChartContainer className="h-full w-full" config={chartConfig}>
      <ResponsiveContainer width="100%" height="320px" minWidth={280}>
        <RadarChart outerRadius="80%" width={320} height={400} data={chartData}>
          <PolarGrid
            stroke={theme === "light" ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"}
          />
          <PolarAngleAxis
            dataKey="name"
            tick={{
              fill: theme === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)",
              stroke: theme === "light" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.4)",
              fontSize: 11,
            }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
          <Radar
            name="직업분포"
            dataKey="value"
            stroke={theme === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)"}  // 선택된 아이템 색상
            fill={theme === "light" ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.6)"}
            fillOpacity={1}
            strokeWidth={1}  // 선택된 아이템 두께
            onMouseEnter={onRadarEnter}
            onMouseLeave={onRadarLeave}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const payloadObj = payload[0];
                return (
                  <div className="border border-gray-300 rounded-lg shadow-lg p-2 bg-gradient-to-br from-background/90 to-background/70 max-w-xs mx-auto">
                    <div className="font-medium text-sm text-foreground">{payloadObj.payload.name}</div>
                    <div className={cn("text-xs font-semibold", theme === "light" ? "text-yellow-700":"text-primary")}>{payloadObj.value}명</div>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.3)' }}
          />
          <Legend
            layout="vertical"
            verticalAlign="top"
            align="right"
            wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
          {hoveredItem && (
            <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-background/90 to-background/70 shadow-lg max-w-xs mx-auto text-center">
              <div className="font-medium text-sm text-foreground">직업명: {hoveredItem.name}</div>
              <div className="text-xs font-semibold text-primary">{hoveredItem.value}명</div>
            </div>
          )}
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
