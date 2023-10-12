import axios from 'axios';

export const postRequest = async (url, params) => {
    try {
        const res = await axios.post(`http://localhost:6002/api/v1${url}`, params);
        const { data } = res;
        if (data.success) {
            return data.message;
        } else {
            return [];
        }
    } catch (error) {
        console.error(`Error while making the request for ${url}`, error);
        return [];
    }
}