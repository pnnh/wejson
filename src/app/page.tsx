import { getTargetLang, langEnUS } from "@/components/common/language";
import ContentLayout from "@/components/server/content/layout";
import { getPathname } from "@/components/server/pathname";
import { WeJsonClient } from "@/components/wejson/wejson";
import { css } from "@/gen/styled/css";
import { headers } from "next/headers";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const pathname = await getPathname();
  const searchParamsValue = await searchParams;

  const headersList = await headers();
  const acceptLang = headersList.get("Accept-Language") || langEnUS;
  const lang = getTargetLang(acceptLang, langEnUS);

  return (
    <ContentLayout
      lang={lang}
      searchParams={searchParamsValue}
      pathname={pathname}
    >
      <div className={pageStyles.pageContainer}>
        <WeJsonClient lang={lang} />
      </div>
    </ContentLayout>
  );
}

const pageStyles = {
  pageContainer: css`
    width: min(1200px, 100%);
    margin: 0 auto !important;
    padding: 0 1rem;
  `,
};
