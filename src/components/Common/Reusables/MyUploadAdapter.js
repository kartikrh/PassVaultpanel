import axios from 'axios';
import axiosInstance from '../../../Features/axios';

class MyUploadAdapter {
    constructor(loader) {
        // CKEditor 5's FileLoader instance.
        this.loader = loader;
        this.axios = axiosInstance;
        this.source = axios.CancelToken.source();

        // URL where to send files.
        this.url = `/ckUpload`;
    }

    // Starts the upload process.
    async upload() {
        try {
            // Set up Axios request config
            this.config = {
                responseType: 'json',
                cancelToken: this.source.token,
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.lengthComputable) {
                        this.loader.uploadTotal = progressEvent.total;
                        this.loader.uploaded = progressEvent.loaded;
                    }
                }
            };

            const data = new FormData();
            data.append('upload', await this.loader.file);

            // Send the request
            const response = await this.axios.post(this.url, data, this.config)
            return ({
                default: response.result,
            })
        } catch (error) {
            if (!axios.isCancel(error)) {
                throw ('Couldn\'t upload file: ' + this.loader.file.name);
            }
        }
    }

    // Aborts the upload process.
    abort() {
        if (this.source) {
            this.source.cancel('Upload canceled by the user.');
        }
    }
}

export default MyUploadAdapter;