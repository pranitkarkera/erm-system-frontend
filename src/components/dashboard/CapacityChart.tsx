import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { User } from "../../types";
import { formatCapacityPercentage } from "../../lib/utils";

interface CapacityChartProps {
  engineers: User[];
  capacityData: Record<
    string,
    {
      allocatedCapacity: number;
      totalCapacity: number;
    }
  >;
}

export function CapacityChart({
  engineers = [],
  capacityData = {},
}: CapacityChartProps) {
  // Defensive: Only include engineers with capacity data
  const data = (engineers || []).map((engineer) => {
    const capacity = capacityData[engineer._id] || {
      allocatedCapacity: 0,
      totalCapacity: engineer.maxCapacity || 100,
    };
    return {
      name: engineer.name,
      allocated: capacity.allocatedCapacity || 0,
      available:
        (capacity.totalCapacity || 0) - (capacity.allocatedCapacity || 0),
      total: capacity.totalCapacity || 0,
    };
  });

  // Show a loader or message if no data
  if (!data.length || data.every((d) => d.total === 0)) {
    return (
      <div className="text-center text-gray-500 py-8">
        No capacity data to display.
      </div>
    );
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: any[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded shadow">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Allocated: {formatCapacityPercentage(payload[0].value)}
          </p>
          <p className="text-sm text-gray-600">
            Available: {formatCapacityPercentage(payload[1].value)}
          </p>
          <p className="text-sm text-gray-600">
            Total:{" "}
            {formatCapacityPercentage(payload[0].value + payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 40,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            interval={0}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar
            dataKey="allocated"
            stackId="a"
            fill="#4f46e5"
            name="Allocated"
          />
          <Bar
            dataKey="available"
            stackId="a"
            fill="#9ca3af"
            name="Available"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
