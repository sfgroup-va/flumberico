import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  children: string;
}

export default function Markdown({ children }: MarkdownProps) {
  return (
    <ReactMarkdown
      className="prose prose-sm md:prose-base prose-neutral max-w-none
                 prose-headings:text-foreground prose-p:text-foreground
                 prose-strong:text-foreground prose-em:text-muted-foreground
                 prose-ul:text-foreground prose-li:text-foreground
                 prose-a:text-neon-blue prose-a:no-underline hover:prose-a:underline
                 prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-blockquote:border-l-neon-blue prose-blockquote:text-muted-foreground
                 space-y-4"
      components={{
        h1: ({ children, ...props }) => (
          <h1 className="text-2xl font-bold text-foreground mb-4" {...props}>
            {children}
          </h1>
        ),
        h2: ({ children, ...props }) => (
          <h2 className="text-xl font-semibold text-foreground mb-3 mt-6" {...props}>
            {children}
          </h2>
        ),
        h3: ({ children, ...props }) => (
          <h3 className="text-lg font-semibold text-foreground mb-2 mt-4" {...props}>
            {children}
          </h3>
        ),
        p: ({ children, ...props }) => (
          <p className="text-base text-foreground leading-relaxed mb-4" {...props}>
            {children}
          </p>
        ),
        strong: ({ children, ...props }) => (
          <strong className="font-semibold text-foreground" {...props}>
            {children}
          </strong>
        ),
        em: ({ children, ...props }) => (
          <em className="italic text-muted-foreground" {...props}>
            {children}
          </em>
        ),
        ul: ({ children, ...props }) => (
          <ul className="list-disc list-inside space-y-2 mb-4 text-foreground" {...props}>
            {children}
          </ul>
        ),
        ol: ({ children, ...props }) => (
          <ol className="list-decimal list-inside space-y-2 mb-4 text-foreground" {...props}>
            {children}
          </ol>
        ),
        li: ({ children, ...props }) => (
          <li className="text-base leading-relaxed" {...props}>
            {children}
          </li>
        ),
        a: ({ children, ...props }) => (
          <a
            className="text-neon-blue hover:text-neon-purple hover:underline transition-colors duration-200"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        code: ({ inline, children, ...props }) => {
          if (inline) {
            return (
              <code className="bg-muted/50 text-foreground px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          }
          return (
            <code className="block bg-muted/50 text-foreground p-3 rounded-lg text-sm font-mono overflow-x-auto" {...props}>
              {children}
            </code>
          );
        },
        blockquote: ({ children, ...props }) => (
          <blockquote className="border-l-4 border-neon-blue/50 pl-4 py-2 my-4 bg-muted/20 rounded-r-lg" {...props}>
            {children}
          </blockquote>
        ),
        hr: ({ ...props }) => (
          <hr className="border-border/50 my-6" {...props} />
        ),
      }}
    >
      {children}
    </ReactMarkdown>
  );
}
