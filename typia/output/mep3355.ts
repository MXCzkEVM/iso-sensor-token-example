import { compress as _compress, decompress as _decompress } from 'brotli-wasm';
import typia, { tags } from 'typia';
export const Mep3355Schema = {
    version: "3.0",
    components: {
        schemas: {
            Mep3355: {
                type: "object",
                properties: {
                    format: {
                        type: "string"
                    },
                    version: {
                        type: "string"
                    },
                    metadata: {
                        type: "object",
                        properties: {
                            data_source: {
                                type: "string"
                            },
                            data_collection_method: {
                                type: "string"
                            },
                            preprocessing: {
                                type: "string"
                            }
                        },
                        nullable: false,
                        required: [
                            "data_source",
                            "data_collection_method",
                            "preprocessing"
                        ]
                    },
                    data: {
                        type: "array",
                        items: {
                            $ref: "#/components/schemas/Mep3355Data"
                        }
                    }
                },
                nullable: false,
                required: [
                    "format",
                    "version",
                    "metadata",
                    "data"
                ]
            },
            Mep3355Data: {
                type: "object",
                properties: {
                    type: {
                        type: "string"
                    },
                    content: {
                        type: "string"
                    },
                    compression: {
                        type: "string"
                    }
                },
                nullable: false,
                required: [
                    "type",
                    "content",
                    "compression"
                ]
            }
        }
    },
    schemas: [
        {
            $ref: "#/components/schemas/Mep3355"
        }
    ]
};
export interface Mep3355Data {
    type: string;
    content: string;
    compression: string;
}
export interface Mep3355 {
    format: string;
    version: string;
    metadata: {
        data_source: string;
        data_collection_method: string;
        preprocessing: string;
    };
    data: Mep3355Data[];
}
export function BlankMep3355(): Mep3355 {
    let blank: Mep3355 = {
        format: 'MEP-3355',
        version: '1.0.0',
        metadata: {
            data_source: '',
            data_collection_method: '',
            preprocessing: '',
        },
        data: []
    };
    return blank;
}
export function BlankMep3355Data(): Mep3355Data {
    let blank: Mep3355Data = {
        type: "",
        content: "",
        compression: "none",
    };
    return blank;
}
export function Mep3355Parse(aInput: string): Mep3355 {
    let parsed: Mep3355 = ((input: string, errorFactory?: (p: import("typia").TypeGuardError.IProps) => Error): import("typia").Primitive<Mep3355> => { const assert = (input: any, errorFactory?: (p: import("typia").TypeGuardError.IProps) => Error): Mep3355 => {
        const __is = (input: any): input is Mep3355 => {
            const $io0 = (input: any): boolean => "string" === typeof input.format && "string" === typeof input.version && ("object" === typeof input.metadata && null !== input.metadata && ("string" === typeof (input.metadata as any).data_source && "string" === typeof (input.metadata as any).data_collection_method && "string" === typeof (input.metadata as any).preprocessing)) && (Array.isArray(input.data) && input.data.every((elem: any) => "object" === typeof elem && null !== elem && $io2(elem)));
            const $io2 = (input: any): boolean => "string" === typeof input.type && "string" === typeof input.content && "string" === typeof input.compression;
            return "object" === typeof input && null !== input && $io0(input);
        };
        if (false === __is(input))
            ((input: any, _path: string, _exceptionable: boolean = true): input is Mep3355 => {
                const $guard = (typia.json.assertParse as any).guard;
                const $ao0 = (input: any, _path: string, _exceptionable: boolean = true): boolean => ("string" === typeof input.format || $guard(_exceptionable, {
                    path: _path + ".format",
                    expected: "string",
                    value: input.format
                }, errorFactory)) && ("string" === typeof input.version || $guard(_exceptionable, {
                    path: _path + ".version",
                    expected: "string",
                    value: input.version
                }, errorFactory)) && (("object" === typeof input.metadata && null !== input.metadata || $guard(_exceptionable, {
                    path: _path + ".metadata",
                    expected: "__type",
                    value: input.metadata
                }, errorFactory)) && $ao1(input.metadata, _path + ".metadata", true && _exceptionable) || $guard(_exceptionable, {
                    path: _path + ".metadata",
                    expected: "__type",
                    value: input.metadata
                }, errorFactory)) && ((Array.isArray(input.data) || $guard(_exceptionable, {
                    path: _path + ".data",
                    expected: "Array<Mep3355Data>",
                    value: input.data
                }, errorFactory)) && input.data.every((elem: any, _index1: number) => ("object" === typeof elem && null !== elem || $guard(_exceptionable, {
                    path: _path + ".data[" + _index1 + "]",
                    expected: "Mep3355Data",
                    value: elem
                }, errorFactory)) && $ao2(elem, _path + ".data[" + _index1 + "]", true && _exceptionable) || $guard(_exceptionable, {
                    path: _path + ".data[" + _index1 + "]",
                    expected: "Mep3355Data",
                    value: elem
                }, errorFactory)) || $guard(_exceptionable, {
                    path: _path + ".data",
                    expected: "Array<Mep3355Data>",
                    value: input.data
                }, errorFactory));
                const $ao1 = (input: any, _path: string, _exceptionable: boolean = true): boolean => ("string" === typeof input.data_source || $guard(_exceptionable, {
                    path: _path + ".data_source",
                    expected: "string",
                    value: input.data_source
                }, errorFactory)) && ("string" === typeof input.data_collection_method || $guard(_exceptionable, {
                    path: _path + ".data_collection_method",
                    expected: "string",
                    value: input.data_collection_method
                }, errorFactory)) && ("string" === typeof input.preprocessing || $guard(_exceptionable, {
                    path: _path + ".preprocessing",
                    expected: "string",
                    value: input.preprocessing
                }, errorFactory));
                const $ao2 = (input: any, _path: string, _exceptionable: boolean = true): boolean => ("string" === typeof input.type || $guard(_exceptionable, {
                    path: _path + ".type",
                    expected: "string",
                    value: input.type
                }, errorFactory)) && ("string" === typeof input.content || $guard(_exceptionable, {
                    path: _path + ".content",
                    expected: "string",
                    value: input.content
                }, errorFactory)) && ("string" === typeof input.compression || $guard(_exceptionable, {
                    path: _path + ".compression",
                    expected: "string",
                    value: input.compression
                }, errorFactory));
                return ("object" === typeof input && null !== input || $guard(true, {
                    path: _path + "",
                    expected: "Mep3355",
                    value: input
                }, errorFactory)) && $ao0(input, _path + "", true) || $guard(true, {
                    path: _path + "",
                    expected: "Mep3355",
                    value: input
                }, errorFactory);
            })(input, "$input", true);
        return input;
    }; input = JSON.parse(input); return assert(input, errorFactory) as any; })(aInput);
    return parsed;
}
export function Mep3355DataPrepare(aType: string, aContent: string): Mep3355Data {
    const uncompressed = Buffer.from(aContent);
    const compressed = _compress(uncompressed);
    return {
        type: aType, content: Buffer.from(compressed).toString('base64'), compression: 'brotli',
    };
}
export function Mep3355DataExtract(aInput: Mep3355Data): string {
    if (aInput.compression == 'brotli') {
        const data = _decompress(Buffer.from(aInput.content, 'base64'));
        const decoded = Buffer.from(data).toString('utf-8');
        return decoded;
    }
    else {
        return aInput.content;
    }
}
