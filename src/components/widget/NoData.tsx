import 'server-only'
import ContentLayout from "@/components/server/content/layout";
import React from "react";
import {NoData} from "@/components/widget/empty";

export function NoDataPage({
                               lang,
                               pathname,
                               searchParams,
                               size, message
                           }: {
    lang: string,
    pathname: string,
    searchParams: Record<string, string>,
    size: 'small' | 'middle' | 'large', message?: string
}) {
    return <ContentLayout lang={lang} searchParams={searchParams} pathname={pathname}>
        <NoData size={'middle'}/>
    </ContentLayout>
}
