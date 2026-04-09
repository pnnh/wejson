import {langDeDE, langEsES, langFrFR, langJaJP, langPtPT, LangTextValue, langZhCN, langZhTW} from "../language"

export function transKey(lang: string, transText: LangTextValue): string {

    if (!transText) {
        throw new Error('transText cannot be empty');
    }
    switch (lang) {
        case langZhCN:
            return transText.zh
        case langJaJP:
            return transText.ja
        case langEsES:
            return transText.es
        case langFrFR:
            return transText.fr
        case langDeDE:
            return transText["de-DE"]
        case langPtPT:
            return transText["pt-PT"]
        case langZhTW:
            return transText["zh-TW"]
    }
    // Fallback to English
    return transText.en
}

// 用以翻译占位，后续换成其它函数
export function transTodo(zhText: string): string {
    return zhText
}
