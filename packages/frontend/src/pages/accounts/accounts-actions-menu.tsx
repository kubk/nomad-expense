import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ArrowUpDownIcon, MoreVerticalIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/translations/translation-provider";

type MenuPosition = {
  top: number;
  left: number;
};

type AccountsActionsMenuProps = {
  onCreateAccount: () => void;
  onReorderAccounts: () => void;
};

const MENU_MARGIN = 4;
const VIEWPORT_PADDING = 8;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function AccountsActionsMenu({
  onCreateAccount,
  onReorderAccounts,
}: AccountsActionsMenuProps) {
  const { t } = useTranslation();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<MenuPosition | null>(null);

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    const menu = menuRef.current;

    if (!trigger || !menu) return;

    const triggerRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const availableRight = window.innerWidth - VIEWPORT_PADDING;
    const availableBottom = window.innerHeight - VIEWPORT_PADDING;
    const preferredTop = triggerRect.bottom + MENU_MARGIN;
    const top =
      preferredTop + menuRect.height <= availableBottom
        ? preferredTop
        : triggerRect.top - menuRect.height - MENU_MARGIN;
    const left = clamp(
      triggerRect.right - menuRect.width,
      VIEWPORT_PADDING,
      availableRight - menuRect.width,
    );

    setPosition({
      top: Math.max(VIEWPORT_PADDING, top),
      left,
    });
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }

    updatePosition();
  }, [isOpen, updatePosition]);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleResize = () => updatePosition();

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen, updatePosition]);

  const runAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <Button
        ref={triggerRef}
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen((open) => !open)}
      >
        <MoreVerticalIcon className="w-4 h-4" />
      </Button>
      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="fixed z-50 min-w-[220px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{
              top: position?.top ?? 0,
              left: position?.left ?? 0,
              visibility: position ? "visible" : "hidden",
            }}
          >
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={() => runAction(onCreateAccount)}
            >
              <span>{t("accountsCreate")}</span>
              <PlusIcon className="h-4 w-4 text-muted-foreground" />
            </button>
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm outline-hidden hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
              onClick={() => runAction(onReorderAccounts)}
            >
              <span>{t("accountsReorder")}</span>
              <ArrowUpDownIcon className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
