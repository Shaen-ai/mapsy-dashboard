import { jwtDecode } from 'jwt-decode';

interface WixAuthState {
  instanceToken: string | null;
  compId: string | null;
  decodedInstance: any | null;
  isAuthenticated: boolean;
}

class WixAuthService {
  private state: WixAuthState = {
    instanceToken: null,
    compId: null,
    decodedInstance: null,
    isAuthenticated: false,
  };

  /**
   * Initialize authentication from URL parameters
   */
  initializeFromUrl(): WixAuthState {
    const urlParams = new URLSearchParams(window.location.search);
    const instanceToken = urlParams.get('instance');
    const compId = urlParams.get('compId');

    if (!instanceToken) {
      console.warn('[WixAuth] No instance token found in URL');
      return this.state;
    }

    try {
      // Decode instance token (client-side only for display, NEVER trust for security)
      const decoded = jwtDecode(instanceToken);
      console.log('[WixAuth] Decoded instance (client-side, unsigned):', decoded);

      this.state = {
        instanceToken,
        compId,
        decodedInstance: decoded,
        isAuthenticated: true,
      };

      console.log('[WixAuth] Authentication initialized');
      if (compId) {
        console.log('[WixAuth] Component ID:', compId);
      }

      return this.state;
    } catch (error) {
      console.error('[WixAuth] Failed to decode instance token:', error);
      return this.state;
    }
  }

  /**
   * Get the current authentication state
   */
  getState(): WixAuthState {
    return { ...this.state };
  }

  /**
   * Get instance token for API calls
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
