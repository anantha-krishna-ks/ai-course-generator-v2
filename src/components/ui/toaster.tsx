import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react";

const variantIcons = {
  default: Info,
  success: CheckCircle2,
  destructive: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantIconColors = {
  default: "text-primary",
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
  info: "text-primary",
};

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const v = variant || "default";
        const Icon = variantIcons[v as keyof typeof variantIcons] || variantIcons.default;
        const iconColor = variantIconColors[v as keyof typeof variantIconColors] || variantIconColors.default;

        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Left ribbon */}
            <div className="toast-ribbon absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" />
            
            <div className="flex items-start gap-3 pl-4 pr-8 py-4 w-full">
              <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
              <div className="grid gap-1 flex-1 min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
                {action && <div className="mt-2">{action}</div>}
              </div>
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
