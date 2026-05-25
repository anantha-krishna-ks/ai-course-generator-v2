import { useEffect, useMemo, useState } from "react";
import { Bell, UserCog, ShieldCheck, Users, MessageSquare, CornerDownRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getNotifications,
  getUnreadCount,
  markAllRead,
  subscribe as subscribeCollab,
  type CollaboratorNotification,
} from "@/services/collaboratorsStore";
import {
  getReviewNotificationsAsCollab,
  getReviewUnreadCount,
  markAllReviewRead,
  subscribe as subscribeReview,
} from "@/services/reviewCommentsStore";

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
  if (kind === "review-comment") return <MessageSquare className={cls} aria-hidden="true" />;
  if (kind === "review-reply") return <CornerDownRight className={cls} aria-hidden="true" />;
  return <Users className={cls} aria-hidden="true" />;
}

export function NotificationsBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collabItems, setCollabItems] = useState<CollaboratorNotification[]>(() => getNotifications());
  const [reviewItems, setReviewItems] = useState<CollaboratorNotification[]>(() => getReviewNotificationsAsCollab());
  const [unread, setUnread] = useState<number>(() => getUnreadCount() + getReviewUnreadCount());

  useEffect(() => {
    const refresh = () => {
      setCollabItems(getNotifications());
      setReviewItems(getReviewNotificationsAsCollab());
      setUnread(getUnreadCount() + getReviewUnreadCount());
    };
    const u1 = subscribeCollab(refresh);
    const u2 = subscribeReview(refresh);
    return () => { u1(); u2(); };
  }, []);

  const items = useMemo(
    () => [...collabItems, ...reviewItems].sort((a, b) => b.createdAt - a.createdAt),
    [collabItems, reviewItems],
  );

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && unread > 0) {
      setTimeout(() => { markAllRead(); markAllReviewRead(); }, 600);
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
      <PopoverContent align="end" className="w-[380px] p-0 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => { markAllRead(); markAllReviewRead(); }}
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
              Collaborator and review updates will appear here.
            </p>
          </div>
        ) : (
          <ScrollArea className="max-h-96">
            <ul className="divide-y">
              {items.map((n) => {
                const isReview = n.kind === "review-comment" || n.kind === "review-reply";
                return (
                  <li
                    key={n.id}
                    className={`px-4 py-3 flex gap-3 ${!n.read ? "bg-primary/5" : ""} ${isReview ? "cursor-pointer hover:bg-muted/50" : ""}`}
                    onClick={() => {
                      if (isReview && n.courseId) {
                        setOpen(false);
                        navigate(`/edit-course/${n.courseId}?comments=1`);
                      }
                    }}
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
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
