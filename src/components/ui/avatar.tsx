import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden transition-all duration-200 ease-in-out",
  {
    variants: {
      size: {
        xs: "h-6 w-6",
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-12 w-12",
        xl: "h-16 w-16",
        "2xl": "h-24 w-24",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
      ring: {
        none: "",
        default: "ring-2 ring-offset-2 ring-offset-background",
        primary: "ring-2 ring-offset-2 ring-offset-background ring-primary",
        secondary: "ring-2 ring-offset-2 ring-offset-background ring-secondary",
      },
      status: {
        none: "",
        online: "after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:border-2 after:border-background after:bg-green-500",
        offline: "after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:border-2 after:border-background after:bg-gray-400",
        busy: "after:absolute after:bottom-0 after:right-0 after:h-3 after:w-3 after:rounded-full after:border-2 after:border-background after:bg-red-500",
      },
    },
    defaultVariants: {
      size: "md",
      shape: "circle",
      ring: "none",
      status: "none",
    },
  }
)

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  status?: "online" | "offline" | "busy" | "none"
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size, shape, ring, status, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(avatarVariants({ size, shape, ring, status }), className)}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn(
      "aspect-square h-full w-full object-cover transition-opacity duration-200 ease-in-out hover:opacity-90",
      className
    )}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/80 text-muted-foreground backdrop-blur-sm",
      "animate-in fade-in-50 duration-200",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
