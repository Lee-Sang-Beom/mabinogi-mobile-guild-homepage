import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { ChartContainer } from '@/components/ui/chart'
import { MouseEvent, useState } from 'react'
import { JobTypeOptions } from '@/shared/constants/game'

// 차트 데이터 인터페이스 정의
interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

// 직업 분포 데이터를 생성하는 함수
const generateJobDistributionData = (): ChartDataItem[] => {
  const jobCategories = {
    warrior: ["전사", "대검전사", "검술사", "견습 전사"],
    archer: ["궁수", "석궁사수", "장궁병", "견습 궁수"],
    mage: ["마법사", "화염술사", "빙결술사", "견습 마법사"],
    healer: ["힐러", "사제", "수도사"],
    bard: ["음유시인", "댄서", "악사", "견습 음유시인"],
  };

  const colorSchemes = {
    warrior: ["#d30505", "#e12020", "#fa5050", "#f46b6b"],
    archer: ["#02732b", "#0daa46", "#23d162", "#71f6a0"],
    mage: ["#1267ec", "#3790ff", "#68b1ff", "#7ab4f6"],
    healer: ["#f59e0b", "#fbbf24", "#fcd34d", "#fef08a"],
    bard: ["#8200ff", "#911bff", "#a149ff", "#b06cff"],
  };

  const jobColorMap: Record<string, string> = {};
  Object.entries(jobCategories).forEach(([category, jobs]) => {
    const colors = colorSchemes[category as keyof typeof colorSchemes];
    jobs.forEach((job, jobIndex) => {
      jobColorMap[job] = colors[jobIndex % colors.length];
    });
  });

  const totalMembers = 120;
  const data = JobTypeOptions.map((job) => {
    let count;
    if (job.name.includes("견습")) {
      count = Math.floor(Math.random() * 5) + 1;
    } else if (["전사", "궁수", "마법사", "힐러", "음유시인"].includes(job.name)) {
      count = Math.floor(Math.random() * 10) + 8;
    } else {
      count = Math.floor(Math.random() * 8) + 3;
    }

    return {
      name: job.name,
      value: count,
      color: jobColorMap[job.name],
    };
  });

  const currentTotal = data.reduce((sum, item) => sum + item.value, 0);
  const adjustmentFactor = totalMembers / currentTotal;

  return data.map((item) => ({
    ...item,
    value: Math.round(item.value * adjustmentFactor),
  }));
};

// 데이터 생성
const jobDistributionData = generateJobDistributionData();

interface JobClassChartProps {
  data?: ChartDataItem[];
}

export function JobClassChart({ data = jobDistributionData }: JobClassChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const chartConfig = data.reduce<Record<string, { color?: string; label?: string }>>((config, item) => {
    return {
      ...config,
      [item.name]: { color: item.color, label: item.name },
    };
  }, {});

  const onPieEnter = (_event: MouseEvent<SVGPathElement>, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  const totalMembers = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ChartContainer className="h-full w-full" config={chartConfig}>
      <ResponsiveContainer width="100%" height="400px">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={80}
            outerRadius={120}
            paddingAngle={1}
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
            onMouseLeave={onPieLeave}
            animationDuration={1000}
            animationBegin={0}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="rgba(255,255,255,0.3)"
                strokeWidth={activeIndex === index ? 2 : 1}
                style={{
                  filter: activeIndex === index ? "drop-shadow(0 0 4px rgba(0,0,0,0.3))" : "none",
                  transform: activeIndex === index ? "scale(1.1)" : "scale(1)",
                  transformOrigin: "center",
                  transition: "transform 0.3s ease, filter 0.3s ease", // transition 속성 수정
                }}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const { name, value } = payload[0];
                return (
                  <div className="border border-gray-300 rounded-lg shadow-lg p-2 bg-gradient-to-br from-background/90 to-background/70 max-w-xs mx-auto">
                    <div className="font-medium text-sm text-foreground">{name}</div>
                    <div className="text-xs font-semibold text-primary">{value}명</div>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ fill: "rgba(255, 255, 255, 0.3)" }}
          />
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            wrapperStyle={{ fontSize: "10px", marginTop: "10px" }}
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
          <text x="50%" y="33%" textAnchor="middle" dominantBaseline="middle" className="fill-foreground font-medium">
            총 길드원
          </text>
          <text
            x="50%"
            y="40%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-lg font-bold"
          >
            {totalMembers}명
          </text>
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
