import { XRWorld } from '@drivej/xrworld';
import { useEffect, useRef } from 'react';
import { useResizeObserver } from 'usehooks-ts';
import { initSpiderverse } from './spiderverse/spiderverse.js';

export const SpiderVerse = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const container = useRef<HTMLDivElement>(null);
  const { width = 0, height = 0 } = useResizeObserver({ ref: container, box: 'border-box' });
  const world = useRef<XRWorld>(null!);

  // Initialize the world once
  useEffect(() => {
    if (container.current) {
      if (!world.current) {
        world.current = initSpiderverse();
      }
      container.current.appendChild(world.current.renderer.domElement);
      container.current.appendChild(world.current.vrButton);

      return () => {
        world.current.renderer.domElement.remove();
        world.current.vrButton.remove();
      };
    }
  }, []);

  // Update size whenever width or height changes
  useEffect(() => {
    if (world.current && width > 0 && height > 0) {
      console.log('Resizing to:', { width, height });
      world.current.setSize(width, height);
    }
  }, [width, height]);

  return <div data-c='1' ref={container} {...props} />;
};
