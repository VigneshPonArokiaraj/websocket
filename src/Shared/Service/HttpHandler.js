import axiosInstance from "./HttpInterceptors"

const get = (url) => {
    return axiosInstance.get(url);
}

const post = (url, params) => {
    return axiosInstance.post(url, params);
}

export const Http = {
    get: get,
    post: post
};