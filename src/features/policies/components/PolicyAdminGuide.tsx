// import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils';

// type PolicyAdminGuideProps = {
//   fieldCount: number;
//   fieldDefinitionCount: number;
//   templateCount: number;
//   policyCount?: number;
//   activePolicyCount?: number;
//   surface?: 'policies' | 'catalog';
//   onGoToCatalog?: () => void;
//   onAddPolicy?: () => void;
//   className?: string;
// };



// /** Shown only mid-setup (catalog exists, no active policy yet). */
// export function PolicyAdminGuide({
//   fieldCount,
//   policyCount = 0,
//   activePolicyCount,
//   surface = 'policies',
//   onGoToCatalog,
//   onAddPolicy,
//   className,
// }: PolicyAdminGuideProps) {
//   const fieldsReady = fieldCount > 0;

//   const resolvedActiveCount = activePolicyCount ?? policyCount;
//   const policiesReady = resolvedActiveCount > 0;

//   const showAddPolicy =
//     surface === 'policies' && fieldsReady && !policiesReady && Boolean(onAddPolicy);

//   return (
//     <div
//       className={cn(
//         'rounded-lg border border-border/60 bg-muted/15 px-4 py-3.5',
//         className,
//       )}
//     >
//       <div className="min-w-0 space-y-3">
//         {showAddPolicy ? (
//           <div className="flex flex-wrap gap-2 pt-0.5">
//             <Button
//               type="button"
//               size="sm"
//               className="h-9 bg-primary-500"
//               onClick={onAddPolicy}
//             >
//               Add policy
//             </Button>
//             {onGoToCatalog ? (
//               <Button
//                 type="button"
//                 variant="ghost"
//                 size="sm"
//                 className="h-9"
//                 onClick={onGoToCatalog}
//               >
//                 Browse catalog
//               </Button>
//             ) : null}
//           </div>
//         ) : null}
//       </div>
//     </div>
//   );
// }
