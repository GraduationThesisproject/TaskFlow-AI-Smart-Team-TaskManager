import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

// Container component for responsive layouts
const containerVariants = cva("w-full mx-auto px-4 sm:px-6 lg:px-8", {
  variants: {
    size: {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      "2xl": "max-w-2xl",
      "3xl": "max-w-3xl",
      "4xl": "max-w-4xl",
      "5xl": "max-w-5xl",
      "6xl": "max-w-6xl",
      "7xl": "max-w-7xl",
      full: "max-w-full",
    },
    padding: {
      none: "px-0",
      sm: "px-4",
      default: "px-4 sm:px-6 lg:px-8",
      lg: "px-6 sm:px-8 lg:px-12",
    },
  },
  defaultVariants: {
    size: "7xl",
    padding: "default",
  },
});

interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    />
  )
);
Container.displayName = "Container";

// Grid component for responsive layouts
const gridVariants = cva("grid", {
  variants: {
    cols: {
      1: "grid-cols-1",
      2: "grid-cols-1 sm:grid-cols-2",
      3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
      6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
      12: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-12",
    },
    gap: {
      none: "gap-0",
      sm: "gap-2",
      default: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    },
  },
  defaultVariants: {
    cols: 1,
    gap: "default",
  },
});

interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ className, cols, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(gridVariants({ cols, gap }), className)}
      {...props}
    />
  )
);
Grid.displayName = "Grid";

// Flex component for flexible layouts
const flexVariants = cva("flex", {
  variants: {
    direction: {
      row: "flex-row",
      col: "flex-col",
      "row-reverse": "flex-row-reverse",
      "col-reverse": "flex-col-reverse",
    },
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    },
    wrap: {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
    },
    gap: {
      none: "gap-0",
      xs: "gap-1",
      sm: "gap-2",
      default: "gap-4",
      md: "gap-6",
      lg: "gap-8",
      xl: "gap-12",
    },
  },
  defaultVariants: {
    direction: "row",
    align: "center",
    justify: "start",
    wrap: "nowrap",
    gap: "none",
  },
});

interface FlexProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof flexVariants> {}

const Flex = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ className, direction, align, justify, wrap, gap, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(flexVariants({ direction, align, justify, wrap, gap }), className)}
      {...props}
    />
  )
);
Flex.displayName = "Flex";

// Stack component for vertical layouts
interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: "none" | "xs" | "sm" | "md" | "lg" | "xl";
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ className, spacing = "md", children, ...props }, ref) => {
    const spaceMap = {
      none: "space-y-0",
      xs: "space-y-1",
      sm: "space-y-2", 
      md: "space-y-4",
      lg: "space-y-6",
      xl: "space-y-8",
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col", spaceMap[spacing], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Stack.displayName = "Stack";

export { 
  Container, 
  Grid, 
  Flex, 
  Stack, 
  containerVariants, 
  gridVariants, 
  flexVariants 
};
