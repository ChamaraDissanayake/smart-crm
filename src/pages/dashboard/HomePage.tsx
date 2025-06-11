import {
    Card,
    CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, CircleDollarSign, PlusCircle, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { OpportunityService } from "@/services/OpportunityService"
import { useNavigate } from "react-router-dom"

const activitiesLeft = [
    {
        name: "Annette Black",
        action: "Purchased a basic plan",
        time: "2h ago",
        initial: "A",
    },
    {
        name: "Called a call Jun 8",
        action: "",
        time: "5h ago",
        initial: "S",
    },
    {
        name: "Completed websitre design",
        action: "",
        time: "7h ago",
        initial: " ",
        image: "https://randomuser.me/api/portraits/women/65.jpg",
    },
    {
        name: "Jacob Jones",
        action: "send email",
        time: "Yesterday",
        initial: "J",
    },
]

const activitiesRight = [
    {
        name: "David Williams",
        action: "scheduled a call",
        time: "2h ago",
        image: "https://randomuser.me/api/portraits/men/85.jpg",
    },
    {
        name: "Jenny Wilson",
        action: "added as contact",
        time: "5h ago",
        initial: "J",
    },
    {
        name: "Completed website tast",
        action: "",
        time: "7h ago",
        initial: " ",
        image: "https://randomuser.me/api/portraits/lego/1.jpg",
    },
    {
        name: "Jacob Jones",
        action: "send e-mail",
        time: "Yesterday",
        initial: "J",
    },
]

export default function HomePage() {
    const [contactCount, setContactCount] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Update your dataCards to use the dynamic contactCount
    const dynamicDataCards = [
        {
            path: "contacts",
            icon: <Users className="text-blue-500" />,
            title: "Contacts",
            value: isLoading ? "0" : contactCount.toLocaleString()
        },
        { path: "sales-quotation", icon: <CheckCircle className="text-green-500" />, title: "New Deals", value: "56" },
        { path: "communication", icon: <PlusCircle className="text-purple-500" />, title: "Open Follow-Ups", value: "12" },
        { path: "sales-invoicing", icon: <CircleDollarSign className="text-emerald-500" />, title: "Sales", value: "$18,950" },
    ];

    useEffect(() => {
        const fetchCount = async () => {
            try {
                setIsLoading(true);
                const count = await OpportunityService.getCompanyContactCount();
                animateValue(0, count, 1000); // Animate from 0 to count in 1 second
            } catch (error) {
                console.error("Error fetching contact count:", error);
                setContactCount(0);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCount();
    }, []);

    const animateValue = (start: number, end: number, duration: number) => {
        let startTimestamp: number | null = null;
        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            setContactCount(Math.floor(progress * (end - start) + start));
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    useEffect(() => {
        const fetchCount = async () => {
            const contactCount = await OpportunityService.getCompanyContactCount();
            console.log(`Total contacts: ${contactCount}`);
        }
        fetchCount();
    }, []);

    const handleCardClick = (path: string) => {
        navigate(path);
    };

    return (
        <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Home</h2>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {dynamicDataCards.map((item, idx) => (
                    <Card
                        key={idx}
                        className="flex flex-col items-center justify-center p-4 border rounded-lg shadow-sm hover:shadow-lg min-h-[154px] hover:scale-105 transition-transform duration-300"
                        onClick={() => {
                            handleCardClick(`/dashboard/${item.path}`);
                        }}
                    >
                        <div className="flex items-center gap-2 text-muted-foreground">
                            {item.icon}
                            <span className="text-lg font-medium">{item.title}</span>
                        </div>
                        <div className="mt-2 text-2xl font-bold text-center">{item.value}</div>
                    </Card>
                ))}
            </div>

            {/* AI Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                            <span className="font-bold text-purple-600">AI</span> AI Sales Summary
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Our growth is strong this month, with 20 deals won, totaling 15.500 in revenue.
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-1 text-sm font-semibold">
                            <span className="font-bold text-purple-600">AI</span> AI Activity Summary
                        </div>
                        <p className="text-sm text-muted-foreground">
                            You have six pending tasks and 15 follow-ups scheduled for next week.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <button className="text-sm text-blue-600 hover:underline">View all</button>
                </div>
                <div className="grid grid-cols-1 gap-4 mt-4 md:grid-cols-2">
                    {[activitiesLeft, activitiesRight].map((activityList, i) => (
                        <div key={i} className="space-y-4">
                            {activityList.map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="w-8 h-8">
                                            {activity.image ? (
                                                <AvatarImage src={activity.image} />
                                            ) : (
                                                <AvatarFallback>{activity.initial}</AvatarFallback>
                                            )}
                                        </Avatar>
                                        <div className="text-sm">
                                            <span className="font-medium">{activity.name}</span>{" "}
                                            <span className="text-muted-foreground">{activity.action}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
