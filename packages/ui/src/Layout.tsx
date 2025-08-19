import React from 'react';
import { cn } from './utils';
import { Container } from './Container';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  containerClassName?: string;
  fullHeight?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  background?: 'default' | 'muted' | 'card' | 'transparent';
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  className,
  containerSize = '7xl',
  containerClassName,
  fullHeight = false,
  padding = 'lg',
  background = 'default'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12'
  };

  const backgroundClasses = {
    default: 'bg-background',
    muted: 'bg-muted',
    card: 'bg-card',
    transparent: 'bg-transparent'
  };

  return (
    <div
      className={cn(
        'min-h-screen text-foreground',
        fullHeight && 'h-screen',
        backgroundClasses[background],
        paddingClasses[padding],
        className
      )}
    >
      <Container 
        size={containerSize} 
        className={cn('mx-auto', containerClassName)}
      >
        {children}
      </Container>
    </div>
  );
};

// Page Layout with Header
interface PageLayoutProps extends LayoutProps {
  header?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
  sidebar?: React.ReactNode;
  sidebarWidth?: 'sm' | 'md' | 'lg' | 'xl';
  sidebarPosition?: 'left' | 'right';
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  header,
  headerClassName,
  contentClassName,
  sidebar,
  sidebarWidth = 'md',
  sidebarPosition = 'left',
  ...layoutProps
}) => {
  const sidebarWidthClasses = {
    sm: 'w-64',
    md: 'w-80',
    lg: 'w-96',
    xl: 'w-[28rem]'
  };

  return (
    <Layout {...layoutProps}>
      <div className="flex flex-col h-full">
        {/* Header */}
        {header && (
          <header className={cn('border-b border-border bg-card', headerClassName)}>
            {header}
          </header>
        )}

        {/* Main Content */}
        <div className="flex flex-1">
          {/* Left Sidebar */}
          {sidebar && sidebarPosition === 'left' && (
            <aside className={cn(
              'border-r border-border bg-card',
              sidebarWidthClasses[sidebarWidth]
            )}>
              {sidebar}
            </aside>
          )}

          {/* Content Area */}
          <main className={cn('flex-1 overflow-auto', contentClassName)}>
            {children}
          </main>

          {/* Right Sidebar */}
          {sidebar && sidebarPosition === 'right' && (
            <aside className={cn(
              'border-l border-border bg-card',
              sidebarWidthClasses[sidebarWidth]
            )}>
              {sidebar}
            </aside>
          )}
        </div>
      </div>
    </Layout>
  );
};

// Section Layout
interface SectionLayoutProps extends Omit<LayoutProps, 'fullHeight' | 'min-h-screen'> {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  divider?: boolean;
}

export const SectionLayout: React.FC<SectionLayoutProps> = ({
  children,
  title,
  description,
  actions,
  divider = false,
  className,
  ...layoutProps
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {(title || description || actions) && (
        <div className={cn(
          'flex items-center justify-between',
          divider && 'border-b border-border pb-4'
        )}>
          <div className="space-y-1">
            {title && (
              <h2 className="text-2xl font-bold tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Section Content */}
      <div {...layoutProps}>
        {children}
      </div>
    </div>
  );
};

// Grid Layout
interface GridLayoutProps extends Omit<LayoutProps, 'fullHeight' | 'min-h-screen'> {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  responsive?: boolean;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  cols = 1,
  gap = 'md',
  responsive = true,
  className,
  ...layoutProps
}) => {
  const gapClasses = {
    none: '',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12'
  };

  const gridColsClasses = {
    1: 'grid-cols-1',
    2: responsive ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2',
    3: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-3',
    4: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-4',
    5: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5' : 'grid-cols-5',
    6: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6' : 'grid-cols-6',
    12: responsive ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6' : 'grid-cols-12'
  };

  return (
    <div
      className={cn(
        'grid',
        gridColsClasses[cols],
        gapClasses[gap],
        className
      )}
      {...layoutProps}
    >
      {children}
    </div>
  );
};

// Flex Layout
interface FlexLayoutProps extends Omit<LayoutProps, 'fullHeight' | 'min-h-screen'> {
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const FlexLayout: React.FC<FlexLayoutProps> = ({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  wrap = 'nowrap',
  gap = 'none',
  className,
  ...layoutProps
}) => {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    'row-reverse': 'flex-row-reverse',
    'col-reverse': 'flex-col-reverse'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };

  const wrapClasses = {
    nowrap: 'flex-nowrap',
    wrap: 'flex-wrap',
    'wrap-reverse': 'flex-wrap-reverse'
  };

  const gapClasses = {
    none: '',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        justifyClasses[justify],
        alignClasses[align],
        wrapClasses[wrap],
        gapClasses[gap],
        className
      )}
      {...layoutProps}
    >
      {children}
    </div>
  );
};
