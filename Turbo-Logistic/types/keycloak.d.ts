declare module 'keycloak-js' {
    interface KeycloakInstance {
      init(options: any): Promise<boolean>;
      tokenParsed: any;
    }
  
    const Keycloak: (config: any) => KeycloakInstance;
    export default Keycloak;
  }