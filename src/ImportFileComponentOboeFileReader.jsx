import React, { Component } from 'react';
const oboe = require("oboe");

class ImportFileComponent extends Component {
    constructor(props) {
        super(props);
        this.oboeStream = oboe();
        this.reader = undefined;
        this.selectedFile = undefined;
        this.start = undefined;
        this.stop = undefined;
        this.buffer = 1024 * 50;
        this.items = 0;
    }
    readSlice = () => {
        var blob = this.selectedFile.slice(this.start, this.stop);
        this.reader.readAsBinaryString(blob);
    }

    reset = () => {
        this.selectedFile = undefined;
        this.start = undefined;
        this.buffer = 1024 * 50;
        this.stop = this.buffer;
        this.items = 0;

        this.reader = new FileReader();
        this.reader.onloadend = this.processChunck
    }

    processChunck = (evt) => {

        if (evt.target.readyState === FileReader.DONE) { // DONE == 2
            this.oboeStream.emit('data', evt.target.result);
            if (!this.stop) {
                return;
            }
            this.start = this.stop;
            this.stop += this.buffer;
            if (this.stop > this.selectedFile.size) {
                // read to end of file
                this.stop = undefined;
            }
            this.readSlice();
        }
    }


    handleFileChosen = (file) => {
        this.reset()
        this.oboeStream.node('{message-id}', (msg) => { this.handleValidationMessage(msg) })
        this.selectedFile = file
        this.readSlice()
    }

    handleValidationMessage = (msg) => {
        this.items += 1
        if (this.items % 100 === 0) {
            console.log(`Loaded ${this.items} items`)
        }
    }

    render() {
        return <div>
            <input type="file" id="file" accept=".json" onChange={e => this.handleFileChosen(e.target.files[0])} />
        </div>
    }

}


export default ImportFileComponent;