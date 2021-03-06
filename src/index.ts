import { Bucket, ConfigurationObject, Storage } from '@google-cloud/storage';
import * as multer from 'multer';
import { Duplex, Readable } from 'stream';
import * as uuid from 'uuid/v1';
const storage: (options?: ConfigurationObject) => Storage = require('@google-cloud/storage');

export type Config = ConfigurationObject & {
  acl?: string;
  bucket?: string;
  filename?: any;
  transformer?: () => Duplex;
};

export default class MulterGoogleCloudStorage implements multer.StorageEngine {
  private gcobj: Storage;
  private gcsBucket: Bucket;
  private options: Config;

  getFilename(req, file, cb) {
    cb(null, `${uuid()}_${file.originalname}`);
  }
  getDestination(req, file, cb) {
    cb(null, '');
  }

  constructor(opts?: Config) {
    opts = opts || {};

    this.getFilename = opts.filename || this.getFilename;

    opts.bucket = opts.bucket || process.env.GCS_BUCKET || null;
    opts.projectId = opts.projectId || process.env.GCLOUD_PROJECT || null;
    opts.keyFilename = opts.keyFilename || process.env.GCS_KEYFILE || null;

    if (!opts.bucket) {
      throw new Error('You have to specify bucket for Google Cloud Storage to work.');
    }

    if (!opts.projectId) {
      throw new Error('You have to specify project id for Google Cloud Storage to work.');
    }

    if (!opts.keyFilename) {
      throw new Error('You have to specify credentials key file for Google Cloud Storage to work.');
    }

    this.gcobj = storage({
      projectId: opts.projectId,
      keyFilename: opts.keyFilename,
    });

    this.gcsBucket = this.gcobj.bucket(opts.bucket);

    this.options = opts;
  }

  _handleFile(req, file, cb) {
    this.getDestination(req, file, (err, destination) => {
      if (err) {
        return cb(err);
      }

      this.getFilename(req, file, (err, filename) => {
        if (err) {
          return cb(err);
        }
        const gcFile = this.gcsBucket.file(filename);
        let writeStream = gcFile.createWriteStream({
          predefinedAcl: this.options.acl || 'private',
          metadata: {
            contentType: file.mimetype,
          },
        });
        let readStream = file.stream as Readable;
        if (this.options.transformer) {
          readStream = file.stream.pipe(this.options.transformer());
        }
        readStream
          .pipe(writeStream)
          .on('error', err => cb(err))
          .on('finish', file =>
            cb(null, {
              path: `https://${this.options.bucket}.storage.googleapis.com/${filename}`,
              filename: filename,
            }),
          );
      });
    });
  }
  _removeFile(req, file, cb) {
    const gcFile = this.gcsBucket.file(file.filename);
    gcFile.delete();
    cb();
  }
}

export function storageEngine(opts?: Config) {
  return new MulterGoogleCloudStorage(opts);
}
