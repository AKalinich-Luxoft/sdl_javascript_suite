/*
* Copyright (c) 2019, Livio, Inc.
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* Redistributions of source code must retain the above copyright notice, this
* list of conditions and the following disclaimer.
*
* Redistributions in binary form must reproduce the above copyright notice,
* this list of conditions and the following
* disclaimer in the documentation and/or other materials provided with the
* distribution.
*
* Neither the name of the Livio Inc. nor the names of its contributors
* may be used to endorse or promote products derived from this software
* without specific prior written permission.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
* ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
* LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
* CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
* SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
* INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
* CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
* ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
* POSSIBILITY OF SUCH DAMAGE.
*/

const SDL = require('../../../lib/node/src/index.js');
const config = {
    port: 3005,
    timeout: 5000,
    ssl: new SDL.transport.SslConfig()
};

const transport = new SDL.transport.WebSocketServer(
    new SDL.transport.WebSocketServerConfig(
        config.port,
        config.timeout,
        config.ssl
    ),
    new SDL.transport.TransportListener()
);
transport._transportListener.setOnTransportConnected(function () {
    console.log('TODO: Sending RAI SdlPacket');
    // transport.sendPacket();
});

transport.start();






const WebSocket = require('ws');

const exampleSocket = new WebSocket(`ws://localhost:${config.port}`);

exampleSocket.on('open', function() {
    console.log("client received open event");
    console.log("client sending text");
    exampleSocket.send("This is text");
    console.log("client sending binary");
    exampleSocket.send(new Uint8Array(8));
});

setTimeout(() => {
    console.log('client terminating connection');
    exampleSocket.terminate();
}, 18000);