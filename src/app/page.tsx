import React from 'react'
import ContentLayout from '@/components/server/content/layout'
import {getPathname} from "@/components/server/pathname";
import {headers} from "next/headers";
import {getTargetLang, langEnUS} from "@/components/common/language";
import {css} from "@/gen/styled/css"; 
import { WeJsonClient } from '@/components/wejson/wejson';

export default async function Page({searchParams}: {
    searchParams: Promise<Record<string, string>>
}) {
    const pathname = await getPathname()
    const searchParamsValue = await searchParams

    const headersList = await headers()
    const acceptLang = headersList.get('Accept-Language') || langEnUS
    const lang = getTargetLang(acceptLang, langEnUS)

    return <ContentLayout lang={lang} searchParams={searchParamsValue} pathname={pathname}>

        <div className={pageStyles.pageContainer}>
            <WeJsonClient/>
        </div>
    </ContentLayout>
}

const pageStyles = {
    pageContainer: css`
        width: 960px;
        margin: 0 auto !important;
    `
}
