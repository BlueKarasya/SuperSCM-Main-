import type { ReactNode } from 'react';

export default function Panel({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return <section className="ui-panel">{title && <div className="ui-panel__header"><div><h2 className="ui-panel__title">{title}</h2>{description && <p className="ui-panel__description">{description}</p>}</div></div>}{children}</section>;
}
