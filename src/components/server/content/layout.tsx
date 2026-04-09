import React from 'react'
import {ContentPublicNavbar} from "@/components/server/content/partials/navbar";
import {css} from "@/gen/styled/css";
import {SymbolUnknown} from "@pnnh/atom";
import {useServerConfig} from "@/components/server/config";
import {AccountModel, anonymousAccount} from "@/components/common/models/account/account";
import {isErrorLike} from "@/components/common/error";

export const templateBodyId = 'globalTemplateBody'

export default async function ContentLayout({
                                                children,
                                                searchParams,
                                                lang,
        pathname,
                                            }: {
    children: React.ReactNode,
    searchParams: Record<string, string>,
    lang: string,
    pathname: string,
}) {
    return <div className={styles.templateContainer}>
        <div className={styles.templateNavbar}>
            <ContentPublicNavbar pathname={pathname} searchParams={searchParams} lang={lang} />
        </div>
        <div id={templateBodyId} className={styles.templateBody}>
            <div className={styles.bodyContainer}>
                {children}
            </div>
        </div>
    </div>
}

const styles = {
    templateContainer: css`
        display: flex;
        flex-direction: column;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        scrollbar-width: thin;
    `,
    templateNavbar: css`
        width: 100vw;
        background-color: var(--background-color);
        border-bottom: solid 1px var(--divider-color);
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
        flex-shrink: 0;
        z-index: 10;
    `,
    templateBody: css`
        scrollbar-width: thin;
        overflow-x: hidden;
        overflow-y: auto;
        flex: 1;
    `,
    bodyContainer: css`
        margin: 0 auto;
        @media screen and (min-width: 120rem) {
            width: calc(120rem - 24rem);
            margin: 0 auto;
        }
    `,
};
