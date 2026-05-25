import { useEffect, useState } from "react";
import { Bell, UserCog, ShieldCheck, Users } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  subscribe,
  type CollaboratorNotification,
} from "@/services/collaboratorsStore";

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function KindIcon({ kind }: { kind: CollaboratorNotification["kind"] }) {
  const cls = "w-4 h-4 text-primary";
  if (kind === "author") return <UserCog className={cls} aria-hidden="true" />;
  if (kind === "reviewer") return <ShieldCheck className={cls} aria-hidden="true" />;
  return <Users className={cls} aria-hidden="true" />;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CollaboratorNotification[]>(() => getNotifications());
  const [unread, setUnread] = useState<number>(() => getUnreadCount());

  useEffect(() => {
    const refresh = () => {
      setItems(getNotifications());
      setUnread(getUnreadCount());
    };
    const unsub = subscribe(refresh);
    return () => { unsub(); };
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unread > 0) {
      // mark read after a brief delay so the user can see the badge had updates
      setTimeout(() => markAllRead(), 600);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="relative rounded-full w-10 h-10 p-0 hover:bg-primary/10"
          aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ""}`}
        >
          <Bell className="w-5 h-5 text-foreground" aria-hidden="true" focusable="false" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card"
            >
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => markAllRead()}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        {items.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Author, reviewer and co-author updates will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="divide-y">
              {items.map((n) => (
                <li
                  key={n.id}
                  className={`px-4 py-3 flex gap-3 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <KindIcon kind={n.kind} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground break-words">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
