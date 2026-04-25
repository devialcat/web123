import { useMemo, useState } from "react";
import {
  useGetAdminSummary,
  useListBookings,
  useUpdateBookingStatus,
  getListBookingsQueryKey,
  getGetAdminSummaryQueryKey,
} from "@workspace/api-client-react";
import type { BookingStatus, City } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useT, useLanguage } from "@/i18n/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { cityLabel } from "@/lib/localize";
import { Calendar, DollarSign, ListChecks, Clock4 } from "lucide-react";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "#EAB308",
  confirmed: "#0EA5E9",
  completed: "#10B981",
  cancelled: "#EF4444",
};

const statusBadgeClasses: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

type StatusFilter = "all" | BookingStatus;

export default function Admin() {
  const { t } = useT();
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { data: summary } = useGetAdminSummary();
  const { data: bookings } = useListBookings(
    filter === "all" ? undefined : { status: filter },
  );
  const updateStatus = useUpdateBookingStatus();

  const handleStatusChange = async (id: string, status: BookingStatus) => {
    await updateStatus.mutateAsync({ id, data: { status } });
    queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
    queryClient.invalidateQueries({
      queryKey: getListBookingsQueryKey({ status: filter === "all" ? undefined : filter }),
    });
    queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
  };

  const chartData = useMemo(() => {
    if (!summary) return [];
    return summary.statusBreakdown
      .filter((s) => s.count > 0)
      .map((s) => ({
        name: t(`admin.${s.status}`),
        value: s.count,
        status: s.status,
      }));
  }, [summary, t]);

  return (
    <div className="container py-12">
      <h1 className="font-serif text-3xl md:text-4xl font-bold mb-8">
        {t("admin.dashboard")}
      </h1>

      {summary && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.totalBookings")}
                  </p>
                  <ListChecks className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-serif text-3xl font-bold" data-testid="stat-total-bookings">
                  {summary.totalBookings}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.upcoming")}
                  </p>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-serif text-3xl font-bold">
                  {summary.upcomingTrips}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.revenue")}
                  </p>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-serif text-3xl font-bold">
                  ${summary.totalRevenueUsd}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    {t("admin.pending")}
                  </p>
                  <Clock4 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="font-serif text-3xl font-bold">
                  {summary.pendingBookings}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart + Recent */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-bold mb-4">
                  {t("admin.status")}
                </h3>
                {chartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-12 text-center">
                    No bookings yet.
                  </p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                        >
                          {chartData.map((entry) => (
                            <Cell
                              key={entry.status}
                              fill={STATUS_COLORS[entry.status]}
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-serif text-lg font-bold mb-4">
                  {t("admin.recentBookings")}
                </h3>
                {summary.recentBookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No bookings yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {summary.recentBookings.slice(0, 5).map((b) => (
                      <li
                        key={b.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div>
                          <p className="font-medium">{b.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {b.startDate} → {b.endDate}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusBadgeClasses[b.status]}
                        >
                          {t(`admin.${b.status}`)}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold">All Bookings</h3>
            <Tabs
              value={filter}
              onValueChange={(v) => setFilter(v as StatusFilter)}
            >
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">{t("admin.pending")}</TabsTrigger>
                <TabsTrigger value="confirmed">{t("admin.confirmed")}</TabsTrigger>
                <TabsTrigger value="completed">{t("admin.completed")}</TabsTrigger>
                <TabsTrigger value="cancelled">{t("admin.cancelled")}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("admin.customer")}</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>{t("admin.dates")}</TableHead>
                  <TableHead>People</TableHead>
                  <TableHead>Cities</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>{t("admin.status")}</TableHead>
                  <TableHead>{t("admin.action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No bookings.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings?.map((b) => (
                    <TableRow key={b.id} data-testid={`row-booking-${b.id}`}>
                      <TableCell className="font-medium">{b.customerName}</TableCell>
                      <TableCell className="text-xs">
                        <div>{b.customerEmail}</div>
                        <div className="text-muted-foreground">{b.customerPhone}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{b.startDate}</div>
                        <div className="text-muted-foreground">{b.endDate}</div>
                      </TableCell>
                      <TableCell>{b.peopleCount}</TableCell>
                      <TableCell className="text-xs">
                        {b.cities.map((c: City) => cityLabel(c, language)).join(", ")}
                      </TableCell>
                      <TableCell className="font-medium">${b.totalUsd}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusBadgeClasses[b.status]}
                        >
                          {t(`admin.${b.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={b.status}
                          onValueChange={(v) =>
                            handleStatusChange(b.id, v as BookingStatus)
                          }
                        >
                          <SelectTrigger className="w-32" data-testid={`select-status-${b.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{t("admin.pending")}</SelectItem>
                            <SelectItem value="confirmed">{t("admin.confirmed")}</SelectItem>
                            <SelectItem value="completed">{t("admin.completed")}</SelectItem>
                            <SelectItem value="cancelled">{t("admin.cancelled")}</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
