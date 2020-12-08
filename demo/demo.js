const bel = require('bel')
const csjs = require('csjs-inject')
const path = require('path')
const filename = path.basename(__filename)
const autocomplete = require('..')
const domlog = require('ui-domlog')

function demoComponent () {
    let count = 1
    let number = 0
    let recipients = []
    let result = fetchData('./src/data.json')
    const log = domlog({page: 'PLANS', from: 'demo page', type: 'ready', filename, line: 13})
    // show logs
    const terminal = bel`<div class=${css.terminal}></div>`
    const searchBox = autocomplete({page: 'PLANS', name: 'swarm key', data: result }, protocol('swarmkey'))
    // container
    const container = wrap(searchBox, terminal)
    terminal.append(log)
    return container

    function wrap (content) {
        const container = bel`
        <div class=${css.wrap}>
            <section class=${css.container}>
                ${content}
            </section>
            ${terminal}
        </div>
        `
        return container
    }

    function protocol (name) {
        return send => {
            return receive
        }
    }

    function receive (message) {
        const { page, from, flow, type, action, body, filename, line } = message
        // console.log(`DEMO <= ${page}/${from} ${type}` );
        sendMessage(message).then( log => {
            terminal.append(log) 
            terminal.scrollTop = terminal.scrollHeight
        })
    }

    async function fetchData (path) {
        const response = await fetch(path)  
        if ( response.ok ) return response.json().then(data => data)
        if ( response.status === 404 ) {
            sendMessage({page: 'demo', from: 'data', flow: 'getData', type: 'error', body: `GET ${response.url} 404 (not found)`, filename, line: 53})
            .then( log => terminal.append(log) )
            // throw new Error(`Failed load file from ${response.url}`)
        }
    }

    async function sendMessage (message) {
        return await new Promise( (resolve, reject) => {
            if (message === undefined) reject('no message import')
            const log = domlog(message)
            return resolve(log)
        }).catch( err => { 
            throw new Error(err.message) 
        })
    }
}

const css = csjs`
html {
    box-sizing: border-box;
}
*, *::before, *::after {
    box-sizing: inherit;
}
body {
    margin: 0;
    padding: 0;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 14px;
    background-color: rgba(0, 0, 0, .1);
    height: 100%;
}
.wrap {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 75vh 25vh;
}
.container {
    width: 500px;
    margin: 20px auto 0 auto;
}
.terminal {
    background-color: #212121;
    color: #f2f2f2;
    font-size: 13px;
    overflow-y: auto;
}
`

document.body.append( demoComponent() )