/*
MIT License

Copyright (c) 2021 James Gardner

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

import moment from "moment";
// import { Promise } from 'bluebird';

import * as interfaces from "./interfaces";
import * as registry from "./registry";
import * as structure from "./structure";
import * as message from "./message";
import * as commonreferences from "./commonreferences";
import * as common from "./common";
import * as data from "./data";
import * as sdmx from "../sdmx";
import * as time from "./time";
import * as xml from "./xml";
/*
export class Widukind implements interfaces.Queryable, interfaces.RemoteRegistry, interfaces.Repository {
    private agency: string = "WIDUKIND";
    //http://stats.oecd.org/restsdmx/sdmx.ashx/GetDataStructure/ALL/OECD
    private serviceURL: string = "http://widukind-api.cepremap.org/api/v1/sdmx/";
    //private serviceURL: string = "http://stat.abs.gov.au/restsdmx/sdmx.ashx/";
    private options: string = "";
    private local: interfaces.LocalRegistry = new registry.LocalRegistry();

    private dataflowList: Array<structure.Dataflow> = null;
    getDataService():string { return "WIDUKIND";}
    getRemoteRegistry(): interfaces.RemoteRegistry {
        return this;
    }

    getRepository(): interfaces.Repository {
        return null;//this;

    }

    clear() {
        this.local.clear();
    }
    query(q:data.Query):Promise<message.DataMessage> {
        let url = this.serviceURL + "/getdata?dataflow=" + q.getDataflow().getId().toString() + "&key=" + q.getQueryString() + "&startTime=" + q.getStartDate().getFullYear() + "&endTime=" + q.getEndDate().getFullYear();
        return this.retrieveData(q.getDataflow(),url);
    }
    public retrieveData(dataflow: structure.Dataflow,urlString: string): Promise<message.DataMessage> {
        console.log("oecd retrieveData:" + urlString);
        let s: string = this.options;
        if (urlString.indexOf("?") === -1) {
            s = "?" + s + "&random=" + new Date().getTime();
        } else {
            s = "&" + s + "&random=" + new Date().getTime();
        }
        let opts: any = {};
        opts.url = urlString;
        opts.method = "GET";
        opts.headers = { "Origin": document.location};
        return this.makeRequest(opts).then(function(a) {
            console.log("Got Data Response");
            let dm = sdmx.SdmxParser.parseData(a);
            let payload = new common.PayloadStructureType();
            payload.setStructure(dataflow.getStructure());
            dm.getHeader().setStructures([payload]);
            return dm;
        });
    }
    constructor(agency: string, service: string, options: string) {
        if (service != null) { this.serviceURL = service; }
        if (agency != null) { this.agency = agency; }
        if (options != null) { this.options = options; }
    }

    load(struct: message.StructureType) {
        console.log("abs load");
        this.local.load(struct);
    }

    unload(struct: message.StructureType) {
        this.local.unload(struct);
    }
    makeRequest(opts): Promise<string> {
        return new Promise<string>(function(resolve, reject) {
            let xhr = new XMLHttpRequest();
            xhr.open(opts.method, opts.url);
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject({
                        status: xhr.status,
                        statusText: xhr.statusText
                    });
                }
            };
            xhr.onerror = function() {
                reject({
                    status: xhr.status,
                    statusText: xhr.statusText
                });
            };
            if (opts.headers) {
                Object.keys(opts.headers).forEach(function(key) {
                    xhr.setRequestHeader(key, opts.headers[key]);
                });
            }
            let params = opts.params;
            // We'll need to stringify if we've been given an object
            // If we have a string, this is skipped.
            if (params && typeof params === 'object') {
                params = Object.keys(params).map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');
            }
            xhr.send(params);
        });
    }
    public retrieve(urlString: string): Promise<message.StructureType> {
        console.log("nomis retrieve:" + urlString);
        let s: string = this.options;
        if (urlString.indexOf("?") === -1) {
            s = "?" + s + "&random=" + new Date().getTime();
        } else {
            s = "&" + s + "&random=" + new Date().getTime();
        }
        let opts: any = {};
        opts.url = urlString;
        opts.method = "GET";
        opts.headers = { "Origin": document.location};
        return this.makeRequest(opts).then(function(a) {
            return sdmx.SdmxParser.parseStructure(a);
        });
    }
    public retrieve2(urlString: string): Promise<string> {
        console.log("nomis retrieve:" + urlString);
        let s: string = this.options;
        if (urlString.indexOf("?") === -1) {
            s = "?" + s + "&random=" + new Date().getTime();
        } else {
            s = "&" + s + "&random=" + new Date().getTime();
        }
        let opts: any = {};
        opts.url = urlString;
        opts.method = "GET";
        opts.headers = { "Origin": document.location};
        return this.makeRequest(opts).then(function(a) {
            return a;
        });
    }

    public findDataStructure(ref: commonreferences.Reference): Promise<structure.DataStructure> {
        let dst: structure.DataStructure = this.local.findDataStructure(ref);
        if (dst != null) {
            let promise = new Promise < structure.DataStructure>(function(resolve, reject) {
                resolve(dst);
            }.bind(this));
            return promise;
        } else {
            return <Promise<structure.DataStructure>>this.retrieve(this.getServiceURL() + "/" + ref.getMaintainableParentId()).then(function(structure: message.StructureType){
                this.local.load(structure);
                return structure.getStructures().findDataStructure(ref);
            }.bind(this));
        }
    }

    public listDataflows(): Promise<Array<structure.Dataflow>> {
        if (this.dataflowList != null) {
            let promise = new Promise<Array<structure.Dataflow>>(function(resolve, reject) {
                resolve(this.dataflowList);
            }.bind(this));
            return promise;
        } else {
            return <Promise<Array<structure.Dataflow>>>this.retrieve(this.serviceURL).then(function(st: message.StructureType) {
                let array: Array<structure.DataStructure> = st.getStructures().getDataStructures().getDataStructures();
                let dfs: Array<structure.Dataflow> = [];
                for (let i = 0; i < array.length; i++) {
                    dfs.push(array[i].asDataflow());
                }
                this.dataflowList = dfs;
                return dfs;
            }.bind(this)
            );
        }
    }
    public getServiceURL(): string { return this.serviceURL;    }
    findDataflow(ref: commonreferences.Reference): Promise<structure.Dataflow> { return null; }
    findCode(ref: commonreferences.Reference): Promise<structure.CodeType> { return null; }
    findCodelist(ref: commonreferences.Reference): Promise<structure.Codelist> { return null; }
    findItemType(item: commonreferences.Reference): Promise<structure.ItemType> { return null; }
    findConcept(ref: commonreferences.Reference): Promise<structure.ConceptType> { return null; }
    findConceptScheme(ref: commonreferences.Reference): Promise<structure.ConceptSchemeType> { return null; }
    searchDataStructure(ref: commonreferences.Reference): Promise<Array<structure.DataStructure>> { return null; }
    searchDataflow(ref: commonreferences.Reference): Promise<Array<structure.Dataflow>> { return null; }
    searchCodelist(ref: commonreferences.Reference): Promise<Array<structure.Codelist>> { return null; }
    searchItemType(item: commonreferences.Reference): Promise<Array<structure.ItemType>> { return null; }
    searchConcept(ref: commonreferences.Reference): Promise<Array<structure.ConceptType>> { return null; }
    searchConceptScheme(ref: commonreferences.Reference): Promise<Array<structure.ConceptSchemeType>> { return null; }
    getLocalRegistry(): interfaces.LocalRegistry {
        return this.local;
    }
    save(): any { }
}
export default { Widukind:Widukind }
*/
