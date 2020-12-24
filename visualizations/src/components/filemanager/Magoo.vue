<template>
<b-sidebar id="sidebar-1" title="Manage qlogs" shadow width=33%>
      <div>
      <b-list-group>
        <b-list-group-item>
            <div class="d-flex justify-content-start">
                <h4>Load from filesystem</h4>
            </div>
            <div style="margin: 10px 0px;">
                    <form> 
                        <b-form-file
                            id="fileUpload"
                            multiple
                            v-model="filesToUpload"
                            :state="Boolean(filesToUpload.length > 0)"
                            placeholder="Choose files or drop them here..."
                            drop-placeholder="Drop files here..."
                            accept=".qlog,.json,.netlog"
                            class="text-nowrap text-truncate"
                            ></b-form-file>

                        <p v-if="uploadIsPcap" style="margin-top: 10px;">For .pcap files, you also need to upload a .keys file so it can be decrypted. We currently do not yet support decrypted pcaps or pcapng files with embedded keys.</p>
                        
                        <b-form-file
                        id="secretsUpload"
                        v-if="uploadIsPcap"
                        v-model="secretsToUpload"
                        :state="Boolean(secretsToUpload)"
                        placeholder="Choose a .keys file or drop it here..."
                        drop-placeholder="Drop .keys file here..."
                        accept=".keys"
                        class="text-nowrap text-truncate"
                        ></b-form-file>

                        
                        <div class="px-3 py-2">
                            <b-button @click="uploadFile()" :disabled="filesToUpload.length === 0" variant="primary">Load</b-button>
                        </div>
                        
                    </form>
                </div>
                <div>
                    <p style="font-size: 0.8rem;">
                        Supported extensions: <strong>.qlog</strong>, <strong><a href="https://www.chromium.org/for-testers/providing-network-details">.netlog</a></strong> or <strong>.json</strong> manifest.
                    </p>
                </div>
        </b-list-group-item>

        <b-list-group-item variant="secondary">
            <div class="d-flex justify-content-start">
                <h4>Load from URL</h4>
            </div>            
            <div style="margin: 10px 0px;">
                <form> 

                <b-form-input v-model="urlToLoad" id="urlInput" type="text" class="text-nowrap text-truncate" placeholder="https://www.example.com/output.qlog"></b-form-input>
                <p v-if="urlIsPcap" style="margin-top: 10px;">For .pcap files, you also need to specify a .keys file so it can be decrypted.</p>
                <b-form-input v-if="urlIsPcap" v-model="secretsToLoad" id="secretsInput" type="text" placeholder="https://www.example.com/secrets.keys"></b-form-input>
      
                <div class="px-3 py-2">
                    <b-button @click="loadURL()"  :disabled="this.urlToLoad === ''" variant="primary">Load</b-button>
                </div>
                        
                </form>
            </div>
            <div style="overflow-wrap: break-word;">
                <p style="font-size: 0.8rem;">
                    Supported extensions: <strong>.qlog</strong>, <strong>.pcap</strong> (alongside separate .keys), <strong>.pcapng</strong> (with embedded keys) files or <strong>.json</strong> manifest.
                </p>
            </div>
        </b-list-group-item>

        <b-list-group-item>
            <div class="d-flex justify-content-start">
                <h4>Load premade demo .qlog files</h4>
            </div>
                <div style="margin: 10px 0px;">
                    <form> 
                        <b-button style="font-size: 0.8rem;" class="mr-1 mt-1" @click="loadExamples()" variant="primary">Load many</b-button>
                        <b-button style="font-size: 0.8rem;" class="mr-1 mt-1" @click="loadMassiveExample()" variant="primary">Load one large</b-button>
                    </form>
                </div>
        </b-list-group-item>

        <b-list-group-item variant="secondary">
            <div class="d-flex justify-content-start">
                <h4>Load URL query parameter</h4>
            </div>
            <div style="margin: 10px 0px; ">
                <p>
                    Load via URL parameters to this qvis page.
                </p>
                <b-button v-b-toggle.collapse-1 variant="primary">Examples</b-button>
                <b-collapse id="collapse-1" class="mt-2">
                    <b-card>
                    <p class="card-text">Example 1: <a href="https://qvis.edm.uhasselt.be/#?list=x.json">?list=x.json</a><br/>
                    Example 2: <a href="https://qvis.edm.uhasselt.be/#?file=x.qlog">?file=x.qlog</a><br/>
                    Example 3: <a href="https://qvis.edm.uhasselt.be/#?file=x.pcap&amp;secrets=x.keys">?file=x.pcap&amp;secrets=x.keys</a><br/>
                    Example 4: <a href="https://qvis.edm.uhasselt.be/#?file1=x.qlog&amp;file2=y.qlog&amp;file3=z.qlog">?file1=x.qlog&amp;file2=y.qlog&amp;file3=z.qlog</a><br/>
                    Example 5: <a href="https://qvis.edm.uhasselt.be/#?file1=x.qlog&amp;secrets1=x.keys&amp;file2=y.qlog&amp;secrets2=y.keys">?file1=x.qlog&amp;secrets1=x.keys&amp;file2=y.qlog&amp;secrets2=y.keys</a><br/></p>
                    
                    </b-card>
                </b-collapse>
                <p style="font-size: 0.8rem;">
                    Supported extensions: <strong>.qlog</strong>, <strong>.pcap</strong> (alongside separate .keys), <strong>.pcapng</strong> (with embedded keys) files or <strong>.json</strong> manifest.
                </p>
            </div>
        </b-list-group-item>
        
        
    </b-list-group>
</div>
      
    </b-sidebar>
</template>

<script lang="ts">
    import { getModule } from "vuex-module-decorators";
    import { Component, Vue } from "vue-property-decorator";
    import ConnectionStore from "@/store/ConnectionStore";

    import TCPToQLOG from "./pcapconverter/tcptoqlog";
    import NetlogToQLOG from "./netlogconverter/netlogtoqlog";
    import FileLoader, { FileResult } from "./data/FileLoader";

    import StreamingJSONParser from "./utils/StreamingJSONParser";

    @Component
    export default class Magoo extends Vue {
        protected store:ConnectionStore = getModule(ConnectionStore, this.$store);

        protected urlToLoad:string = "";
        protected secretsToLoad:string = "";

        protected filesToUpload:Array<File> = new Array<File>();
        protected secretsToUpload:File|null = null;

        public loadURL(){

            if ( this.urlIsPcap && this.secretsToLoad === "" ){
                Vue.notify({
                    group: "default",
                    title: "Provide .keys file",
                    type: "error",
                    duration: 6000,
                    text: "You're linking to a .pcap without also providing a .keys file. This is currently not supported.",
                });

                return;
            }

            const params:any = {};
            if ( this.urlToLoad.endsWith(".json") ){
                params.list = this.urlToLoad;
            }
            else {
                params.file = this.urlToLoad;
            };

            if ( this.secretsToLoad !== "" ){
                params.secrets = this.secretsToLoad;
            }

            this.store.loadFilesFromServer( params );
        }

        public uploadFile(){

            if ( this.uploadIsPcap && this.secretsToUpload === null ){
                Vue.notify({
                    group: "default",
                    title: "Provide .keys file",
                    type: "error",
                    duration: 6000,
                    text: "You're uploading a .pcap without also providing a .keys file. This is currently not supported.",
                });

                return;
            }

            for ( const file of this.filesToUpload ){

                if ( file === null || (!file.name.endsWith(".qlog") && !file.name.endsWith(".json")) && !file.name.endsWith(".netlog") && !file.name.endsWith(".qlognd")) {
                    Vue.notify({
                        group: "default",
                        title: "Provide .qlog file",
                        type: "error",
                        duration: 6000,
                        text: "We currently only support uploading .qlog files. " + file.name,
                    });
                
                    return;
                }
            }

            for ( const file of this.filesToUpload ){

                const uploadFileName = file.name;
                Vue.notify({
                    group: "default",
                    title: "Loading uploaded file",
                    text: "Loading uploaded file " + uploadFileName + ".<br/>The file is not sent to a server.",
                });

                // const reader = new FileReader();

                // reader.onload = (evt) => {
                //     try{

                //         if ( file.name.endsWith(".qlog") ) {
                //             const contentsJSON = StreamingJSONParser.parseQlogText( (evt!.target as any).result );
                //             this.store.addGroupFromQlogFile({fileContentsJSON: contentsJSON, fileInfo:{ filename: uploadFileName }});
                //         }
                //         else if ( file.name.endsWith(".json") ) {
                //             const contentsJSON = StreamingJSONParser.parseJSONWithDeduplication( (evt!.target as any).result );

                //             const qlogJSON = TCPToQLOG.convert( contentsJSON );
                //             this.store.addGroupFromQlogFile({fileContentsJSON: qlogJSON, fileInfo:{ filename: uploadFileName }});
                //         } 
                //         else if (file.name.endsWith(".netlog")) {
                //             const contentsJSON = JSON.parse( (evt!.target as any).result );
                            
                //             const qlogJSON = NetlogToQLOG.convert( contentsJSON );
                //             this.store.addGroupFromQlogFile({fileContentsJSON: qlogJSON, fileInfo:{ filename: uploadFileName }});
                //         }
                //         else if (file.name.endsWith(".qlognd")) {
                //             // const contentsJSON = JSON.parse( (evt!.target as any).result );
                            
                //             // const qlogJSON = NetlogToQLOG.convert( contentsJSON );
                //             // this.store.addGroupFromQlogFile({fileContentsJSON: qlogJSON, fileInfo:{ filename: uploadFileName }});
                //             let countedEvents = 0;
                //             let events:any = [];
                            

                //             // const fileContents = new Response( (evt!.target as any).result );

                //             // ndjsonStream( fileContents ).then ( (jsonStream:any) => {

                //             // console.log( file );
                //             // console.log( Object.keys(file) );

                //             // ref: https://stackoverflow.com/questions/14438187/javascript-filereader-parsing-long-file-in-chunks
                //             // let blob = new Blob([(evt!.target as any).result]);
                //             // let resp = new Response(blob).body;
                //             let resp = new Response(file).body;


                //             let countTheStuff:any = () => {
                //                 countedEvents++;
                //             };

                //             let jsonStream = ndjsonStream( resp );
                //             console.log("NDSTREAM ", jsonStream);

                //             // ndstream.then ( (jsonStream:any) => {
                //                 const streamReader = jsonStream.getReader(); 
                //                 let read:any = undefined;

                //                 streamReader.read().then( read = ( result:any ) => {
                //                     if ( result.done ) {
                //                         let endTime = performance.now();
                //                         console.log("NDJSON ALL DONE!", endTime - startTime, countedEvents, events.length);
                //                         return;
                //                     }

                //                     countTheStuff();
                //                     console.log( result.value.length, result.value );

                //                     streamReader.read().then( read );
                //                 } );
                //             // });

                //             // const input = Readable.from( [(evt!.target as any).result] );

                //             // robin: need to switch to something that uses JS streams isntead of NodeJS streams because this ecosystem sucks
                //             // this seems to have potential: https://canjs.com/doc/can-ndjson-stream.html

                //             // let self = this;

                //             // input.on("end", function() {
                //             //     self.store.addGroupFromQlogFile({fileContentsJSON: {}, fileInfo:{ filename: uploadFileName }});

                //             //     console.log("Total events read: ", countedEvents, events.length );
                //             // });
                            
                //             // input.on("error", function(e:any) { 
                //             //     console.error("qlogFullToQlogND:validate : error during reading filecontents!", e);
                //             //     // resolver();
                //             // });
                            
                //             // input.pipe(ndjson.parse())
                //             // .on('data', function(obj:any) {
                //             //     ++countedEvents;
                //             //     // console.log( "COUNTED", countedEvents, obj );

                //             //     events.push( obj );
                //             // })

                //         }
                //         else { 
                //             throw new Error("unsupported file format : " + uploadFileName);
                //         }

                //         Vue.notify({
                //             group: "default",
                //             title: "Uploaded file",
                //             type: "success",
                //             text: "The uploaded file is now available for visualization " + uploadFileName + ".<br/>Use the menu above to switch views.",
                //         });
                //     }
                //     catch (e){
                        
                //         console.error("FileManagerContainer:uploadFile : ", e);
                //         Vue.notify({
                //             group: "default",
                //             title: "Error uploading file",
                //             type: "error",
                //             duration: 6000,
                //             text: "Something went wrong. " + uploadFileName + ". For more information, view the devtools console.",
                //         });
                //     }
                // };

                // let identifier = new FileReader();

                // let firstFewBytes = file.slice(0, 1024); // first 1000 bytes should contain qlog_version

                // identifier.onload = (evt) => { 
                //     let firstFewCharacters = (evt!.target as any).result;

                //     console.log("FIRST FEW CHARACTERS ARE: ", firstFewCharacters, firstFewCharacters.indexOf("qlog_version") >= 0 ); 

                //     reader.readAsText(file);
                // };

                // identifier.readAsText(firstFewBytes);

                FileLoader.Load( file, file.name ).then( (result:FileResult) => {
                    
                    this.store.addGroupFromQlogFile({fileContentsJSON: result.qlogJSON, fileInfo:{ filename: uploadFileName }});

                    Vue.notify({
                        group: "default",
                        title: "Uploaded file",
                        type: "success",
                        text: "The uploaded file is now available for visualization " + uploadFileName + ".<br/>Use the menu above to switch views.",
                    });
                })
                .catch( (reason:any) => {
                    console.error("FileManagerContainer:uploadFile : ", reason);

                    Vue.notify({
                        group: "default",
                        title: "Error uploading file",
                        type: "error",
                        duration: 6000,
                        text: "Something went wrong. " + uploadFileName + ". For more information, view the devtools console.",
                    });
                });
            }


            // // https://serversideup.net/uploading-files-vuejs-axios/
            // const formData = new FormData();
            // formData.append("file", this.fileToUpload!);
            // formData.append("secrets", this.secretsToUpload!);

            // console.log( formData);
            
            // axios.post( '/loadfiles',
            //     formData,
            //     {
            //         headers: {
            //             'Content-Type': 'multipart/form-data'
            //         }
            //     }
            // ).then(function(){
            // console.log('SUCCESS!!');
            // })
            // .catch(function(){
            // console.log('FAILURE!!');
            // });

        }

        public loadExamples(){
            let alreadyLoaded = false;
            for (const  group of this.store.groups ){
                if ( group.filename.indexOf("DEMO") === 0 ){
                    alreadyLoaded = true;
                    break;
                }
            }

            if ( alreadyLoaded ){

                Vue.notify({
                    group: "default",
                    title: "Example files already loaded",
                    type: "warn",
                    text: "Example files were already loaded, check for files with the 'DEMO_' prefix.",
                });

                return;
            }

            this.store.loadExamplesForDemo();
        }

        public loadMassiveExample(){
            let alreadyLoaded = false;
            for (const  group of this.store.groups ){
                if ( group.filename.indexOf("MASSIVE_DEMO_mvfst_large") >= 0 ){
                    alreadyLoaded = true;
                    break;
                }
            }

            if ( alreadyLoaded ){

                Vue.notify({
                    group: "default",
                    title: "Example file already loaded",
                    type: "warn",
                    text: "Example file was already loaded, it is called 'MASSIVE_DEMO_mvfst_large'.",
                });

                return;
            }

            this.store.loadQlogDirectlyFromURL( { url : "standalone_data/draft-00/mvfst_large.qlog", filename: "MASSIVE_DEMO_mvfst_large.qlog (31MB)"} );
        }

        protected get urlIsPcap(){
            return this.urlToLoad.indexOf(".pcap") >= 0 && this.urlToLoad.indexOf(".pcapng") < 0;
        }

        protected get uploadIsPcap(){
            return false; // this.fileToUpload !== null && this.fileToUpload.name.indexOf(".pcap") >= 0;
        }
    }
</script>