import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentOrders() {
  return (
    <div className="space-y-8">
      {recentOrders.map((order) => (
        <div key={order.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={order.avatar} alt="Avatar" />
            <AvatarFallback>{order.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.name}</p>
            <p className="text-sm text-muted-foreground">{order.email}</p>
          </div>
          <div className="ml-auto font-medium">${order.amount}</div>
        </div>
      ))}
    </div>
  )
}

const recentOrders = [
  {
    id: "1",
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: 1999.99,
    avatar: "/avatars/01.png",
  },
  {
    id: "2",
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: 39.99,
    avatar: "/avatars/02.png",
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: 299.99,
    avatar: "/avatars/03.png",
  },
  {
    id: "4",
    name: "William Kim",
    email: "will.kim@email.com",
    amount: 99.99,
    avatar: "/avatars/04.png",
  },
  {
    id: "5",
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: 499.99,
    avatar: "/avatars/05.png",
  },
]

