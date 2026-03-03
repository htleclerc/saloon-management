/**
 * Responsive Components and Hooks - Index
 *
 * Utilitaires pour créer des interfaces responsive et mobile-first.
 *
 * @example
 * ```tsx
 * // Hooks
 * import {
 *   useBreakpoint,
 *   useMediaQuery,
 *   useOrientation,
 *   useIsTouchDevice,
 *   useViewportSize,
 *   useSwipe,
 *   useLongPress,
 *   useScrollDirection,
 * } from '@/components/responsive';
 *
 * // Composants
 * import {
 *   Container,
 *   Grid,
 *   Stack,
 *   Show,
 *   Hide,
 *   AspectRatio,
 *   Spacer,
 *   Center,
 * } from '@/components/responsive';
 *
 * function MyPage() {
 *   const { isMobile, isDesktop } = useBreakpoint();
 *   const isLandscape = useOrientation().isLandscape;
 *
 *   return (
 *     <Container maxWidth="lg">
 *       <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
 *         <Show above="md">
 *           <DesktopSidebar />
 *         </Show>
 *         <MainContent />
 *       </Grid>
 *     </Container>
 *   );
 * }
 * ```
 */

// Hooks responsive
export {
  useMediaQuery,
  useBreakpoint,
  useOrientation,
  useIsTouchDevice,
  useViewportSize,
  useSwipe,
  useLongPress,
  useScrollDirection,
  BREAKPOINTS,
  type BreakpointKey,
} from './hooks';

// Composants responsive
export {
  Container,
  Grid,
  Stack,
  Show,
  Hide,
  AspectRatio,
  Spacer,
  Center,
  type ResponsiveValue,
} from './components';
