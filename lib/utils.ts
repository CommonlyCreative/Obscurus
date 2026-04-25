import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatTimeAgo(date: Date | string) {
    return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export async function asyncMap<T, K>(list: T[], fn: (object: T) => Promise<{ newObj: K }>) {
    const promises = list.map(fn);
    const data_with_includes = await Promise.all(promises);
    const filtered_data = data_with_includes.map(data => data.newObj);
    return filtered_data;
}

export const constructURL = (path?: string) => String(process.env.NEXT_PUBLIC_PROD_URL) + (path ?? "");

type RecursivelyReplaceNullWithUndefined<T> = T extends null
    ? undefined
    : T extends Date
    ? T
    : {
        [K in keyof T]: T[K] extends (infer U)[]
        ? RecursivelyReplaceNullWithUndefined<U>[]
        : RecursivelyReplaceNullWithUndefined<T[K]>;
    };

export function convertNullsToUndefined<T>(obj: T): RecursivelyReplaceNullWithUndefined<T> {
    if (obj === null) {
        return undefined as any;
    }

    // object check based on: https://stackoverflow.com/a/51458052/6489012
    if (obj && obj.constructor.name === "Object") {
        for (let key in obj) {
            obj[key] = convertNullsToUndefined(obj[key]) as any;
        }
    }
    return obj as any;
}

export type ArrayElement<ArrayType extends readonly unknown[]> =
    ArrayType extends readonly (infer ElementType)[] ? ElementType : never;