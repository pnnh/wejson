import React from 'react'
import ContentLayout from '@/components/server/content/layout'
import {getPathname} from "@/components/server/pathname";
import {getTargetLang, unknownLanguage} from "@/components/common/language";
import {notFound} from "next/navigation";
import { WeJsonClient } from '@/components/wejson/wejson';

export const dynamic = "force-dynamic";

export default async function Page({params, searchParams}: {
    params: Promise<{ lang: string }>,
    searchParams: Promise<Record<string, string>>
}) {
    const pathname = await getPathname()
    const searchParamsValue = await searchParams

    const paramsValue = await params;
    const lang = paramsValue.lang
    if (!lang || getTargetLang(lang, unknownLanguage) === unknownLanguage) {
        notFound()
    }
    return <ContentLayout lang={lang} searchParams={searchParamsValue} pathname={pathname}>

            <WeJsonClient/>
    </ContentLayout>
}
