import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import './tabs.scss';

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
    className?: string;
}

export const Tabs = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Root>, TabsProps>(
    ({ className = '', ...props }, ref) => (
        <TabsPrimitive.Root ref={ref} className={`tabs-root ${className}`} {...props} />
    )
);

Tabs.displayName = 'Tabs';

export const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className = '', ...props }, ref) => (
    <TabsPrimitive.List ref={ref} className={`tabs-list ${className}`} {...props} />
));

TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className = '', ...props }, ref) => (
    <TabsPrimitive.Trigger ref={ref} className={`tabs-trigger ${className}`} {...props} />
));

TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className = '', ...props }, ref) => (
    <TabsPrimitive.Content ref={ref} className={`tabs-content ${className}`} {...props} />
));

TabsContent.displayName = 'TabsContent';
