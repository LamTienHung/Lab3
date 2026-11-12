import { useState } from 'react';
import styles from './Arena.module.css';

// React 19: ref là prop bình thường, không cần forwardRef
export function VirtualList({ ref, items, rowHeight, height, overscan = 6, label, renderItem }) {
  const [scrollTop, setScrollTop] = useState(0);
  const total = items.length;
  const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const end = Math.min(total, Math.ceil((scrollTop + height) / rowHeight) + overscan);
  const visible = items.slice(start, end);

  return (
    <ol
      ref={ref}
      className={styles.feedList}
      tabIndex={0}
      aria-label={label}
      style={{ '--list-height': `${height}px`, '--total-height': `${total * rowHeight}px` }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      {visible.map((item, i) => {
        const index = start + i;
        return (
          <li
            key={item.id}
            className={styles.feedRow}
            aria-setsize={total}
            aria-posinset={index + 1}
            style={{ '--row-top': `${index * rowHeight}px`, '--row-height': `${rowHeight}px` }}
          >
            {renderItem(item)}
          </li>
        );
      })}
    </ol>
  );
}