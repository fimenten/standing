class ApiClient {
    constructor(public baseUrl: string) {}

    async getChannelList(): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/channelList`);

        if (!response.ok) {
            throw new Error('Failed to fetch channel list');
        }
        return response.json();
    }

    async getUrls(channel: string): Promise<string[]> {
        const response = await fetch(`${this.baseUrl}/getURLs`, {
            headers: { 'channel': channel }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch URLs');
        }
        return response.json();
    }

    async uploadFile(channel: string, file: File): Promise<{ message: string, filename: string }> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${this.baseUrl}/upload`, {
            method: 'POST',
            headers: { 'channel': channel },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload file');
        }

        return response.json();
    }
}

class HamburgerMenu {
    private menu: HTMLElement;
    private content: HTMLElement;
    private serverUrlInput: HTMLInputElement;
    private channelSelect: HTMLSelectElement;
    private fileInput: HTMLInputElement;
    private changeCallback: ((serverUrl: string, channel: string) => void) | null = null;
    private uploadCallback: ((file: File) => void) | null = null;
    private apiClient: ApiClient;

    constructor(private serverUrl: string, private channel: string) {
        this.menu = document.createElement('div');
        this.content = document.createElement('div');
        this.serverUrlInput = document.createElement('input');
        this.channelSelect = document.createElement('select');
        this.fileInput = document.createElement('input');
        this.apiClient = new ApiClient(serverUrl);
    }

    async initialize(): Promise<void> {
        this.createMenu();
        await this.loadChannelList();
    }

    onSettingsChange(callback: (serverUrl: string, channel: string) => void): void {
        this.changeCallback = callback;
    }

    onFileUpload(callback: (file: File) => void): void {
        this.uploadCallback = callback;
    }

    private createMenu(): void {
        this.menu.id = 'hamburger-menu';
        this.menu.style.position = 'fixed';
        this.menu.style.top = '10px';
        this.menu.style.right = '10px';
        this.menu.style.backgroundColor = 'white';
        this.menu.style.padding = '10px';
        this.menu.style.border = '1px solid black';
        this.menu.style.zIndex = '1000';
        document.body.appendChild(this.menu);

        const button = document.createElement('button');
        button.textContent = '☰';
        button.onclick = (e) => {
            e.stopPropagation();
            this.toggleMenu();
        };
        this.menu.appendChild(button);

        this.content.style.display = 'none';
        this.menu.appendChild(this.content);

        this.createServerUrlInput();
        this.createChannelSelect();
        this.createFileInput();

        // メニュー内のクリックイベントの伝播を停止
        this.menu.addEventListener('click', (e) => e.stopPropagation());
    }

    private toggleMenu(): void {
        this.content.style.display = this.content.style.display === 'none' ? 'block' : 'none';
    }

    private createServerUrlInput(): void {
        const label = document.createElement('label');
        label.textContent = 'Server URL: ';
        this.content.appendChild(label);

        this.serverUrlInput.type = 'text';
        this.serverUrlInput.value = this.serverUrl;
        this.serverUrlInput.onchange = () => this.updateSettings();
        this.content.appendChild(this.serverUrlInput);
        this.content.appendChild(document.createElement('br'));
    }

    private createChannelSelect(): void {
        const label = document.createElement('label');
        label.textContent = 'Channel: ';
        this.content.appendChild(label);

        this.channelSelect.onchange = () => this.updateSettings();
        this.content.appendChild(this.channelSelect);
        this.content.appendChild(document.createElement('br'));
    }

    private createFileInput(): void {
        const label = document.createElement('label');
        label.textContent = 'Upload File: ';
        this.content.appendChild(label);

        this.fileInput.type = 'file';
        this.fileInput.onchange = async (event) => {
            const files = (event.target as HTMLInputElement).files;
            if (files && files.length > 0 && this.uploadCallback) {
                await this.uploadCallback(files[0]);
            }
        };
        this.content.appendChild(this.fileInput);
        this.content.appendChild(document.createElement('br'));
    }

    private async loadChannelList(): Promise<void> {
        try {
            const channels = await this.apiClient.getChannelList();
            this.channelSelect.innerHTML = ''; // Clear existing options
            channels.forEach((channel: string) => {
                const option = document.createElement('option');
                option.value = channel;
                option.textContent = channel;
                this.channelSelect.appendChild(option);
            });
            this.channelSelect.value = this.channel;
        } catch (error) {
            console.error('Failed to load channel list:', error);
            // Add a default option if loading fails
            const option = document.createElement('option');
            option.value = this.channel;
            option.textContent = this.channel || 'Default Channel';
            this.channelSelect.appendChild(option);
        }
    }

    private updateSettings(): void {
        const newServerUrl = this.serverUrlInput.value;
        const newChannel = this.channelSelect.value;
        this.serverUrl = newServerUrl;
        this.channel = newChannel;
        localStorage.setItem("defaultServer", newServerUrl);
        localStorage.setItem("Channel", newChannel);
        if (this.changeCallback) {
            this.changeCallback(newServerUrl, newChannel);
        }
    }

    isMenuOpen(): boolean {
        return this.content.style.display === 'block';
    }
}
class SimpleViewer {
    private urlList: string[] = [];
    private currentIndex: number = 0;
    private apiClient: ApiClient;
    private viewerElement: HTMLElement;
    private imageElement: HTMLImageElement;

    constructor(private serverUrl: string, private channel: string) {
        this.apiClient = new ApiClient(serverUrl);
        this.viewerElement = document.createElement('div');
        this.viewerElement.id = 'viewer';
        this.viewerElement.style.position = 'fixed';
        this.viewerElement.style.top = '0';
        this.viewerElement.style.left = '0';
        this.viewerElement.style.width = '100%';
        this.viewerElement.style.height = '100%';
        this.viewerElement.style.display = 'flex';
        this.viewerElement.style.justifyContent = 'center';
        this.viewerElement.style.alignItems = 'center';
        this.viewerElement.style.overflow = 'hidden';
        document.body.appendChild(this.viewerElement);

        this.imageElement = document.createElement('img');
        this.imageElement.style.maxWidth = '100%';
        this.imageElement.style.maxHeight = '100%';
        this.imageElement.style.objectFit = 'contain';
        this.viewerElement.appendChild(this.imageElement);
    }

    async initialize(): Promise<void> {
        await this.loadUrls();
        this.render();
    }

    async updateSettings(newServerUrl: string, newChannel: string): Promise<void> {
        this.serverUrl = newServerUrl;
        this.channel = newChannel;
        this.apiClient = new ApiClient(newServerUrl);
        await this.loadUrls();
        this.render();
    }

    private async loadUrls(): Promise<void> {
        try {
            this.urlList = await this.apiClient.getUrls(this.channel);
            this.currentIndex = 0;
        } catch (error) {
            console.error('Failed to load URLs:', error);
            this.urlList = [];
        }
    }

    private render(): void {
        console.log(`Rendering viewer with:
            Server: ${this.serverUrl}
            Channel: ${this.channel}
            Current URL: ${this.urlList[this.currentIndex] || 'No URL'}`);

        if (this.urlList.length > 0) {
            this.imageElement.src = this.urlList[this.currentIndex];
            this.imageElement.onload = this.adjustWindowSize.bind(this);
            this.imageElement.style.display = 'block';
            this.viewerElement.textContent = '';
            this.viewerElement.appendChild(this.imageElement);
        } else {
            this.imageElement.style.display = 'none';
            this.viewerElement.textContent = 'No images available';
        }
    }

    private adjustWindowSize(): void {
        const img = this.imageElement;
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (windowWidth / windowHeight > aspectRatio) {
            window.resizeTo(windowHeight * aspectRatio, windowHeight);
        } else {
            window.resizeTo(windowWidth, windowWidth / aspectRatio);
        }
    }

    nextImage(): void {
        if (this.urlList.length > 0) {
            this.currentIndex = (this.currentIndex + 1) % this.urlList.length;
            this.render();
        }
    }
}

class App {
    private viewer: SimpleViewer;
    private menu: HamburgerMenu;
    private apiClient: ApiClient;

    constructor() {
        const server_url = localStorage.getItem("defaultServerStanding") || "http://localhost:8080";
        const channel = localStorage.getItem("Channel") || "default-channel";

        this.apiClient = new ApiClient(server_url);
        this.viewer = new SimpleViewer(server_url, channel);
        this.menu = new HamburgerMenu(server_url, channel);
    }

    async initialize(): Promise<void> {
        await this.viewer.initialize();
        await this.menu.initialize();

        this.menu.onSettingsChange(async (newServerUrl, newChannel) => {
            await this.viewer.updateSettings(newServerUrl, newChannel);
        });

        this.menu.onFileUpload(async (file) => {
            await this.uploadFile(file);
        });

        document.addEventListener('click', (e: MouseEvent) => {
            if (!this.menu.isMenuOpen() && !this.isClickInsideMenu(e)) {
                this.viewer.nextImage();
            }
        });
    }

    private isClickInsideMenu(e: MouseEvent): boolean {
        const menuElement = document.getElementById('hamburger-menu');
        return menuElement ? menuElement.contains(e.target as Node) : false;
    }

    async uploadFile(file: File): Promise<void> {
        try {
            const result = await this.apiClient.uploadFile(localStorage.getItem("Channel") || "default-channel", file);
            console.log('File uploaded:', result);
            await this.viewer.updateSettings(this.apiClient.baseUrl, localStorage.getItem("Channel") || "default-channel");
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    }
}
// index.ts の末尾に追加
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.log('Service Worker registration failed:', error);
        });
    });
  }
// アプリケーションの初期化
window.addEventListener("DOMContentLoaded", async () => {
    const app = new App();
    await app.initialize();
});