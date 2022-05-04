import { WASIAbi } from "../abi";
import { WASIOptions } from "../options";
import { useArgs } from "./args";
import { useClock } from "./clock";
import { useEnviron } from "./environ";
import { useFS, useStdio } from "./fd";
import { useProc } from "./proc";
import { defaultRandomFillSync, useRandom } from "./random";

export function useAll(useOptions: { fs?: any, randomFillSync: (buffer: Uint8Array) => void } = {
    fs: undefined, randomFillSync: defaultRandomFillSync,
}): (options: WASIOptions, abi: WASIAbi, memoryView: () => DataView) => WebAssembly.ModuleImports {
    return (options: WASIOptions, abi: WASIAbi, memoryView: () => DataView) => {
        const features = [
            useEnviron, useArgs, useClock, useProc,
            useRandom({ randomFillSync: useOptions.randomFillSync })
        ];
        if (useOptions.fs) {
            features.push(useFS({ fs: useOptions.fs }));
        } else {
            features.push(useStdio());
        }
        return features.reduce((acc, fn) => {
            return { ...acc, ...fn(options, abi, memoryView) };
        }, {});
    };
}