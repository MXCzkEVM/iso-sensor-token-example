import {compress as _compress, decompress as _decompress} from 'brotli-wasm'
import typia, {tags} from 'typia';

export const Mep3355Schema = typia.json.application<[Mep3355], '3.0'>();

export interface Mep3355Data {
  type: string, content: string, compression: string,
}

export interface Mep3355 {
  format: string;
  version: string;
  metadata: {
    data_source: string,
    data_collection_method: string,
    preprocessing: string,
  },
      data: Mep3355Data[],
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
  let parsed: Mep3355 = typia.json.assertParse<Mep3355>(aInput);
  return parsed;
}

export function Mep3355DataPrepare(aType: string, aContent: string): Mep3355Data {
  const uncompressed = Buffer.from(aContent);
  const compressed = _compress(uncompressed);
  return {
    type: aType, content: Buffer.from(compressed).toString('base64'), compression: 'brolti',
  }
}

export function Mep3355DataExtract(aInput: Mep3355Data): string {
  if (aInput.compression == 'brolti') {
    const data = _decompress(Buffer.from(aInput.content, 'base64'));
    const decoded = Buffer.from(data).toString('utf-8');
    return decoded;
  } else {
    return aInput.content;
  }  
}