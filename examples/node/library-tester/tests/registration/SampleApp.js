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

const SDL = require('../../SDL.min.js');
const AppHelper = require('../../AppHelper.js');

// this acts as the producer app
module.exports = class SampleApp {
    constructor (catalogRpc, appId, setInvalidProtocolVersion, setInvalidRpcVersion) {
        this._catalogRpc = catalogRpc;
        this._app = null;
        this.sdlManager = null;
        this.serviceId = null;
        this.appId = appId;
        this._setInvalidProtocolVersion = setInvalidProtocolVersion;
        this._setInvalidRpcVersion = setInvalidRpcVersion;
    }

    async start () {
        const appConfig = new SDL.manager.AppConfig()
            .setAppId(this.appId)
            .setAppName(this.appId)
            .setIsMediaApp(false)
            .setLanguageDesired(SDL.rpc.enums.Language.EN_US)
            .setHmiDisplayLanguageDesired(SDL.rpc.enums.Language.EN_US)
            .setAppTypes([
                SDL.rpc.enums.AppHMIType.MEDIA,
                SDL.rpc.enums.AppHMIType.REMOTE_CONTROL,
            ])
            .setTransportConfig(new SDL.transport.TcpClientConfig(process.env.HOST, process.env.PORT));

        if (this._setInvalidProtocolVersion) {
            appConfig.setMinimumProtocolVersion(new SDL.util.Version().fromString("99.99.99"));
        }
        if (this._setInvalidRpcVersion) {
            appConfig.setMinimumRpcVersion(new SDL.util.Version().fromString("99.99.99"));
        }

        this._app = new AppHelper(this._catalogRpc)
            .setAppConfig(appConfig);

        const startPromise = this._app.start();
        // override one of sdl manager's methods to determine if it's going to fail
        // cleanProxy is expected to be called
        if (this._setInvalidProtocolVersion || this._setInvalidRpcVersion) {
            const lcm = this._app.getManager()._lifecycleManager;
            const cleanFunc = lcm._cleanProxy;

            await new Promise((resolve, reject) => {
                lcm._cleanProxy = () => {
                    cleanFunc.call(lcm); // keep context
                    resolve();
                }
            });
        }
        else { // no errors expected. wait for start() to resolve
            await startPromise;
        }
        this.sdlManager = this._app.getManager();
    }

    async stop () {
        // tear down the app
        await this.sdlManager.sendRpc(new SDL.rpc.messages.UnregisterAppInterface());
        this.sdlManager.dispose();
    }

};

function rpcListenPromise (sdlManager, functionId, type) {
    return new Promise((resolve, reject) => {
        const listener = (message) => {
            if (message.getRPCType() === type) {
                sdlManager.removeRpcListener(functionId, listener);
                resolve(message);
            }
        }
        sdlManager.addRpcListener(functionId, listener);
    });
}

function sleep (timeout = 1000) {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}