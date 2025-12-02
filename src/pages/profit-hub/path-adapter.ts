// Path adapter to help resolve ProfitHub component imports
// This re-exports ProfitHub components with corrected paths

// Re-export hooks with @/profit-hub prefix
export { useDeriv } from '@/profit-hub/hooks/use-deriv';
export { useDerivAuth } from '@/profit-hub/hooks/use-deriv-auth';
export { useGlobalTradingContext } from '@/profit-hub/hooks/use-global-trading-context';
export { useMarketAnalysis } from '@/profit-hub/hooks/use-market-analysis';

// Re-export commonly used UI components
export { Tabs, TabsContent, TabsList, TabsTrigger } from '@/profit-hub/components/ui/tabs';
export { Button } from '@/profit-hub/components/ui/button';
export { Badge } from '@/profit-hub/components/ui/badge';
export { Card } from '@/profit-hub/components/ui/card';

// Re-export utility functions
export { cn } from '@/profit-hub/lib/utils';
