import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="سودوکو" />
        <meta name="theme-color" content="#F5EDDF" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: bootCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const bootCss = `
  html, body, #root { background-color: #F5EDDF; }
  body { margin: 0; }
`;
