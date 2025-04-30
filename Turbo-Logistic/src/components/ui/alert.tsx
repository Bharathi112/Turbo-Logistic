import { cn } from "@/lib/utils";
import { AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

const variantIcons = {
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
};

type AlertProps = {
  variant?: "warning" | "info" | "success" | "error";
  title?: string;
  message: string;
};

export function Alert({ variant = "info", title, message }: AlertProps) {
  return (
    <div className={cn("p-4 rounded-lg border", {
      "border-yellow-500 bg-yellow-100": variant === "warning",
      "border-blue-500 bg-blue-100": variant === "info",
      "border-green-500 bg-green-100": variant === "success",
      "border-red-500 bg-red-100": variant === "error",
    })}>
      <div className="flex items-start space-x-2">
        {variantIcons[variant]}
        <div>
          {title && <h4 className="font-semibold">{title}</h4>}
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  );
}
