import ContentLayout from "@/components/server/content/layout";
import { NoData } from "@/components/widget/empty";
import "server-only";

export function NoDataPage({
  lang,
  pathname,
  searchParams,
}: {
  lang: string;
  pathname: string;
  searchParams: Record<string, string>;
  size: "small" | "middle" | "large";
  message?: string;
}) {
  return (
    <ContentLayout lang={lang} searchParams={searchParams} pathname={pathname}>
      <NoData size={"middle"} />
    </ContentLayout>
  );
}
