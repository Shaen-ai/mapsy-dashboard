/**
 * Wix Authentication Service for Dashboard
 * Uses Wix SDK with dashboard.auth() and dashboard.host() for authenticated requests
 */

import { createClient } from '@wix/sdk';
import { dashboard } from '@wix/dashboard';

interface WixAuthState {
  instanceToken: string | null;
  compId: string | null;
  decodedInstance: any | null;
  isAuthenticated: boolean;
}

let wixClient: ReturnType<typeof createClient> | null = null;
let isInitialized = false;

class WixAuthService {
  private state: WixAuthState = {
    instanceToken: null,
    compId: null,
    decodedInstance: null,
    isAuthenticated: false,
  };

  /**
   * Initialize authentication from URL parameters and Wix SDK
   */
  initializeFromUrl(): WixAuthState {
    const urlParams = new URLSearchParams(window.location.search);
    const instanceToken = urlParams.get('instance');
    const compId = urlParams.get('compId');

    // Store URL params
    this.state.instanceToken = instanceToken;
    this.state.compId = compId;

    if (instanceToken) {
      this.state.isAuthenticated = true;
      console.log('[WixAuth] Instance token found in URL');
    }

    if (compId) {
      console.log('[WixAuth] Component ID:', compId);
    }

    // Initialize Wix SDK
    this.initializeWixClient();

    return this.state;
  }

  /**
   * Initialize Wix client with dashboard.auth() and dashboard.host()
   */
  private async initializeWixClient(): Promise<void> {
    if (isInitialized && wixClient) {
      console.log('[WixAuth] Wix client already initialized');
      return;
    }

    try {
      console.log('[WixAuth] Initializing Wix SDK...');
      console.log('[WixAuth] dashboard.auth available:', !!dashboard.auth);
      console.log('[WixAuth] dashboard.host available:', !!dashboard.host);

      // Create Wix client with dashboard auth and host
      wixClient = createClient({
        auth: dashboard.auth(),
        host: dashboard.host(),
      });

      isInitialized = true;
      console.log('[WixAuth] Wix client created successfully');
      console.log('[WixAuth] fetchWithAuth available:', typeof wixClient.fetchWithAuth);
    } catch (error) {
      console.error('[WixAuth] Failed to initialize Wix client:', error);
      // Continue without Wix SDK - will fallback to URL instance token
    }
  }

  /**
   * Fetch with Wix authentication
   * Uses wixClient.fetchWithAuth() to automatically include access token
   */
  async fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
    console.log('[WixAuth] fetchWithAuth to:', url);

    const headers: Record<string, string> = {
      ...(options?.headers as Record<string, string>),
    };

    // Add compId header if available
    if (this.state.compId) {
      headers['X-Wix-Comp-Id'] = this.state.compId;
      console.log('[WixAuth] Added X-Wix-Comp-Id header:', this.state.compId);
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    const isFormData = options?.body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const fetchOptions: RequestInit = {
      ...options,
      headers,
    };

    // Use Wix authenticated fetch if available
    if (wixClient && wixClient.fetchWithAuth) {
      console.log('[WixAuth] Using wixClient.fetchWithAuth...');
      try {
        const response = await wixClient.fetchWithAuth(url, fetchOptions);
        console.log('[WixAuth] fetchWithAuth response:', response.status);
        return response;
      } catch (error: any) {
        console.error('[WixAuth] wixClient.fetchWithAuth failed:', error?.message);
        console.log('[WixAuth] Falling back to manual token...');
      }
    }

    // Fallback: Add instance token manually
    if (this.state.instanceToken) {
      // Check if token already has a prefix (OauthNG.JWS. or Bearer)
      if (this.state.instanceToken.startsWith('OauthNG.') || this.state.instanceToken.startsWith('Bearer ')) {
        headers['Authorization'] = this.state.instanceToken;
      } else {
        headers['Authorization'] = `Bearer ${this.state.instanceToken}`;
      }
      console.log('[WixAuth] Added manual Authorization header');
    }

    console.log('[WixAuth] Using regular fetch...');
    const response = await fetch(url, {
      ...options,
      headers,
    });
    console.log('[WixAuth] Response:', response.status);
    return response;
  }

  /**
   * Get the current authentication state
   */
  getState(): WixAuthState {
    return { ...this.state };
  }

  /**
   * Get instance token for API calls (fallback)
   */
  getInstanceToken(): string | null {
    return this.state.instanceToken;
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
    console.log('[WixAuth] Component ID set:', compId);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  /**
   * Get decoded instance data
   */
  getDecodedInstance(): any | null {
    return this.state.decodedInstance;
  }

  /**
   * Build URL with current instance and optional compId
   */
  buildUrl(baseUrl: string, compId?: string): string {
    if (!this.state.instanceToken) {
      return baseUrl;
    }

    const url = new URL(baseUrl, window.location.origin);
    url.searchParams.set('instance', this.state.instanceToken);

    if (compId) {
      url.searchParams.set('compId', compId);
    }

    return url.toString();
  }

  /**
   * Navigate to widget-specific view
   */
  navigateToWidget(compId: string): void {
    if (!this.state.instanceToken) {
      console.error('[WixAuth] Cannot navigate without instance token');
      return;
    }

    const url = this.buildUrl(window.location.pathname, compId);
    window.location.href = url;
  }

  /**
   * Navigate back to widget list
   */
  navigateToWidgetList(): void {
    if (!this.state.instanceToken) {
      console.error('[WixAuth] Cannot navigate without instance token');
      return;
    }

    const url = this.buildUrl(window.location.pathname);
    window.location.href = url;
  }
}

// Export singleton instance
export const wixAuth = new WixAuthService();
