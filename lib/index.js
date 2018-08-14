"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var uuid = require("uuid/v1");
var storage = require('@google-cloud/storage');
var MulterGoogleCloudStorage = (function () {
    function MulterGoogleCloudStorage(opts) {
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
    MulterGoogleCloudStorage.prototype.getFilename = function (req, file, cb) {
        cb(null, uuid() + "_" + file.originalname);
    };
    MulterGoogleCloudStorage.prototype.getDestination = function (req, file, cb) {
        cb(null, '');
    };
    MulterGoogleCloudStorage.prototype._handleFile = function (req, file, cb) {
        var _this = this;
        this.getDestination(req, file, function (err, destination) {
            if (err) {
                return cb(err);
            }
            _this.getFilename(req, file, function (err, filename) {
                if (err) {
                    return cb(err);
                }
                var gcFile = _this.gcsBucket.file(filename);
                var writeStream = gcFile.createWriteStream({
                    predefinedAcl: _this.options.acl || 'private',
                    metadata: {
                        contentType: file.mimetype,
                    },
                });
                var readStream = file.stream;
                if (_this.options.transformer) {
                    readStream = file.stream.pipe(_this.options.transformer());
                }
                readStream
                    .pipe(writeStream)
                    .on('error', function (err) { return cb(err); })
                    .on('finish', function (file) {
                    return cb(null, {
                        path: "https://" + _this.options.bucket + ".storage.googleapis.com/" + filename,
                        filename: filename,
                    });
                });
            });
        });
    };
    MulterGoogleCloudStorage.prototype._removeFile = function (req, file, cb) {
        var gcFile = this.gcsBucket.file(file.filename);
        gcFile.delete();
        cb();
    };
    return MulterGoogleCloudStorage;
}());
exports.default = MulterGoogleCloudStorage;
function storageEngine(opts) {
    return new MulterGoogleCloudStorage(opts);
}
exports.storageEngine = storageEngine;
//# sourceMappingURL=index.js.map