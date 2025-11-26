'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface AnalyticsChartsProps {
    tickets: Ticket[];
}

export default function AnalyticsCharts({ tickets }: AnalyticsChartsProps) {
    // Process data for Bar Chart (Tickets by Category)
    const categoryData = [
        { name: 'Curriculum', value: tickets.filter(t => t.category === 'curriculum').length },
        { name: 'Facility', value: tickets.filter(t => t.category === 'facility').length },
        { name: 'Placement', value: tickets.filter(t => t.category === 'placement').length },
        { name: 'Other', value: tickets.filter(t => t.category === 'other').length },
    ];

    // Process data for Pie Chart (Tickets by Priority)
    const priorityData = [
        { name: 'High', value: tickets.filter(t => t.priority === 'high').length, color: '#ef4444' }, // red-500
        { name: 'Medium', value: tickets.filter(t => t.priority === 'medium').length, color: '#eab308' }, // yellow-500
        { name: 'Low', value: tickets.filter(t => t.priority === 'low').length, color: '#22c55e' }, // green-500
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bar Chart - Categories */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Tickets by Category</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={categoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" />
                                <YAxis stroke="#888" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                                    cursor={{ fill: '#27272a' }}
                                />
                                <Bar dataKey="value" fill="#fff" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Pie Chart - Priorities */}
            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg text-white">Tickets by Priority</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={priorityData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a' }}
                                    labelStyle={{ color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    wrapperStyle={{ color: '#fff' }}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
