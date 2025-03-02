"use client"

import * as React from "react"
import { cn } from "../../lib/utils/cn"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("space-y-2", className)}
      {...props}
    />
  )
)
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState<string | null>(null);
    const parentTabs = React.useContext(TabsContext);
    
    React.useEffect(() => {
      if (parentTabs) {
        setActiveTab(parentTabs.activeTab);
      }
    }, [parentTabs]);
    
    const isActive = activeTab === value;
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (parentTabs) {
        parentTabs.setActiveTab(value);
      }
      
      if (props.onClick) {
        props.onClick(e);
      }
    };
    
    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        data-state={isActive ? "active" : "inactive"}
        data-value={value}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/50 hover:text-foreground",
          className
        )}
        onClick={handleClick}
        {...props}
      />
    );
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState<string | null>(null);
    const parentTabs = React.useContext(TabsContext);
    
    React.useEffect(() => {
      if (parentTabs) {
        setActiveTab(parentTabs.activeTab);
      }
    }, [parentTabs]);
    
    const isActive = activeTab === value;
    
    if (!isActive) {
      return null;
    }
    
    return (
      <div
        ref={ref}
        role="tabpanel"
        data-state={isActive ? "active" : "inactive"}
        data-value={value}
        className={cn(
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
    );
  }
)
TabsContent.displayName = "TabsContent"

// Create a context to manage the active tab
interface TabsContextType {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType | null>(null);

// Create a provider component
export function TabsProvider({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

// Wrap the Tabs component to provide the context
const WrappedTabs = React.forwardRef<HTMLDivElement, TabsProps & { defaultValue: string }>(
  ({ defaultValue, children, ...props }, ref) => (
    <TabsProvider defaultValue={defaultValue}>
      <Tabs ref={ref} {...props}>
        {children}
      </Tabs>
    </TabsProvider>
  )
);
WrappedTabs.displayName = "WrappedTabs";

export { WrappedTabs as Tabs, TabsList, TabsTrigger, TabsContent };
