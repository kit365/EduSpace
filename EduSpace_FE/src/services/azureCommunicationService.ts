class AzureCommunicationService {
    callClient: any = null;
    callAgent: any = null;
    deviceManager: any = null;
    call: any = null;
    localVideoStream: any = null;
    isInitialized = false;
    sdkClasses: any = null;
    isLoading = false;
    isInitializingCall = false;

    private isBrowserEnvironment(): boolean {
        return typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof MediaStream !== 'undefined';
    }

    async loadSDKClasses() {
        if (this.isLoading) {
            while (this.isLoading) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
            return this.sdkClasses;
        }
        if (this.sdkClasses) return this.sdkClasses;
        if (!this.isBrowserEnvironment()) {
            throw new Error('Azure Communication Services requires browser environment');
        }

        this.isLoading = true;
        try {
            const callingSDK = await import('@azure/communication-calling');
            const { AzureCommunicationTokenCredential } = await import('@azure/communication-common');
            this.sdkClasses = {
                CallClient: callingSDK.CallClient,
                AzureCommunicationTokenCredential,
                LocalVideoStream: callingSDK.LocalVideoStream,
            };
            return this.sdkClasses;
        } finally {
            this.isLoading = false;
        }
    }

    async initialize() {
        if (!this.isBrowserEnvironment()) throw new Error('Browser environment required');
        await this.loadSDKClasses();
        this.callClient = new this.sdkClasses.CallClient();
        this.deviceManager = await this.callClient.getDeviceManager();
        await this.deviceManager.askDevicePermission({ audio: true, video: true });
        this.isInitialized = true;
        return true;
    }

    async createCallAgent(token: string) {
        if (!this.isInitialized) await this.initialize();

        let waitCount = 0;
        while (this.isInitializingCall && waitCount < 50) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            waitCount++;
        }

        if (this.callAgent && !this.isInitializingCall) return this.callAgent;
        this.isInitializingCall = true;
        try {
            if (this.callAgent) {
                this.callAgent.dispose();
                this.callAgent = null;
            }
            this.callClient = new this.sdkClasses.CallClient();
            this.deviceManager = await this.callClient.getDeviceManager();
            const credential = new this.sdkClasses.AzureCommunicationTokenCredential(token);
            this.callAgent = await this.callClient.createCallAgent(credential, { displayName: 'EduSpace User' });
            return this.callAgent;
        } finally {
            this.isInitializingCall = false;
        }
    }

    async createLocalVideoStream() {
        const cameras = await this.deviceManager.getCameras();
        if (cameras.length === 0) throw new Error('No camera available');
        this.localVideoStream = new this.sdkClasses.LocalVideoStream(cameras[0]);
        return this.localVideoStream;
    }

    async joinCall(groupId: string, localVideoStream?: any) {
        if (!this.callAgent) throw new Error('CallAgent is not initialized');
        this.call = await this.callAgent.join({
            groupId,
            videoOptions: { localVideoStreams: localVideoStream ? [localVideoStream] : [] },
        });
        return this.call;
    }

    async hangUp() {
        if (this.call) await this.call.hangUp();
    }

    async cleanup() {
        this.isInitializingCall = false;
        if (this.localVideoStream) {
            try {
                const mediaStream = this.localVideoStream.mediaStream;
                if (mediaStream) mediaStream.getTracks().forEach((track: any) => track.stop());
                this.localVideoStream.dispose();
            } catch {
                // ignore cleanup error
            }
            this.localVideoStream = null;
        }
        if (this.call) {
            try {
                await this.call.hangUp();
            } catch {
                // ignore cleanup error
            }
            this.call = null;
        }
        if (this.callAgent) {
            try {
                this.callAgent.dispose();
            } catch {
                // ignore cleanup error
            }
            this.callAgent = null;
        }
    }
}

const azureCommunicationService = new AzureCommunicationService();
export default azureCommunicationService;

