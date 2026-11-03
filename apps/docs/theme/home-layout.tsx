import { lazy, Suspense } from 'react';

const Home = lazy(() =>
  import('../src/components/home').then(({ HomeLayout }) => ({ default: HomeLayout })),
);

export function HomeLayout() {
  return (
    <Suspense fallback={null}>
      <Home />
    </Suspense>
  );
}
