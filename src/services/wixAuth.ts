/**
 * Wix Authentication Service for Dashboard
 * Uses Wix SDK with dashboard.auth() and dashboard.host() for authenticated requests
 */

import { createClient } from '@wix/sdk';
import { dashboard } from '@wix/dashboard';

interface WixAuthState {
  instanceToken: string | null;
  compId: string | null;
  isAuthenticated: boolean;
}

let wixClient: ReturnType<typeof createClient> | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

class WixAuthService {
  private state: WixAuthState = {
    instanceToken: null,
    compId: null,
    isAuthenticated: false,
  };

  /**
   * Initialize authentication from URL parameters and Wix SDK
   */
  async initializeFromUrl(): Promise<WixAuthState> {
    const urlParams = new URLSearchParams(window.location.search);
    const instanceToken = urlParams.get('instance');
    const compId = urlParams.get('compId');

    this.state.instanceToken = instanceToken;
    this.state.compId = compId;

    if (instanceToken) {
      this.state.isAuthenticated = true;
    }

    await this.initializeWixClient();

    return this.state;
  }

  /**
   * Initialize Wix client with dashboard.auth() and dashboard.host()
   */
  private async initializeWixClient(): Promise<void> {
    if (isInitialized && wixClient) {
      return;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = (async () => {
      try {
        wixClient = createClient({
          auth: dashboard.auth(),
          host: dashboard.host(),
        });
        isInitialized = true;
      } catch (error) {
        console.error('[WixAuth] Failed to initialize Wix client:', error);
      }
    })();

    return initializationPromise;
  }

  /**
   * Fetch with Wix authentication
   */
  async fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    if (this.state.compId) {
      headers['X-Wix-Comp-Id'] = this.state.compId;
    }

    const isFormData = options?.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    if (wixClient && wixClient.fetchWithAuth) {
      try {
        return await wixClient.fetchWithAuth(url, fetchOptions);
      } catch (error: any) {
        console.error('[WixAuth] fetchWithAuth failed, using fallback:', error?.message);
      }
    }

    if (this.state.instanceToken) {
      if (this.state.instanceToken.startsWith('OauthNG.') || this.state.instanceToken.startsWith('Bearer ')) {
        headers['Authorization'] = this.state.instanceToken;
      } else {
        headers['Authorization'] = `Bearer ${this.state.instanceToken}`;
      }
    }

    return fetch(url, { ...options, headers });
  }

  /**
   * Get component ID
   */
  getCompId(): string | null {
    return this.state.compId;
  }

  /**
   * Set component ID (used when user selects a widget from the selector)
   */
  setCompId(compId: string): void {
    this.state.compId = compId;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }
}

export const wixAuth = new WixAuthService();
