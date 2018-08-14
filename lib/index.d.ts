/// <reference types="node" />
import { ConfigurationObject } from '@google-cloud/storage';
import * as multer from 'multer';
import { Duplex } from 'stream';
export declare type Config = ConfigurationObject & {
    acl?: string;
    bucket?: string;
    filename?: any;
    transformer?: () => Duplex;
};
export default class MulterGoogleCloudStorage implements multer.StorageEngine {
    private gcobj;
    private gcsBucket;
    private options;
    getFilename(req: any, file: any, cb: any): void;
    getDestination(req: any, file: any, cb: any): void;
    constructor(opts?: Config);
    _handleFile(req: any, file: any, cb: any): void;
    _removeFile(req: any, file: any, cb: any): void;
}
export declare function storageEngine(opts?: Config): MulterGoogleCloudStorage;
