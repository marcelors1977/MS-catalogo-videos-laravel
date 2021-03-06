import { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import axios from 'axios'


class HttpResource {
    private cancelList : CancelTokenSource | null = null
    
    constructor(protected http: AxiosInstance, protected resource){
    }

    list<T = any>(options?: { queryOptions? }): Promise<AxiosResponse<T>> {
       
        if (this.cancelList) {
            this.cancelList.cancel('list request cancelled')
        }
        this.cancelList = axios.CancelToken.source() 
       
        const config:AxiosRequestConfig = {
            cancelToken: this.cancelList.token
        }
        if (options && options.queryOptions) {
            config.params = options.queryOptions
        }
        return this.http.get<T>(this.resource, config)
    }

    get<T = any>(id) {
        return this.http.get<T>(`${this.resource}/${id}`)
    }

    create<T = any>(data) {
        return this.http.post<T>(this.resource, data)
    }

    update<T = any>(id, data) {
        return this.http.put<T>(`${this.resource}/${id}`, data)
    }

    delete<T = any>(id) {
        return this.http.delete<T>(`${this.resource}/${id}`)
    }

    isCancelledRequest(error) {
        return axios.isCancel(error)
    }
}

export default HttpResource