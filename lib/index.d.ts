import * as multer from 'multer';
import { ConfigurationObject } from '@google-cloud/storage';
export declare type Config = ConfigurationObject & {
    acl?: string;
    bucket?: string;
    filename?: any;
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
