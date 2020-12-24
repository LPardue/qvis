<template>

    <div class="home">
        <Magoo></Magoo>

        <h1>Welcome to qvis v0.1, the QUIC and HTTP/3 visualization toolsuite!</h1>
        <p>To be able to visualize something, you need to load some data. Hit the Manage files button to get started!</p>
        <b-button v-b-toggle.sidebar-1 variant="primary">Manage files</b-button>

    </div>
</template>

<style scoped>
    .home {
        width: 100%;
        text-align: center;
        margin-top: 20px;
    }

    #FileManagerContainer {
        width: 50%;
        max-width: 1000px;
        min-width: 500px;
    }

    .fileOptionContainer {
        padding: 10px;
        text-align: left;
    }

    .fileOptionContainer:nth-of-type(odd) {
        background-color: rgba(0,0,0,.05);
    }

    /* #FileManagerContainer :nth-child(even){
        background-color: #dcdcdc;
    }
    #FileManagerContainer :nth-child(odd){
        background-color: #aaaaaa;
    } */

</style>

<script lang="ts">
    import { getModule } from "vuex-module-decorators";
    import { Component, Vue } from "vue-property-decorator";
    import ConnectionStore from "@/store/ConnectionStore";

    import TCPToQLOG from "./pcapconverter/tcptoqlog";
    import NetlogToQLOG from "./netlogconverter/netlogtoqlog";
    import FileLoader, { FileResult } from "./data/FileLoader";

    import StreamingJSONParser from "./utils/StreamingJSONParser";

    import Magoo from "./Magoo.vue";

    

    @Component({components: {
            Magoo,
        }})
    export default class FileManagerContainer extends Vue {

        
    }
</script>
