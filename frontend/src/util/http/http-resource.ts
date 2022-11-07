import { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from "axios";
import axios from 'axios'
import { serialize } from 'object-to-formdata'


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
        let sendData = this.makeSendData(data)

        return this.http.post<T>(this.resource, sendData)
    }

    update<T = any>(id, data, options?: {http?: {usePost: boolean}, config?: AxiosRequestConfig}): Promise<AxiosResponse<T>> {
        let sendData = this.makeSendData(data)
        const {http, config} = (options || {}) as any

        return !options || !http || !http.usePost
            ? this.http.put<T>(`${this.resource}/${id}`, sendData, config )
            : this.http.post<T>(`${this.resource}/${id}`, sendData, config )
    }

    partialUpdate<T = any>(id, data, options?: {http?: {usePost: boolean}, config?: AxiosRequestConfig}): Promise<AxiosResponse<T>> {
        let sendData = this.makeSendData(data)
        const {http, config} = (options || {}) as any

        return !options || !http || !http.usePost
            ? this.http.patch<T>(`${this.resource}/${id}`, sendData, config )
            : this.http.post<T>(`${this.resource}/${id}`, sendData, config )
    }

    delete<T = any>(id) {
        return this.http.delete<T>(`${this.resource}/${id}`)
    }

    deleteCollection<T = any>(queryParams) : Promise<AxiosResponse<T>> {
        const config:AxiosRequestConfig = {}
        if (queryParams) {
            config['params'] = queryParams
        }
        return this.http.delete<T>(`${this.resource}`, config)
    }

    isCancelledRequest(error) {
        return axios.isCancel(error)
    }

    private makeSendData(data) {
        return this.containsFile(data) ? this.getFormData(data) : data
    }

    private getFormData(data) {
        return serialize(data, {booleansAsIntegers: true})
    }

    private containsFile(data) {
        return Object.values(data).filter( a => a instanceof File).length !== 0
    }
}

export default HttpResource