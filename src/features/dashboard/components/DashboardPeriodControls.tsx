import {

  Select,

  SelectContent,

  SelectItem,

  SelectTrigger,

  SelectValue,

} from '@/components/ui/select';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { DashboardPeriodMode } from '@/features/dashboard/api';

import { MONTH_OPTIONS, QUARTER_OPTIONS } from '@/features/dashboard/dashboard-utils';

import { cn } from '@/lib/utils';



type DashboardPeriodControlsProps = {

  year: string;

  mode: DashboardPeriodMode;

  month: string;

  quarter: string;

  onYearChange: (year: string) => void;

  onModeChange: (mode: DashboardPeriodMode) => void;

  onMonthChange: (month: string) => void;

  onQuarterChange: (quarter: string) => void;

  className?: string;

};



const periodTriggerClassName =

  'h-8 rounded-md border-0 px-3 pb-0 text-xs font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-0 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm';



const selectTriggerClassName = 'h-8 border-border/60 bg-background text-xs shadow-none';



export function DashboardPeriodControls({

  year,

  mode,

  month,

  quarter,

  onYearChange,

  onModeChange,

  onMonthChange,

  onQuarterChange,

  className,

}: DashboardPeriodControlsProps) {

  const currentYear = new Date().getFullYear();

  const yearOptions = [currentYear - 1, currentYear, currentYear + 1];



  return (

    <div className={cn('flex flex-wrap items-center gap-2', className)}>

      <Tabs

        value={mode}

        onValueChange={(value) => onModeChange(value as DashboardPeriodMode)}

      >

        <TabsList className="h-auto gap-0 rounded-lg border border-border/60 bg-muted/40 p-0.5 shadow-none">

          <TabsTrigger value="year" className={periodTriggerClassName}>

            Year

          </TabsTrigger>

          <TabsTrigger value="quarter" className={periodTriggerClassName}>

            Quarter

          </TabsTrigger>

          <TabsTrigger value="month" className={periodTriggerClassName}>

            Month

          </TabsTrigger>

        </TabsList>

      </Tabs>



      <Select value={year} onValueChange={onYearChange}>

        <SelectTrigger className={cn(selectTriggerClassName, 'w-[5.5rem]')}>

          <SelectValue placeholder="Year" />

        </SelectTrigger>

        <SelectContent>

          {yearOptions.map((option) => (

            <SelectItem key={option} value={String(option)}>

              {option}

            </SelectItem>

          ))}

        </SelectContent>

      </Select>



      {mode === 'month' ? (

        <Select value={month} onValueChange={onMonthChange}>

          <SelectTrigger className={cn(selectTriggerClassName, 'w-[9.5rem]')}>

            <SelectValue placeholder="Month" />

          </SelectTrigger>

          <SelectContent>

            {MONTH_OPTIONS.map((option) => (

              <SelectItem key={option.value} value={option.value}>

                {option.label}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

      ) : null}



      {mode === 'quarter' ? (

        <Select value={quarter} onValueChange={onQuarterChange}>

          <SelectTrigger className={cn(selectTriggerClassName, 'w-[9.5rem]')}>

            <SelectValue placeholder="Quarter" />

          </SelectTrigger>

          <SelectContent>

            {QUARTER_OPTIONS.map((option) => (

              <SelectItem key={option.value} value={option.value}>

                {option.label}

              </SelectItem>

            ))}

          </SelectContent>

        </Select>

      ) : null}

    </div>

  );

}


