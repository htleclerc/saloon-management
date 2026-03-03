export const workerTrendData = [
    { name: "This Month", performance: 85, key: "team.analytics.trend.thisMonth" },
    { name: "Last Month", performance: 78, key: "team.analytics.trend.lastMonth" },
    { name: "2 Months ago", performance: 82, key: "team.analytics.trend.twoMonthsAgo" },
];

export const workerDistributionData = [
    { name: "Experts", value: 2, color: "#8B5CF6", key: "team.analytics.dist.experts" },
    { name: "Intermediates", value: 1, color: "#10B981", key: "team.analytics.dist.intermediates" },
    { name: "Beginners", value: 0, color: "#F59E0B", key: "team.analytics.dist.beginners" },
];

export const recentWorkerActivity = [
    {
        id: 1,
        type: "payout",
        titleKey: "team.activity.payoutGenerated",
        descKey: "team.activity.payoutGeneratedDesc",
        params: { name: "Orphelia Brandy" },
        timeKey: "team.activity.times.1hour",
        icon: "dollar-sign",
        color: "bg-green-500"
    },
    {
        id: 2,
        type: "update",
        titleKey: "team.activity.workerUpdated",
        descKey: "team.activity.workerUpdatedDesc",
        params: { name: "Jean Dupont" },
        timeKey: "team.activity.times.3hours",
        icon: "user",
        color: "bg-blue-500"
    }
];
