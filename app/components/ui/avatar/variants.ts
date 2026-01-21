import { cva, type VariantProps } from "class-variance-authority"

export const avatarVariant = cva(
  "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        sm: "h-10 w-10",
        xs: "h-8 w-8",
        lg: "h-12 w-12",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-md",
      },
    },
    defaultVariants: {
      size: "sm",
      shape: "circle",
    },
  },
)

export type AvatarVariants = VariantProps<typeof avatarVariant>
