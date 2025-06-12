// components/ui/switch.tsx
import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@/lib/utils"; // This comes with shadcn setup

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitives.Root>,
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        ref={ref}
        className={cn(
            "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-green-600 dark:bg-green-700 dark:data-[state=checked]:bg-green-600",
            className
        )}
        {...props}
    >
        <SwitchPrimitives.Thumb
            className={cn(
                "pointer-events-none block h-5 w-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-5"
            )}
        />
    </SwitchPrimitives.Root>
));
Switch.displayName = "Switch";

export { Switch };