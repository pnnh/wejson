import React from "react";
import {transKey} from "@/components/common/locales/normal";
import {transNeedLogin} from "@/components/common/locales/texts";

export function NeedLoginPage({lang}: { lang: string }) {
    return <div>
        {transKey(lang, transNeedLogin)}
    </div>
}
