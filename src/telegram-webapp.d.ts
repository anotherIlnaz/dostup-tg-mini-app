export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData?: string;
        platform?: string;
        ready: () => void;
        expand: () => void;
        HapticFeedback?: {
          notificationOccurred?: (type: "error" | "success" | "warning") => void;
        };
      };
    };
  }
}
