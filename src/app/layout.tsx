import "server-only";

import { JotaiProvider } from "@/components/client/content/provider";
import { getTargetLang, langEnUS } from "@/components/common/language"; 
import { headers } from "next/headers";
import React from "react";
import "./global.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const acceptLang = headersList.get("Accept-Language") || langEnUS;
  const lang = getTargetLang(acceptLang, langEnUS); 

  const langMeta: Record<string, string> = {
    en: "en",
    zh: "zh-Hans",
    "zh-TW": "zh-Hant",
    ja: "ja",
    es: "es",
    fr: "fr",
    "de-DE": "de",
    "pt-PT": "pt",
  };
  const htmlLang = langMeta[lang] ?? lang;

  return (
    <html lang={htmlLang}>
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no"
        />
        <meta name="renderer" content="webkit" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1" />
        <meta name="robots" content="index,follow" />
        <meta httpEquiv="Content-Language" content={htmlLang} />
        <meta name="description" content="WeJSON — Online JSON / JSON5 formatter, validator, converter. Supports JSONPath query, JSON Schema validation, YAML & XML export." />
        <meta name="keywords" content="JSON formatter, JSON5, JSONPath, JSON Schema, YAML, XML, online JSON tool" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="WeJSON" />
        <meta property="og:description" content="Online JSON / JSON5 formatter, validator, and converter with Monaco Editor." />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="WeJSON" />
        <meta name="twitter:description" content="Online JSON / JSON5 formatter, validator, and converter." />
        <link
          rel="icon"
          type="image/png"
          href="/icons/favicon-96x96.png"
          sizes="96x96"
        />
        <link rel="icon" type="image/svg+xml" href="/icons/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>WeJSON</title>
      </head>
      <body lang={htmlLang} className={"lightTheme"}>
        <JotaiProvider>{children}</JotaiProvider>
      </body>
    </html>
  );
}
