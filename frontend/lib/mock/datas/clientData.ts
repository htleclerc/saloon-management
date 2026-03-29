export const clientTrendData = [
    { name: "This Month", clients: 8, key: "clients.trend.thisMonth" },
    { name: "Last Month", clients: 42, key: "clients.trend.lastMonth" },
    { name: "2 Months ago", clients: 347, key: "clients.trend.twoMonthsAgo" },
];

export const clientDistributionData = [
    { name: "Regular Clients", value: 123854, color: "#8B5CF6", key: "clients.distribution.regular" },
    { name: "Occasional Clients", value: 104143, color: "#EC4899", key: "clients.distribution.occasional" },
    { name: "New Clients", value: 95643, color: "#F59E0B", key: "clients.distribution.new" },
    { name: "Above The Month", value: 84854, color: "#10B981", key: "clients.distribution.aboveMonth" },
    { name: "Inactive Members", value: 78163, color: "#6B7280", key: "clients.distribution.inactive" },
];

export const recentClientActivity = [
    {
        id: 1,
        type: "registration",
        titleKey: "clients.activity.newRegistration",
        descKey: "clients.activity.newRegistrationDesc",
        params: { name: "Marie Smith" },
        timeKey: "clients.activity.times.2hours",
        icon: "plus",
        color: "bg-green-500"
    },
    {
        id: 2,
        type: "update",
        titleKey: "clients.activity.infoUpdated",
        descKey: "clients.activity.infoUpdatedDesc",
        params: { name: "James Clerk" },
        timeKey: "clients.activity.times.5hours",
        icon: "edit",
        color: "bg-blue-500"
    }
];
