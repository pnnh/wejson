import {transKey} from "@/components/common/locales/normal";
import {transSiteName} from "@/components/common/locales/texts";

export function pageTitle(lang: string, title?: string | null | undefined): string {
    const slogan = transKey(lang, transSiteName)
    if (!title || title.startsWith(slogan)) {
        return slogan
    }
    const suffix = ` - ${slogan}`
    return `${title.trim().replace(suffix, '')}${suffix}`
}
